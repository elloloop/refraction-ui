// @refraction-ui/react-analytics is a headless provider/hook package — no standalone UI.
export default { title: 'Utilities/Analytics' }

export const Overview = {
  render: () => (
    <div className="max-w-md rounded-lg border border-border bg-card p-6 text-sm">
      <h3 className="mb-2 text-base font-semibold">@refraction-ui/react-analytics</h3>
      <p className="text-muted-foreground">Headless analytics — useAnalytics hook + provider. Broadcasts events to wired sinks; no standalone UI.</p>
    </div>
  ),
}
