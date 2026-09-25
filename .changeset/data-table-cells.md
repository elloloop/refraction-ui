---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

`DataTable` renders real content: columns take `cell` (`(row, index) => ReactNode`), a ReactNode `header`, `align` (`start | center | end`), `numeric` (tabular figures, end-aligned), `className` and `headerClassName`; `accessor` is now optional for display-only columns. New table props `getRowKey`, `getRowProps`, `onRowClick` (rows become focusable and activate with click/Enter/Space), `caption`, `wrapperClassName`, and table attributes pass through. Sortable headers are now buttons, so sorting works from the keyboard. New core helpers `resolveColumnAlign`, `resolveRowKey`, `getColumnValue`; new type `DataTableColumn`.
