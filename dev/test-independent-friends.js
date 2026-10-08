#!/usr/bin/env node
/* Friends for independent students: the safeguards live in SQL, so check
   the migrations say what they must, then the renderer and its calls. */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// 1. Migrations.
const dir = 'supabase/migrations/';
const tables = fs.readFileSync(dir + '20261008162807_independent_friends.sql', 'utf8');
const read = fs.readFileSync(dir + '20261008163725_independent_friends_read.sql', 'utf8');
const actionsFile = fs.readdirSync(dir).find(f => /_independent_friends_actions\.sql$/.test(f));
assert(actionsFile, 'the actions migration exists');
const actions = fs.readFileSync(dir + actionsFile, 'utf8');
const all = tables + read + actions;

assert(/insert into public\.app_flags \(key, enabled\) values \('independent_friends', false\)/.test(tables), 'the feature is stored switched off');
assert(/on conflict \(key\) do nothing/.test(tables), 're-running the migration never switches it back on or off');
assert(/coalesce\(\(select f\.enabled from public\.app_flags f where f\.key = 'independent_friends'\), false\)/.test(tables), 'the caller check reads the switch');
assert(/auth\.uid\(\) is not null/.test(tables) && /s\.class_id is null/.test(tables), 'signed-in accounts with an independent row only');
const fns = ['get_independent_friends', 'set_independent_friends', 'new_independent_friend_code', 'send_independent_friend_request', 'respond_independent_friend_request', 'remove_independent_friend'];
fns.forEach(fn => {
  const body = all.slice(all.indexOf('function public.' + fn + '('));
  assert(body.length > 30, fn + ' is defined');
  assert(/v_me uuid := public\.forge_independent_friend_caller\(\);/.test(body.slice(0, 600)), fn + ' goes through the switch and identity check');
  assert(new RegExp('revoke all on function public\\.' + fn + '\\([^)]*\\) from public, anon;').test(all), fn + ' is not callable anonymously');
});
['independent_friend_profiles', 'independent_friendships', 'app_flags'].forEach(t => {
  assert(new RegExp('alter table public\\.' + t + ' enable row level security;').test(tables), t + ' has RLS on');
  assert(new RegExp('revoke all on public\\.' + t + ' from public, anon, authenticated;').test(tables), t + ' is not directly readable');
});
assert(/if not coalesce\(p_over_13, false\) then return json_build_object\('result', 'age_required'\)/.test(actions), 'switching on needs the 13+ confirmation');
assert(/delete from public\.independent_friend_profiles p where p\.user_id = v_me;/.test(actions), 'switching off removes the profile, and with it every friendship');
assert(/c_max_failures constant integer := 10;/.test(actions) && /interval '1 hour'/.test(actions), 'failed codes are limited per hour');
assert(/c_max_pending constant integer := 5;/.test(actions), 'waiting requests are limited');
const outgoing = read.slice(read.indexOf("'outgoing'"));
assert(!/name/.test(outgoing.slice(0, outgoing.indexOf('), \'[]\'::json)'))), 'a pending request never reveals the other student\'s name');

// 2. Renderer.
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('scripts/forge-ranks.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('scripts/forge-independent-friends.js', 'utf8'), ctx);
const F = ctx.ForgeIndependentFriends;
assert.strictEqual(F.formatCode('ABCDEFGH'), 'ABCD-EFGH');
assert.strictEqual(F.settingsHtml(null), '');
assert.strictEqual(F.settingsHtml({ available: false }), '', 'switched off site-wide: no settings section');
assert.strictEqual(F.homeHtml({ available: true, enabled: false }), '', 'not opted in: nothing on Home');
const off = F.settingsHtml({ available: true, enabled: false, suggested_name: '"><img src=x>' });
assert(off.includes('I’m 13 or older') && off.includes('id="friends-age"'), 'switching on asks for 13+');
assert(!off.includes('<img'), 'suggested name is escaped');
assert(!/id="friends-age"[^>]*checked/.test(off), 'the 13+ box starts unticked');
const on = F.settingsHtml({ available: true, enabled: true, code: 'ABCDEFGH', name: 'Jo B.' });
assert(on.includes('ABCD-EFGH') && on.includes('Make a new code') && on.includes('Turn off friends'));
const home = F.homeHtml({ available: true, enabled: true,
  friends: [{ friendship_id: 'f1', name: 'Sam <K.>', xp_week: 40, xp_total: 1600, accuracy: 80, streak: 3 }],
  incoming: [{ friendship_id: 'f2', name: 'Ria P.' }],
  outgoing: [{ friendship_id: 'f3', created_at: '2026-10-08T10:00:00Z' }] });
assert(home.includes('Sam &lt;K.&gt;') && !home.includes('<K.>'), 'friend names are escaped');
assert(home.includes('Ria P.</strong> wants to be friends') && home.includes('data-ifriend-accept="f2"'));
assert(home.includes('waiting for a reply') && home.includes('data-ifriend-remove="f3"'), 'a sent request shows no name, and can be cancelled');
assert(home.includes('forge-frame--silver'), 'a friend’s rank frame comes from their total XP');
assert(home.includes('40 XP this week · 80% accuracy · 3-day streak'));
assert(F.message('code_not_recognised').includes('didn’t work') && F.message('anything else') === F.message('error'));

// 3. Calls: signed out, nothing is requested.
let calls = [];
ctx.ForgeAPI = { rpc(name, body, opts) { calls.push([name, JSON.parse(JSON.stringify(body)), opts.token]); return Promise.resolve(name === 'get_independent_friends' ? { available: true, enabled: true, code: 'ABCDEFGH', name: 'Jo', friends: [], incoming: [], outgoing: [] } : { result: 'requested' }); } };
ctx.ForgeAuth = { hasSession: () => false, accessToken: () => null };
(async () => {
  assert.strictEqual(await F.load(), null, 'signed out: no request, no card');
  assert.strictEqual(calls.length, 0);
  ctx.ForgeAuth = { hasSession: () => true, accessToken: () => 'tok' };
  const data = await F.load();
  assert(data.enabled && calls[0][0] === 'get_independent_friends' && calls[0][2] === 'tok', 'uses the account’s own token');
  console.log('Independent friends tests passed (switch off by default, 13+, codes only, no names before accepting, escaping).');
})().catch(e => { console.error(e); process.exit(1); });
