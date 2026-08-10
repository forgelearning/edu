#!/usr/bin/env node
/* Convert remaining developer-authored inline click attributes into the
 * shared data-action contract. Dynamic handlers keep their arguments as
 * data attributes; execution stays in forge-page-actions.js. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(root).filter(name => name.endsWith('.html'));

const rules = [
  [/onclick="\(function\(\)\{var h=document\.documentElement,b=document\.querySelector\('\.theme-toggle'\);[^\"]*?\}\)\(\)"/g, 'data-forge-action="theme"'],
  [/onclick="window\.forgeManageAnalytics\(\)"/g, 'data-forge-action="analytics-settings"'],
  [/onclick="window\._openCreatedDash\(\)"/g, 'data-forge-action="created-dashboard"'],
  [/onclick="copyClassCode\(this\)"/g, 'data-forge-action="copy-class-code"'],
  [/onclick="renderTeacherHome\(\)"/g, 'data-forge-action="render-teacher-home"'],
  [/onclick="renderAnvilHome\(\)"/g, 'data-forge-action="anvil-home"'],
  [/onclick="document\.getElementById\('class-link-form'\)\.style\.display=document\.getElementById\('class-link-form'\)\.style\.display==='none'\?'block':'none'"/g, 'data-forge-action="toggle-class-link"'],
  [/onclick="\(function\(\)\{ state\.isPaid=false; state\.isTrial=false; state\.phase='subjects'; render\(\); \}\)\(\)"/g, 'data-forge-action="quiz-free-tier"'],
  [/onclick="\(function\(\)\{state\.phase='banks';render\(\);\}\)\(\)"/g, 'data-forge-action="quiz-back-banks"'],
  [/onclick="\(function\(\)\{state\.phase='subjects';render\(\);\}\)\(\)"/g, 'data-forge-action="quiz-subjects"'],
  [/onclick="\(function\(\)\{state\.mrState=\{submitted:\{\},tfSel:\{\},mcqSel:\{\},correct:0,total:'\+qs\.length\+',passageIdx:0\};render\(\);\}\)\(\)"/g, 'data-forge-action="mr-reset"'],
  [/oninput="mrFindInput\(\\'\+q\.id\+\\'\)"/g, 'data-forge-action="mr-find-input" data-question-id="\'+q.id+\'"'],
  [/onclick="mrSelectTF\('\+q\.id\+', '\+v\+'\)"/g, 'data-forge-action="mr-select-tf"'],
  [/onclick="mrSelectTF\(\\'\+q\.id\+\\',\\'\+v\+\\'\)"/g, 'data-forge-action="mr-select-tf" data-question-id="\'+q.id+\'" data-value="\'+v+\'"'],
  [/onclick="mrSelectMCQ\(\\'\+q\.id\+\\',\\'\+o\.k\+\\'\)"/g, 'data-forge-action="mr-select-mcq" data-question-id="\'+q.id+\'" data-letter="\'+o.k+\'"'],
  [/onclick="mrSubmit\(\\'\+q\.id\+\\'\)"/g, 'data-forge-action="mr-submit" data-question-id="\'+q.id+\'"'],
  [/onclick="showStarterFor\(\\' \+ tag \+ \\'\)"/g, 'data-forge-action="show-starter" data-tag="\'+tag+\'"'],
  [/onclick="showStarterFor\(\\'\+ tag \+ \\'\)"/g, 'data-forge-action="show-starter" data-tag="\'+tag+\'"'],
  [/onclick="renderStarters\(dashState\.wrongResponses\|\|\[\]\)"/g, 'data-forge-action="render-starters"'],
  [/onclick="renderStudent\(\\'\+row\.id\+\\'\)"/g, 'data-forge-action="render-student" data-student-id="\'+row.id+\'"'],
  [/onclick="renderStudent\(\\'\+sid\+\\'\)"/g, 'data-forge-action="render-student" data-student-id="\'+sid+\'"'],
  [/onclick="switchTab\(\\'([^']+)\\',this\)"/g, 'data-forge-action="switch-tab" data-tab="$1"'],
  [/onclick="startRework\(\\'\+m\.tag\+\\'\)"/g, 'data-forge-action="anvil-rework" data-tag="\'+m.tag+\'"'],
  [/onclick="startRework\(\\'\+m\.tag\+\\'\)"/g, 'data-forge-action="anvil-rework" data-tag="\'+m.tag+\'"'],
  [/onclick="startRework\(\\'\+m\.tag\+\\'\)"/g, 'data-forge-action="anvil-rework" data-tag="\'+m.tag+\'"'],
  [/onclick="renderStudent\(\\'\s*\+\s*(row\.id|sid)\s*\+\s*\\'\)"/g, 'data-forge-action="render-student" data-student-id="\'+$1+\'"'],
  [/onclick="showStarterFor\(\\'\s*\+\s*tag\s*\+\s*\\'\)"/g, 'data-forge-action="show-starter" data-tag="\'+tag+\'"'],
  [/onclick="mrSelectTF\(\\'\s*\+\s*q\.id\s*\+\\'\s*,\\'\s*\+\s*v\s*\+\\'\)"/g, 'data-forge-action="mr-select-tf" data-question-id="\'+q.id+\'" data-value="\'+v+\'"'],
  [/onclick="mrSelectMCQ\(\\'\s*\+\s*q\.id\s*\+\\'\s*,\\'\s*\+\s*o\.k\s*\+\\'\)"/g, 'data-forge-action="mr-select-mcq" data-question-id="\'+q.id+\'" data-letter="\'+o.k+\'"'],
  [/onclick="mrSubmit\(\\'\s*\+\s*q\.id\s*\+\\'\)"/g, 'data-forge-action="mr-submit" data-question-id="\'+q.id+\'"'],
  [/onclick="document\.getElementById\\(\\'class-link-form\\'\\)\.style\.display=document\.getElementById\\(\\'class-link-form\\'\\)\.style\.display===\\'none\\'\?\\'block\\':\\'none\\'"/g, 'data-forge-action="toggle-class-link"'],
  [/onclick="\(function\(\)\{state\.phase=\\'banks\\';render\(\);\}\)\(\)"/g, 'data-forge-action="quiz-back-banks"'],
  [/onclick="\(function\(\)\{state\.phase=\\'subjects\\';render\(\);\}\)\(\)"/g, 'data-forge-action="quiz-subjects"'],
  [/onclick="\(function\(\)\{ state\.isPaid=false; state\.isTrial=false; state\.phase=\\'subjects\\'; render\(\); \}\)\(\)"/g, 'data-forge-action="quiz-free-tier"'],
  [/onclick="\(function\(\)\{state\.mrState=\{submitted:\{\},tfSel:\{\},mcqSel:\{\},correct:0,total:'\+qs\.length\+',passageIdx:0\};render\(\);\}\)\(\)"/g, 'data-forge-action="mr-reset"'],
];

let changed = 0;
for (const name of files) {
  const file = path.join(root, name);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [pattern, replacement] of rules) after = after.replace(pattern, replacement);
  after = after.replace(/onclick="([^"]*)"/g, function (full, code) {
    if (code.indexOf('renderStudent(') >= 0) {
      var studentExpr = code.match(/renderStudent\(([^)]*)\)/)[1].replace(/^\\'/, '').replace(/\\'$/, '');
      return 'data-forge-action="render-student" data-student-id="' + studentExpr + '"';
    }
    if (code.indexOf('showStarterFor(') >= 0) {
      var tagExpr = code.match(/showStarterFor\(([^)]*)\)/)[1].replace(/^\\'/, '').replace(/\\'$/, '');
      return 'data-forge-action="show-starter" data-tag="' + tagExpr + '"';
    }
    if (code.indexOf('startRework(') >= 0) {
      var reworkExpr = code.match(/startRework\(([^)]*)\)/)[1].replace(/^\\'/, '').replace(/\\'$/, '');
      return 'data-forge-action="anvil-rework" data-tag="' + reworkExpr + '"';
    }
    if (code.indexOf('mrSelectTF(') >= 0) {
      var tf = code.match(/mrSelectTF\(([^,]+),([^)]*)\)/);
      return 'data-forge-action="mr-select-tf" data-question-id="' + tf[1].replace(/^\\'/, '').replace(/\\'$/, '') + '" data-value="' + tf[2].replace(/^\\'/, '').replace(/\\'$/, '') + '"';
    }
    if (code.indexOf('mrSelectMCQ(') >= 0) {
      var mcq = code.match(/mrSelectMCQ\(([^,]+),([^)]*)\)/);
      return 'data-forge-action="mr-select-mcq" data-question-id="' + mcq[1].replace(/^\\'/, '').replace(/\\'$/, '') + '" data-letter="' + mcq[2].replace(/^\\'/, '').replace(/\\'$/, '') + '"';
    }
    if (code.indexOf('mrSubmit(') >= 0) {
      var submit = code.match(/mrSubmit\(([^)]*)\)/)[1].replace(/^\\'/, '').replace(/\\'$/, '');
      return 'data-forge-action="mr-submit" data-question-id="' + submit + '"';
    }
    if (code.indexOf('class-link-form') >= 0) return 'data-forge-action="toggle-class-link"';
    if (code.indexOf('renderLogin()') >= 0 || code.indexOf('forge-quiz.html') >= 0) return 'data-forge-action="anvil-back"';
    if (code.indexOf('panel-student') >= 0) return 'data-forge-action="student-back"';
    if (code.indexOf('state.phase=') >= 0 && code.indexOf('render()') >= 0) return 'data-forge-action="quiz-state-transition" data-transition="' + code.replace(/"/g, '&quot;') + '"';
    return full;
  });
  after = after.replace(/oninput="([^"]*)"/g, function (full, code) {
    if (code.indexOf('mrFindInput(') >= 0) {
      var questionExpr = code.match(/mrFindInput\(([^)]*)\)/)[1].replace(/^\\'/, '').replace(/\\'$/, '');
      return 'data-forge-action="mr-find-input" data-question-id="' + questionExpr + '"';
    }
    return full;
  });
  if (after !== before) { fs.writeFileSync(file, after); changed += 1; }
}
console.log(`Migrated inline actions in ${changed} HTML pages.`);
