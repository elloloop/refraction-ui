---
'@refraction-ui/react': minor
---

Add `TaskList`, `TaskGroup`, `TaskRow` and `BulkActionBar` to `@refraction-ui/react`: a to-do list grouped by due state (folding groups, Done folded by default, "4 open · 1 overdue" header counts), rows with a read-only-capable completion checkbox, due chip, owner/status slots and an unseen marker, arrow/Space/Enter keyboard control, and a selection mode with Shift ranges, select all and a polite bulk action bar. Clock-free helpers (`groupTasksByDue`, `countTaskGroup`, `describeTaskDue`, `reduceTaskSelection`) take an injected "today". (#576)
