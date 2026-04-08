'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react-tabs'

export function TabsExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Account Settings</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your account details and preferences.
              </p>
            </div>
            <div className="grid gap-4 max-w-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <div className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground">
                  Jane Cooper
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground">
                  jane@example.com
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <div className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground">
                  Admin
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose what notifications you want to receive.
              </p>
            </div>
            <div className="space-y-4 max-w-lg">
              {[
                { label: 'Email notifications', desc: 'Receive email about account activity', checked: true },
                { label: 'Push notifications', desc: 'Receive push notifications on your devices', checked: false },
                { label: 'Weekly digest', desc: 'Get a weekly summary of activity', checked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <div className={`mt-0.5 h-5 w-9 rounded-full transition-colors ${item.checked ? 'bg-primary' : 'bg-muted'} relative`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${item.checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Billing Information</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your subscription and payment methods.
              </p>
            </div>
            <div className="max-w-lg space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Pro Plan</div>
                    <div className="text-xs text-muted-foreground">$29/month, billed monthly</div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Active
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                      VISA
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Visa ending in 4242</div>
                      <div className="text-xs text-muted-foreground">Expires 12/2027</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Default</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
