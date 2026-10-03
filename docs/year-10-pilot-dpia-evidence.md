# Forge Year 10 pilot: evidence for the school data protection lead

Prepared 21 September 2026. This is a factual starting pack for the school's DPIA screening and supplier review, not a completed DPIA or signed data processing agreement. Do not put pupil names, class codes or individual access codes in this document.

## Pilot scope to confirm with the school

- One Year 10 class uses Forge for practice questions, assignments and teacher feedback. The teacher confirms that each pupil has an **individual pupil access code** known only to that pupil and the teacher, in addition to the first name and class code used to join. The teacher also confirms that the live pilot class rejects entry with first name and class code alone. The application supports an older join route for other classes without individual codes; that route does not work for this pilot class.
- No pupil email address is required for class joining. The teacher account uses email and password.
- Record the school name, pilot start and end dates, approximate pupil count, curriculum subject, devices used, and whether any pupil uses the Pro/trial account route. These facts must be supplied by the school; they cannot be inferred from this repository.
- The school should identify its controller and data protection officer or lead. Forge should identify the legal entity and authorised contact that will accept processor obligations. The public privacy page's school terms are a draft for review, not evidence of an executed agreement.

## Data flow observed in the application

| Step | Data | Purpose and recipient | Repository evidence |
| --- | --- | --- | --- |
| Class joining | Display name, class code, individual pupil code, class identifier and pupil identifier | Connect a pupil to the teacher's class in Supabase | `supabase/migrations/20260809150000_student_access_codes.sql`; `supabase/migrations/20260810133000_disable_legacy_student_rpc_on_coded_classes.sql` |
| Practice and assignments | Question ID, selected option, correctness, subject, misconception tag, specification point, assignment ID and time | Save progress and show teacher and pupil feedback in Supabase | `scripts/forge-response-writer.js`; `supabase/migrations/20260817184431_scope_response_assignment_id_v2.sql` |
| Teacher view | Pupil display names, answers/scores and class summaries | Let the signed-in class teacher review learning | `pages/app/teacher.html`; `supabase/migrations/20260821200000_scope_teacher_reads_to_own_students.sql` |
| Device session | Display name, class ID/code, pupil ID and individual code | Resume the pupil's work on the same device | `pages/app/student-dashboard.html`; `scripts/forge-student-session.js` |
| Website delivery | IP address and browser request metadata | Static hosting, fonts and database connectivity | `pages/app/forge-quiz.html`; `pages/marketing/privacy.html` |

The first name is **not anonymous** when paired with a class and learning history. The teacher may be able to identify the pupil, and an access code or browser identifier is still personal data if it can single out or link activity to a pupil. The application does not require pupils to enter an email for class use.

The repository contains row-level security and teacher scoping rules, and stores a SHA-256 digest of individual access codes. These are design controls, **not proof that every migration has been deployed to the live project**. `supabase/migrations/20260821200000_scope_teacher_reads_to_own_students.sql` narrows teacher access to their own classes. `supabase/migrations/20260810130000_cascade_class_cleanup.sql` makes class deletion cascade to linked pupil and answer rows. Confirm both in the live project before relying on them.

## Pilot risks and controls for the DPIA

| Risk to pupils | Existing or proposed control | Evidence still needed |
| --- | --- | --- |
| Another pupil re-enters someone else's work using a known class code and first name | The teacher confirms each pupil has a private individual code known only to that pupil and the teacher, and that name plus class code alone is rejected in the live pilot class. Source code disables the older join route for classes with active individual codes | Keep a dated record of this access check for the DPIA; repeat it if class access settings change |
| A shared school browser exposes the previous pupil's session | Local storage retains class and pupil session information | Test “Switch student” or sign-out on a shared device; agree a device use instruction with the school |
| A teacher or external user sees data outside their class | Teacher-scoped database policies and authenticated teacher accounts | Run the live security audit and a second-account access test; retain dated results |
| Learning profiles are used beyond the school purpose | Pupil-page Google Analytics and product event scripts have been removed in this source change | Deploy and inspect live network requests; confirm no other analytics or crash-reporting service receives pupil data |
| Pupil data persists longer than necessary | Class deletion cascades to linked records; deletion can be requested | Agree a pilot end date, deletion/export method, backup retention and log retention; record the completed deletion test |
| Data or metadata leaves the UK | Supabase, GitHub Pages, Google Fonts and other providers are involved | Confirm the live Supabase project region, provider contracts, subprocessor list and any restricted-transfer assessment |

## Decisions and documents to take to the data protection officer

1. **DPIA screening and, likely, a DPIA.** Record necessity, proportionality, children's risks, mitigations, residual risk, DPO advice and sign-off. The school decides whether the DPIA is required; the combination of children, learning profiles and an online tool makes screening especially important.
2. **Controller/processor roles and an Article 28 agreement.** Agree who decides the purposes of class data, whether Forge uses any data for its own purposes, the permitted processing, subprocessor terms, assistance with rights and incidents, deletion/return, audits and international transfers. A privacy page or waitlist entry is not a substitute for the school's approved contract.
3. **A pupil/parent privacy notice.** Name Forge, explain that first name, class, answers, scores and misconception profiles are used, who can see them, retention and rights. The school chooses its lawful basis and puts the use in its notice; Forge supplies accurate supporting facts.
4. **Pilot operating record.** Record the class count, how individual codes were distributed, who has teacher/admin access, the teacher's confirmation that first name plus class code alone is rejected, incident contact, end date and deletion confirmation. Keep the codes themselves out of the DPIA.
5. **Supplier evidence.** Save current Supabase project region/settings and DPA, hosting and font provider terms, backup/log retention, the dated privacy page, and the repository/security review results. Do not claim a provider contract or specific hosting region until the actual account confirms it.

## Verification status on 21 September 2026

- **Confirmed by the teacher:** each pilot pupil has an individual access code known only to that pupil and the teacher; the live class rejects first name plus class code without the individual code.
- **Observed in source:** first-name/class-code legacy join for classes without active individual codes; individual pupil code support; response and misconception storage; teacher scoping and class deletion migrations; browser local storage; external hosting and font requests.
- **Changed in source:** removed Google Analytics from application, authentication and subject pages, and removed product event tracking from application pages. Marketing and guide pages retain consent-managed Google Analytics. This needs deployment and a live browser network check.
- **Not independently verified:** the teacher-reported live access check, deployed database migrations, actual Supabase region, provider contract status, backup/log retention, operational deletion process, and whether the school has already approved this pilot.

## Official guidance

- [Department for Education: procuring educational technology](https://www.gov.uk/guidance/data-protection-in-schools/procuring-educational-technology-edtech) — early DPO involvement, DPIA, contracts, transfers, rights and safeguarding review.
- [ICO: when a DPIA is needed](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/when-do-we-need-to-do-a-dpia/) — high-risk screening, including vulnerable people such as children.
- [ICO: Children's code and edtech](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/the-children-s-code-and-education-technologies-edtech/) — actual controller/processor role depends on what each party does.
- [ICO: controller–processor contract contents](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/what-needs-to-be-included-in-the-contract/) — required Article 28 terms.
- [ICO: children and lawful bases](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/how-do-the-lawful-bases-apply-to-children-s-personal-information/) — age 13 rule applies to consent for direct online services, not a blanket parental-consent rule for all under-16 use.
