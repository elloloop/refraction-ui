---
"@refraction-ui/react": patch
"@refraction-ui/astro": patch
---

Size small text in rem instead of pixels so it follows the reader's browser text-size setting. Badge (`sm`), SocialAuthButton's "Last used" badge, SectionHead, PageHeader and AudienceFeatureCard kickers, the Table eyebrow header, AudioRoom badges, the CallControls label, BrowserChromeMock, FunnelChart, LineChart, DiffViewer and the Composer trigger menu heading now use rem values equal to their former pixel sizes at the default 16px root, so nothing moves for readers who keep the default. DiffViewer's file tabs and status bar heights are in rem too, so they grow with their text instead of clipping it.
