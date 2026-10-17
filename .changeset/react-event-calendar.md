---
'@refraction-ui/react': minor
---

Add `EventCalendar` to `@refraction-ui/react`: day, week and month views with today / previous / next and a view switch, an all-day row, a current-time line and month "+N more" overflow, with overlapping events laid out in lanes by a pure, clock-free core (events and `now` are display-zone `{ date, minutes }` values). Supports click / drag / keyboard create via `onCreate`, `onSelectEvent`, keyboard navigation between days and events, and controlled or uncontrolled `view` / `date`. (#587)
