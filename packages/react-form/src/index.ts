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
  type FormItemProps,
  type FormLabelProps,
  type FormControlProps,
  type FormDescriptionProps,
  type FormMessageProps,
} from './form.js'

export { Slot, type SlotProps } from './slot.js'

// Re-export the most commonly used react-hook-form bits for convenience so
// consumers don't need a second import. react-hook-form is a peer dep — these
// are passthroughs, not bundled.
export {
  useForm,
  useFormContext,
  useFormState,
  useWatch,
  useController,
  Controller,
  FormProvider,
  type UseFormReturn,
  type UseFormProps,
  type FieldValues,
  type FieldPath,
  type SubmitHandler,
  type SubmitErrorHandler,
} from 'react-hook-form'
