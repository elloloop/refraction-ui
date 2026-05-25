// @refraction-ui/react-theme is a headless provider/hook package — no standalone UI.
export default { title: 'Components/Theme' }

export const Overview = {
  render: () => (
    <div className="max-w-md rounded-lg border border-border bg-card p-6 text-sm">
      <h3 className="mb-2 text-base font-semibold">@refraction-ui/react-theme</h3>
      <p className="text-muted-foreground">Theme provider + useTheme hook (light/dark/system). Wrap your app; no standalone UI.</p>
    </div>
  ),
}
