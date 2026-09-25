---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

Add composable `Table` primitives — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` — mapping one-to-one to the HTML table elements so cells can hold components. `Table` takes `density` (`compact | default`), `headTone` (`default | eyebrow`), `fixed` and `containerClassName` (horizontal scroll container); `TableHead`/`TableCell` take `align` (`start | center | end`), `TableCell` takes `numeric`, and `TableHead` defaults `scope="col"`.
