import { FormExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const formProps = [
  {
    name: 'Form',
    type: 'FormProvider',
    description:
      'React Hook Form provider. Spread the result of `useForm()` into it so descendants can read form state. Renders no DOM of its own.',
  },
  {
    name: 'FormField',
    type: 'ControllerProps',
    description:
      'Connects a named field to RHF’s Controller and supplies field-name context to the descendant primitives. Accepts `control`, `name`, `rules`, and a `render` prop.',
  },
  {
    name: 'FormItem',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'Wraps one field and emits a stable id used by Label, Control, Description, and Message.',
  },
  {
    name: 'FormLabel',
    type: 'LabelHTMLAttributes<HTMLLabelElement>',
    description: 'Field label, wired to the control via `htmlFor`. Turns destructive when the field is invalid.',
  },
  {
    name: 'FormControl',
    type: 'HTMLAttributes<HTMLElement>',
    description:
      'Slot that injects `id`, `aria-describedby`, and `aria-invalid` onto the input it wraps (a single child).',
  },
  {
    name: 'FormDescription',
    type: 'HTMLAttributes<HTMLParagraphElement>',
    description: 'Helper text linked to the control via `aria-describedby`.',
  },
  {
    name: 'FormMessage',
    type: 'HTMLAttributes<HTMLParagraphElement>',
    description:
      'Renders the field’s validation error message (or its children when there is no error). Returns null when empty.',
  },
  {
    name: 'useFormField',
    type: '() => { id, name, error, invalid, … }',
    description: 'Hook exposing the current field’s ids and live error state — for building custom controls.',
  },
]

const usageCode = `import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useForm,
} from '@refraction-ui/react'

export function SignUpForm() {
  const form = useForm({ defaultValues: { email: '' } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: 'Email is required.' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}`

export default function FormPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Form</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Accessible form primitives built on{' '}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">react-hook-form</code>. They wire
          labels, controls, descriptions, and error messages together with the correct ids and ARIA attributes,
          so any input becomes a fully-labelled, validated field.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic field</h2>
        <p className="text-sm text-muted-foreground">
          Spread <code className="rounded bg-muted px-1 text-xs">useForm()</code> into{' '}
          <code className="rounded bg-muted px-1 text-xs">Form</code>, then compose{' '}
          <code className="rounded bg-muted px-1 text-xs">FormField</code> →{' '}
          <code className="rounded bg-muted px-1 text-xs">FormItem</code> →{' '}
          <code className="rounded bg-muted px-1 text-xs">FormLabel/FormControl/FormDescription/FormMessage</code>.
        </p>
        <FormExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-form" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Validation</h2>
        <p className="text-sm text-muted-foreground">
          Pass RHF <code className="rounded bg-muted px-1 text-xs">rules</code> to{' '}
          <code className="rounded bg-muted px-1 text-xs">FormField</code>.{' '}
          <code className="rounded bg-muted px-1 text-xs">FormMessage</code> renders the error and the label turns
          destructive automatically. Submit an empty or malformed email to see it.
        </p>
        <FormExamples section="validation" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Primitives</h2>
        <PropsTable props={formProps} />
      </section>
    </div>
  )
}
