---
'@refraction-ui/react': minor
---

Add `SplitButton` to `@refraction-ui/react`: a primary action fused with a caret that opens a menu of secondary actions. `SplitButtonAction` and `SplitButtonTrigger` are two real buttons with their own accessible names (the caret defaults to "More options"); `SplitButtonMenu` is DropdownMenu's content, filled with `DropdownMenuItem`s. ArrowDown on the caret opens the menu, Escape returns focus to the caret, both parts take Button's variants and sizes and follow `disabled`, and each part's hit area extends to 44 px. (#301)
