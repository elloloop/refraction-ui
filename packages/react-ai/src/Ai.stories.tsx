// @refraction-ui/react-ai is a headless provider/hook package — no standalone UI.
export default { title: 'Chat & AI/Ai' }

export const Overview = {
  render: () => (
    <div className="max-w-md rounded-lg border border-border bg-card p-6 text-sm">
      <h3 className="mb-2 text-base font-semibold">@refraction-ui/react-ai</h3>
      <p className="text-muted-foreground">Headless AI provider + useAI/useTTS hooks. Wrap your app in an AIProvider; no standalone UI.</p>
    </div>
  ),
}
