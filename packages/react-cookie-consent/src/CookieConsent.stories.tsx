import { CookieConsent } from './cookie-consent.js'
import { useCookieConsent } from './use-cookie-consent.js'

function Demo() {
  // A fresh version each render keeps the banner visible in the canvas.
  const consent = useCookieConsent({ version: `sb-${Math.random()}` })
  return (
    <div style={{ minHeight: 360 }}>
      <div className="p-4 text-sm text-muted-foreground">
        The consent banner appears at the bottom. Accept all / Reject all / Manage preferences dismiss it;
        the choice persists in localStorage. Use “Manage preferences” to toggle individual categories.
      </div>
      <CookieConsent consent={consent} policyUrl="#" />
    </div>
  )
}

export default { title: 'Components/CookieConsent' }

export const Default = { render: () => <Demo /> }
