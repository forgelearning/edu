# A-Level History — misconception taxonomy (DRAFT for review)

AQA 7042. Covers `HIST-BRIT1`, `HIST-BRIT2`, `HIST-USA1`, `HIST-USA2`, `HIST-TUDOR`
— 208 questions, currently 208 distinct tags, 0 starters.

**Nothing has been changed in `data/forge-data.js`.** This is the list to argue
with first. Mark categories to cut, merge, rename, or add, and I'll do the
mapping and write the starters after.

## Read this before the list

These questions are definition-recall items ("What does X refer to?"). A tag
here therefore means *"a student missed a definition in the area where this
error lives"*, not *"a student demonstrably holds this error"*. The starter is
still worth running — the misconception is what the class will trip on next —
but the heatmap's claim is weaker than in `psych` or `econ`, where the stems
were written around the error. Two options, your call:

- **(a)** Tag as below and accept the weaker claim.
- **(b)** Tag as below *and* rewrite a handful of questions per category into
  the authoring standard so at least one question per tag actually probes the
  error. Roughly 38 rewrites — meaningfully more work, but it makes the tag mean
  what it says.

## Naming

`MC-HIST-*`, matching the retired `MC-HIST-01..13` already in `MC_LABELS` and
`MC_STARTERS`. Those 13 stay where they are; nothing below reuses their ids.

---

## Britain 1906–1918 (`HIST-BRIT1`, 41 questions)

| id | label | the error |
|---|---|---|
| `MC-HIST-LIB-WELFARE` | Liberal reforms as a finished welfare state | Treats 1906–14 as creating universal provision. The reforms were selective, targeted at the young, old and insured worker, and left most adults untouched. |
| `MC-HIST-CONTRIB` | Contributory vs non-contributory | 1908 pensions were non-contributory and means-tested; 1911 National Insurance was contributory, tripartite (worker/employer/state) and covered only some trades. Students swap these routinely. |
| `MC-HIST-NEWLIB` | New Liberalism as socialism | Reads state action as abandoning liberalism, missing that New Liberals justified intervention as *enabling* individual freedom. |
| `MC-HIST-LORDS` | The 1909–11 constitutional crisis | Reverses the causal order (Parliament Act → Budget), or thinks the 1911 Act abolished the Lords' powers rather than replacing veto with delay. |
| `MC-HIST-SUFFRAGE` | Suffragist vs suffragette | NUWSS/Fawcett (constitutional) and WSPU/Pankhurst (militant) treated as one movement. |
| `MC-HIST-FRANCHISE` | What 1918 actually granted | "Women got the vote in 1918" — over 30, with a property qualification, roughly 40% of women. Equal franchise is 1928. |
| `MC-HIST-WARCAUSE` | War work as sole cause of the franchise | Attributes 1918 entirely to wartime service, ignoring the pre-war campaign and the need to enfranchise returning soldiers. |
| `MC-HIST-HOMERULE` | The Irish crisis as a purely Irish problem | Misses that Home Rule split British politics, implicated the army (Curragh) and was shelved rather than solved in 1914. |

## Britain 1918–1957 (`HIST-BRIT2`, 48 questions)

| id | label | the error |
|---|---|---|
| `MC-HIST-GENSTRIKE` | The General Strike as revolution | Reads 1926 as a political bid for power rather than industrial action in support of locked-out miners — and often as a union victory. |
| `MC-HIST-THIRTIES` | The Thirties as uniform hardship | "Hungry Thirties" taken nationally, missing that the employed saw rising real wages and the south grew while coal, steel and shipbuilding regions collapsed. |
| `MC-HIST-NATGOV` | The 1931 National Government | Assumed Conservative or Labour outright; misses that MacDonald led it and was expelled by his own party for doing so. |
| `MC-HIST-GOLD` | Leaving gold as a failure | Reads 1931 as pure defeat, missing that devaluation and the cheap money that followed underpinned recovery and the housing boom. |
| `MC-HIST-APPEASE` | Appeasement judged by hindsight | Condemns it from 1939 outwards without weighing rearmament timetables, Dominion opinion, Soviet distrust and public memory of 1914–18. |
| `MC-HIST-BEVERIDGE` | Beveridge as legislation | Treats the 1942 Report as having created the welfare state. It was a report; the Acts run 1944–48, and mostly under a different government. |
| `MC-HIST-1945` | Explaining the 1945 landslide | Attributed solely to Churchill's campaign or to gratitude, missing the wartime shift in expectations and Labour's ownership of reconstruction. |
| `MC-HIST-CONSENSUS` | Consensus as agreement | Takes "post-war consensus" to mean the parties stopped disagreeing, rather than sharing a policy framework they contested within. |
| `MC-HIST-SUEZ` | Suez as a military defeat | The operation succeeded militarily. The humiliation was political and financial — US pressure on sterling forced withdrawal. |

## USA 1865–1920 (`HIST-USA1`, 40 questions)

| id | label | the error |
|---|---|---|
| `MC-HIST-RECON` | Presidential vs Radical Reconstruction | Johnson's leniency and Congress's military districts merged into one policy, losing the conflict that defines the period. |
| `MC-HIST-AMENDMENTS` | 13th, 14th, 15th | Contents swapped — abolition, citizenship and equal protection, voting rights. |
| `MC-HIST-JIMCROW` | Segregation as federal law | Jim Crow was state and local, permitted by federal courts (*Plessy*), not imposed by Washington. |
| `MC-HIST-LAISSEZ` | Laissez-faire as no government | Ignores tariffs, land grants to railroads, and troops used against strikers. Government was active, just on one side. |
| `MC-HIST-POPPROG` | Populism vs Progressivism | Conflated. Populism is 1890s, rural, farmer-led, silver and railroads; Progressivism is 1900s, urban, middle-class, regulation and efficiency. |
| `MC-HIST-RIGHTSDECLINE` | Rights as secured by amendment | Assumes the 14th and 15th settled the question, missing the collapse of enforcement after 1877. |

## USA 1920–1975 (`HIST-USA2`, 39 questions)

| id | label | the error |
|---|---|---|
| `MC-HIST-NEWDEAL-END` | The New Deal ended the Depression | Unemployment remained high until war production. Recovery is not the same as relief. |
| `MC-HIST-NEWDEAL-PLAN` | The New Deal as one coherent plan | Misses that it was improvised, internally contradictory, and shifted between the First and Second New Deals. |
| `MC-HIST-NDOPP` | New Deal opposition as only conservative | Long, Coughlin and Townsend attacked it for doing *too little*; the Supreme Court struck parts down on constitutional grounds. |
| `MC-HIST-CRASH` | Crash and Depression as the same event | The 1929 crash is an event; the Depression is a multi-year contraction with bank failures and debt deflation behind it. |
| `MC-HIST-CIVILRIGHTS-LAW` | Law as lived change | *Brown* desegregated nothing on its own — Little Rock and "all deliberate speed" show enforcement was the real battle. |
| `MC-HIST-CIVILRIGHTS-START` | The movement began in 1955 | Ignores the Great Migration, wartime Double V, and NAACP legal strategy long predating Montgomery. |
| `MC-HIST-COLDWARPOLICY` | Truman Doctrine, Marshall Plan, NATO | Treated as one policy. Distinct instruments: a doctrine of support, an economic programme, a military alliance. |

## Tudor investigation (`HIST-TUDOR`, 40 questions)

| id | label | the error |
|---|---|---|
| `MC-HIST-TUDORCLAIM` | Henry VII's claim as strong | The Beaufort descent was weak and legitimated with a bar on the crown. His title rested on battle, marriage and consolidation. |
| `MC-HIST-PRETENDERS` | Simnel and Warbeck swapped | Simnel — Warwick, 1487, pardoned to the kitchens. Warbeck — Richard of Shrewsbury, foreign backing, executed. |
| `MC-HIST-BREAK` | The break with Rome as Protestantism | Jurisdictional, not doctrinal. The Six Articles (1539) reaffirm Catholic doctrine under a king who had already broken with Rome. |
| `MC-HIST-DISSOLUTION` | Dissolution as a religious act | Understates the financial motive: monastic land and income transferred to the Crown and sold to its supporters. |
| `MC-HIST-REBELLION` | Rebellions as attempts to depose | Most sought redress or the removal of advisers. Kett is about enclosure, not religion; the Pilgrimage of Grace mixes both. |
| `MC-HIST-ELIZSETTLE` | The 1559 settlement as a solution | Treated as ending religious conflict, missing the Puritan pressure and Catholic recusancy it provoked for forty years. |
| `MC-HIST-MINISTERS` | Wolsey and Cromwell as independent powers | Both fell the moment they lost royal favour. Their power was delegated, never held. |

## Cross-cutting — exam technique (all five banks)

These are the ones I'd most expect you to cut or reshape, since they're about
AO2/AO3 rather than content.

| id | label | the error |
|---|---|---|
| `MC-HIST-SOURCE` | Provenance as a reliability verdict | "Biased, therefore useless." Provenance shapes *what a source is good evidence for*, not whether it counts. |
| `MC-HIST-CAUSATION` | Trigger confused with long-term cause | Assassination, crash, boycott named as the cause, with the structural conditions left out. |
| `MC-HIST-JUDGEMENT` | Narrating instead of judging | Accurate chronology with no sustained argument. The single largest cause of mid-band marks. |

---

**Total: 40 categories** across 208 questions. 38 are live once the two that no
question can fire are dropped (see the mapping doc). Trim to ~30 if you want fewer, richer starters; the
cross-cutting three and the Tudor set are where I'd cut first if pushed, since
the cross-cutting ones aren't really content and the Tudor bank is a single
40-question investigation.
