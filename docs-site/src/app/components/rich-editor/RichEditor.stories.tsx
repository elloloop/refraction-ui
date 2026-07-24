// The @refraction-ui/react-rich-editor adapter is still in early development —
// the package currently exports nothing — so this story mirrors the docs-site
// page's status content instead of rendering a live component.
const meta = { title: 'Chat & AI/RichEditor' }
export default meta

export const ComingSoon = {
  render: () => (
    <div className="max-w-md space-y-3 rounded-xl border border-border bg-card p-8">
      <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
        Coming Soon
      </span>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        Rich Editor
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        A rich text editor with formatting toolbar, markdown shortcuts, and
        extensible plugin system. The core package is defined but exports are
        not yet available.
      </p>
    </div>
  ),
}
