// ============================================================
// Clearbank — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const transactions = [
  { date: 'Apr 5', desc: 'Whole Foods Market', category: 'Groceries', amount: -82.45 },
  { date: 'Apr 5', desc: 'Salary Deposit - Acme Corp', category: 'Income', amount: 4250.00 },
  { date: 'Apr 4', desc: 'Streaming Subscription', category: 'Entertainment', amount: -15.99 },
  { date: 'Apr 4', desc: 'Ride Share', category: 'Transport', amount: -23.50 },
  { date: 'Apr 3', desc: 'Transfer to Savings', category: 'Transfer', amount: -500.00 },
  { date: 'Apr 3', desc: 'Amazon.com', category: 'Shopping', amount: -67.89 },
  { date: 'Apr 2', desc: 'Starbucks', category: 'Dining', amount: -6.75 },
  { date: 'Apr 2', desc: 'Venmo - Sarah Chen', category: 'Transfer', amount: 45.00 },
  { date: 'Apr 1', desc: 'Rent Payment', category: 'Housing', amount: -1800.00 },
  { date: 'Apr 1', desc: 'Electric Bill', category: 'Utilities', amount: -95.40 },
]

export const spending = [
  { category: 'Housing', amount: 1800, color: 'bg-primary' },
  { category: 'Groceries', amount: 420, color: 'bg-[hsl(var(--chart-2))]' },
  { category: 'Transport', amount: 185, color: 'bg-[hsl(var(--chart-3))]' },
  { category: 'Entertainment', amount: 95, color: 'bg-[hsl(var(--chart-4))]' },
  { category: 'Dining', amount: 210, color: 'bg-[hsl(var(--chart-5))]' },
  { category: 'Shopping', amount: 340, color: 'bg-[hsl(var(--warning))]' },
]

export const recentRecipients = [
  { name: 'Sarah Chen', initials: 'SC', email: 'sarah@email.com' },
  { name: 'Marcus Johnson', initials: 'MJ', email: 'marcus@email.com' },
  { name: 'Elena Rodriguez', initials: 'ER', email: 'elena@email.com' },
  { name: 'James Wilson', initials: 'JW', email: 'james@email.com' },
  { name: 'Priya Patel', initials: 'PP', email: 'priya@email.com' },
]

export const quickAmounts = ['50', '100', '250', '500']

export const mockTransactions = ['Coffee Shop', 'Streaming', 'Transfer']

export const quickActions = [
            { label: 'Send Money', href: '/examples/clearbank/app/transfer', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg> },
            { label: 'Pay Bills', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> },
            { label: 'Investments', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
            { label: 'Cards', href: '/examples/clearbank/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg> },
          ]

export const bankFeatures = [
              { title: 'Instant Transfers', desc: 'Send money to anyone in seconds. No fees, no waiting.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg> },
              { title: 'Smart Savings', desc: 'AI-powered savings goals that learn your spending habits.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg> },
              { title: 'Investment Tools', desc: 'Build wealth with fractional shares, ETFs, and crypto.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
              { title: '24/7 Support', desc: 'Get help anytime via chat, phone, or email.', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg> },
            ]

export const securityFeatures = [
            { title: '256-bit Encryption', desc: 'Military-grade encryption for all data in transit and at rest.' },
            { title: 'FDIC Insured', desc: 'Deposits insured up to $250,000 through our banking partners.' },
            { title: 'Biometric Auth', desc: 'Face ID, Touch ID, and two-factor authentication built in.' },
          ]
