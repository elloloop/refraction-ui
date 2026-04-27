import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn, cva } from '@refraction-ui/shared'
import { Slot } from './slot.js'

/**
 * Form — RHF FormProvider wrapper.
 *
 * Spread the result of `useForm()` into <Form> so descendants can read the
 * form state via context. Renders no DOM of its own; consumers can place a
 * <form onSubmit={form.handleSubmit(...)}> inside.
 */
const Form = FormProvider

// -----------------------------------------------------------------------------
// Field context — bridges <FormField> and the inner Form* primitives.
// -----------------------------------------------------------------------------

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(
  undefined,
)

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | undefined>(
  undefined,
)

/**
 * FormField — connects a named field to RHF's Controller and provides
 * field-name context to the descendants (FormLabel, FormControl, FormMessage).
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/**
 * useFormField — read-only access to the current field context.
 *
 * Returns the per-field id collection plus the live RHF error state. Useful
 * when building custom form controls that want the same wiring as FormControl.
 */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()
  // useFormState subscribes to the specific field's error state, which keeps
  // re-renders narrow and works correctly with RHF v7 lazy subscriptions.
  const { errors } = useFormState({
    control: formContext?.control,
    name: fieldContext?.name as never,
    exact: true,
  })

  if (!fieldContext) {
    throw new Error('useFormField must be used within a <FormField>')
  }
  if (!itemContext) {
    throw new Error('useFormField must be used within a <FormItem>')
  }

  const { id } = itemContext
  const error = getNestedError(errors, fieldContext.name)

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error,
    invalid: Boolean(error),
  }
}

// Walks a dot/bracket path through RHF's errors object. Mirrors the path
// semantics of FieldPath without pulling in lodash.get.
function getNestedError(
  errors: Record<string, unknown> | undefined,
  name: string,
): { message?: string; type?: string } | undefined {
  if (!errors) return undefined
  const segments = name.replace(/\[(\w+)\]/g, '.$1').split('.')
  let cursor: unknown = errors
  for (const seg of segments) {
    if (cursor && typeof cursor === 'object' && seg in (cursor as object)) {
      cursor = (cursor as Record<string, unknown>)[seg]
    } else {
      return undefined
    }
  }
  return cursor as { message?: string; type?: string } | undefined
}

// -----------------------------------------------------------------------------
// FormItem — emits a stable id used by Label/Control/Description/Message.
// -----------------------------------------------------------------------------

const formItemVariants = cva({ base: 'space-y-2' })

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId()
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn(formItemVariants(), className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = 'FormItem'

// -----------------------------------------------------------------------------
// FormLabel
// -----------------------------------------------------------------------------

const formLabelVariants = cva({
  base: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  variants: {
    invalid: {
      true: 'text-destructive',
      false: '',
    },
  },
  defaultVariants: {
    invalid: 'false',
  },
})

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const { invalid, formItemId } = useFormField()
    return (
      <label
        ref={ref}
        htmlFor={formItemId}
        data-invalid={invalid ? '' : undefined}
        className={cn(formLabelVariants({ invalid: invalid ? 'true' : 'false' }), className)}
        {...props}
      />
    )
  },
)
FormLabel.displayName = 'FormLabel'

// -----------------------------------------------------------------------------
// FormControl — Slot that injects id/aria-describedby/aria-invalid.
// -----------------------------------------------------------------------------

interface FormControlProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { invalid, formItemId, formDescriptionId, formMessageId } =
      useFormField()
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={
          invalid
            ? `${formDescriptionId} ${formMessageId}`
            : formDescriptionId
        }
        aria-invalid={invalid || undefined}
        {...props}
      />
    )
  },
)
FormControl.displayName = 'FormControl'

// -----------------------------------------------------------------------------
// FormDescription
// -----------------------------------------------------------------------------

interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

// -----------------------------------------------------------------------------
// FormMessage
// -----------------------------------------------------------------------------

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error?.message ? String(error.message) : children
    if (!body) return null
    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = 'FormMessage'

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
  formItemVariants,
  formLabelVariants,
}

export type {
  FormItemProps,
  FormLabelProps,
  FormControlProps,
  FormDescriptionProps,
  FormMessageProps,
}
