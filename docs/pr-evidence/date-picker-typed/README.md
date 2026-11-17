# Date picker typed entry review captures

The Flutter example app's Date Picker page (`packages/flutter/example`, route `#/docs/date-picker`), run with `flutter run -d web-server` in Chrome, dark theme, English. The captures crop the page to its preview card; desktop is the preview's desktop width, phone is its phone width. `before-*` is the merge base on `main`; `after-*` is this branch.

- `before-desktop-dark.png` / `before-phone-dark.png`: on `main` the page has only the three calendar pickers; nothing takes a typed date.
- `after-desktop-empty-dark.png`: the new "Typed entry (date of birth)" example after a fresh load: Day, Month and Year, in day-month-year order, all empty.
- `after-desktop-not-real-dark.png`: 31 / 02 / 2001 typed. The three borders and the message "That date does not exist." are in the destructive colour; focus has moved on to Month and selected its "02".
- `after-desktop-valid-dark.png`: the day changed to 15. 15 / 02 / 2001 is a real date, so the error is gone.
- `after-phone-valid-dark.png`: the same date at the preview's phone width; the three segments fit on one row.
