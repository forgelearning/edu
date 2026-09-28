# Student core journeys: first usability pass

28 September 2026. Local implementation; not published. Prompted by students reporting busy screens and not discovering the collapsed sidebar.

## Changes

- Navigation: show labels by default for new student sessions; preserve an explicit collapse preference. The collapsed control says Menu. Use Home, Practice, Repair mistakes, Timed practice and My progress, retaining Forge/Anvil/Crucible as secondary descriptions. The logo returns students home.
- Mobile: Home, Practice, Repair and Assigned stay visible. Menu contains Revision, Timed practice, My progress and Settings, with a visible Close control. Fix delegated menu links dropping their destination. Mark the current destination and indicate when it is inside Menu.
- Home: one recommendation (repair, a recent topic, or start practice), then three clear secondary actions. Show current rank, XP to the next rank, questions answered and practice streak; detailed statistics remain on My progress. Remove the competing recommendation, learning-loop banner and repeated mode cards.
- Practice setup: use topics rather than banks, keep the primary Start practice action and make the other-topic chooser reversible. Preserve content-coverage information.
- Questions: use a readable question counter, put specification metadata behind Topic details, remove internal question IDs and decorative session labels. Rename Re-forge to Try a similar question. Scroll toward the explanation, not past it to Next; honour reduced motion.
- Repair: return to practice instead of a login screen; show one priority idea and its clearing progress. Other available ideas are keyboard-operable buttons. Hide cleared history behind a disclosure and omit internal taxonomy codes.
- Completion: show the score once, a clear repair or home action, practice alternatives and a collapsed class leaderboard. Remove the unsupported confidence label and duplicated destinations.

## Verification

- Local browser with fictional student data: desktop 1280×800 and phone 390×844, dashboard, menu navigation, practice setup, wrong-answer explanation, a similar question, all eight questions, completion, repair entry and return links. Dashboard also inspected in light mode.
- Dependency-free regression tests: navigation defaults and persistence, mobile reachability, current-page indication, delegated menu routing, repair feedback, new-student dashboard, recommendation and error states, escaped student names.
- Existing auth, signed-in history, persistence, API failure, accessibility/payload, button, UI-system and route checks passed. Local site build succeeded.
- Design detector ran; source-relative asset resolution limited its stylesheet checks. Existing CSS warnings remain outside this pass.
- No production accounts or data used. This is browser verification, not student usability validation or a live database/security audit. Native iOS/Android shells were not run.

## Student observation before adding Friends

Give a few students these tasks without demonstrating the menu:

1. Find and start practice in a subject.
2. After a wrong answer, find the explanation and try the similar question.
3. Find an idea to repair, then return to practice.
4. Finish a session and return home.
5. Find assignments and detailed progress.

Record hesitations, wrong turns and requests for help. Check whether the plain navigation labels are understood, whether the primary recommendation is clear, and whether moving Revision into the mobile menu hurts discovery. Use those observations to decide the next changes before adding Friends.
