#!/usr/bin/env node
/* Class friends: SQL keeps the shared metric rules and locks the table down;
   the card renders every state and escapes names. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const sql = fs.readFileSync('supabase/migrations/20260928130000_class_friends.sql', 'utf8');
// Same XP rules as calcXP and the league (both the weekly and total sums).
['ANVIL\' then case when r.is_correct then 30 else 0 end', 'CRU\' and r.is_correct then 30',
 'reforge_attempted and r.reforge_correct then 20', 'is_correct and not coalesce(r.reforge_attempted, false) then 10']
  .forEach(rule => assert.strictEqual(sql.split(rule).length - 1, 2, 'friends SQL should apply XP rule twice: ' + rule));
// Accuracy excludes repair attempts, like ForgeMetrics.accuracy.
assert(/filter \(where not coalesce\(r\.reforge_attempted, false\)\)::int as answered/.test(sql));
// Locked down: RLS on, no direct grants, helper not callable from the API.
assert(/alter table public\.student_friendships enable row level security/.test(sql));
assert(/revoke all on table public\.student_friendships from anon, authenticated/.test(sql));
assert(!/create policy/i.test(sql), 'no policies: the table is reachable only through the functions');
assert(/revoke all on function public\.forge_verify_class_student\(text, text, text, text\) from public, anon, authenticated/.test(sql));
// Same class only, and a cap on unanswered requests.
assert(/s\.class_id = v_me\.class_id and s\.id <> v_me\.id;\n  if v_target is null then return 'not_in_class'/.test(sql));
assert(/if v_pending >= 20 then return 'too_many_pending'/.test(sql));

// Name-only classes cannot use the consent-dependent friend RPCs. The old
// implementations are renamed and lose their client grants; all three public
// entry points check that every pupil has an active individual code.
const guardSql = fs.readFileSync('supabase/migrations/20260929181805_pause_class_friends_until_student_codes.sql', 'utf8');
['get_class_friends', 'send_friend_request', 'respond_friend_request'].forEach(name => {
  assert(guardSql.includes('rename to ' + name + '_unchecked;'), name + ' old implementation is private');
  assert(new RegExp('revoke all on function public\\.' + name + '_unchecked\\(').test(guardSql), name + ' unchecked grants removed');
});
assert(/not exists \(\s*select 1 from public\.students s\s*where s\.class_id = p_class_id\s*and not exists \(\s*select 1 from public\.student_access_codes ac\s*where ac\.class_id = p_class_id and ac\.student_id = s\.id and ac\.active/.test(guardSql), 'every student needs an active code');
assert.strictEqual((guardSql.match(/if not public\.forge_class_friends_ready\(v_me\.class_id\) then/g) || []).length, 3, 'read, send and respond all fail closed');
assert(/return json_build_object\('enabled', false, 'reason', 'codes_required'\)/.test(guardSql), 'student gets a clear paused state');
const optInSql = fs.readFileSync('supabase/migrations/20260929190020_friends_teacher_opt_in.sql', 'utf8');
assert(/alter table public\.classes alter column friends_enabled set default false/.test(optInSql), 'new classes start with friends off');
assert(/update public\.classes set friends_enabled = false where friends_enabled/.test(optInSql), 'existing classes are switched off');
assert(/return 'request_waiting_for_you'/.test(optInSql), 'sending cannot implicitly accept an incoming request');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-league.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('scripts/forge-friends.js', 'utf8'), ctx);
const F = ctx.ForgeFriends;

assert.strictEqual(F.html(null), '', 'missing function: no card');
assert.strictEqual(F.html({ enabled: false }), '', 'switched off by the teacher: no card');
assert(F.html({ enabled: false, reason: 'codes_required' }).includes('private student code'), 'name-only class shows a paused explanation');

const empty = F.html({ enabled: true, friends: [], incoming: [], outgoing: [], classmates: [{ student_id: 's2', name: 'Sam <K>' }] });
assert(empty.includes('Add classmates') && empty.includes('Sam &lt;K&gt;') && empty.includes('data-friend-add'), 'empty state offers classmates, escaped');

const full = F.html({ enabled: true,
  friends: [{ student_id: 's3', name: 'Jess Best', xp_week: 120, accuracy: 78, streak: 4 }, { student_id: 's4', name: 'New', xp_week: 0, accuracy: null, streak: 0 }],
  incoming: [{ student_id: 's5', name: 'Ali' }], outgoing: [{ student_id: 's6', name: 'Mo' }], classmates: [] });
assert(full.includes('120 XP this week · 78% accuracy · 4-day streak'), 'friend stats: weekly XP, accuracy, streak');
assert(full.includes('0 XP this week · no answers yet') && !full.includes('0-day'), 'no accuracy or streak shown when there is none');
assert(full.includes('Ali</strong> wants to be friends') && full.includes('data-friend-accept="s5"'), 'incoming request can be accepted');
assert(full.includes('weekly and total XP, answer count, accuracy and streak') && full.includes('aria-describedby="forge-friends-sharing"'), 'accepting explains which data is shared');
assert(full.includes('Waiting for Mo') && full.includes('Cancel'), 'outgoing request can be withdrawn');
assert(!full.includes('data-friend-add'), 'no add form when every classmate is already linked');

// Teacher read access: select only, authenticated only, scoped to own classes.
const tsql = fs.readFileSync('supabase/migrations/20260928140000_teacher_read_class_friendships.sql', 'utf8').replace(/--.*$/gm, '');
assert(/grant select on table public\.student_friendships to authenticated;/.test(tsql));
assert(!/\banon\b/.test(tsql), 'anon gets nothing');
assert(!/grant (insert|update|delete|all)/i.test(tsql) && !/for (insert|update|delete|all)/i.test(tsql), 'teachers can only read');
assert(/using \(class_id in \(select c\.id from public\.classes c where c\.teacher_user_id = auth\.uid\(\)\)\)/.test(tsql), 'scoped to the teacher\'s own classes');

// Teacher views.
const students = [{ id: 'a', name: 'Jess Best' }, { id: 'b', name: 'Mike' }, { id: 'c', display_name: 'Ali <R>' }, { id: 'd', name: 'Mo' }];
const rows = [
  { requester_id: 'a', addressee_id: 'b', status: 'accepted' },
  { requester_id: 'c', addressee_id: 'a', status: 'accepted' },
  { requester_id: 'd', addressee_id: 'b', status: 'pending' }
];
const th = F.teacherHtml(students, rows, true);
assert(th.includes('2 friendships · 1 request waiting'), 'summary counts pairs and pending requests');
assert(th.includes('Friends with Ali &lt;R&gt;, Mike'), 'each student listed once with their friends, escaped');
assert(th.includes('Mo → Mike'), 'pending requests show who asked whom');
assert(th.includes('Friends on') && F.teacherHtml(students, rows, false).includes('Friends off'));
assert(F.teacherHtml(students, rows, true, false, true).includes('Friends paused'), 'teacher sees the class-wide code pause');
assert(F.teacherHtml(students, rows, false).includes('The teacher chooses whether this class can use friends'), 'teacher sees the sharing scope');
assert(F.teacherHtml(students, [], true).includes('No friend connections'), 'empty class');
assert(F.teacherHtml(students, [], true, true).includes('Couldn’t load friendships') && !F.teacherHtml(students, [], true, true).includes('No friend connections'), 'read failure is not shown as an empty class');
const sp = F.teacherStudentHtml(students, rows, 'b');
assert(sp.includes('Jess Best') && sp.includes('Mo has sent a request'), 'student profile shows friends and requests to them');
assert(F.teacherStudentHtml(students, rows, 'd').includes('Waiting for Mike to accept'), 'and requests they sent');
assert(F.teacherStudentHtml(students, [], 'd', true).includes('Couldn’t load friendships'), 'student profile also reports a failed read');

assert(!/<select id="friend-pick" required/.test(full + empty), 'no browser-native required bubble on the classmate picker');

console.log('Friends tests passed (SQL metric rules, locked-down table, same-class check, card states, escaping).');
