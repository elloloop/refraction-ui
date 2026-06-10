'use client'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@refraction-ui/react-form'

const inputClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-destructive'

interface SignUpValues {
  email: string
  username: string
}

interface FormExamplesProps {
  section: 'basic' | 'validation'
}

export function FormExamples({ section }: FormExamplesProps) {
  const form = useForm<SignUpValues>({
    defaultValues: { email: '', username: '' },
  })

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => alert(JSON.stringify(values, null, 2)))}
            className="max-w-sm space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <input className={inputClass} placeholder="ada" {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Submit
            </button>
          </form>
        </Form>
      </div>
    )
  }

  if (section === 'validation') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => alert(JSON.stringify(values, null, 2)))}
            className="max-w-sm space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required.',
                pattern: { value: /.+@.+\..+/, message: 'Enter a valid email address.' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input className={inputClass} placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Validate
            </button>
          </form>
        </Form>
      </div>
    )
  }

  return null
}
