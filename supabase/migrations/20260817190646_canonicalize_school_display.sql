-- Use one display spelling for every row already sharing a canonical school
-- identity. This is intentionally limited to identities in school_aliases;
-- arbitrary abbreviations are never guessed or merged.
update public.classes c
set school = a.canonical_name
from public.school_aliases a
where c.school_key = a.canonical_key
  and c.school is distinct from a.canonical_name;
