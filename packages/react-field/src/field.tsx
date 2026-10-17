import * as React from 'react'
import {
  createField,
  fieldHintId,
  mergeDescribedBy,
  type FieldLayout,
  type FieldLabelTone,
} from '@refraction-ui/field'
import { cn, devWarn } from '@refraction-ui/shared'

export type { FieldLayout, FieldLabelTone }

/** Props a render-function child spreads onto its control. */
export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
}

export interface FieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The visible label — also the control's accessible name. */
  label: React.ReactNode
  /**
   * The control. A single element is given an id (its own, or a generated
   * one) that the label points at, and is described by the hint. For a
   * control nested inside a wrapper, pass a function: it receives the
   * `id` and `aria-describedby` to spread onto the control.
   */
  children: React.ReactNode | ((control: FieldControlProps) => React.ReactNode)
  /** Helper copy under the control. Its id is `<control id>-hint`. */
  hint?: React.ReactNode
  /**
   * The id of the control the label names. Use it when the control is not
   * the direct child; the child is then left untouched.
   */
  htmlFor?: string
  /** `stacked` (default) puts the label above; `inline` beside a checkbox or switch. */
  layout?: FieldLayout
  /** Grow to fill spare room in a wrapping row. */
  grow?: boolean
  /** Label typography: a regular form label, or a small uppercase eyebrow. */
  labelTone?: FieldLabelTone
}

type ControlElement = React.ReactElement<{ id?: string; 'aria-describedby'?: string }>

function isControlElement(node: React.ReactNode): node is ControlElement {
  return React.isValidElement(node) && node.type !== React.Fragment
}

/**
 * Field — a labelled form control with an optional hint. Works with any
 * control and any (or no) form library. The label points at the control by
 * id rather than wrapping it, so a control with its own buttons (a password
 * reveal, a clear button) keeps a clean accessible name.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    children,
    hint,
    htmlFor,
    layout = 'stacked',
    grow = false,
    labelTone = 'default',
    className,
    ...props
  },
  ref,
) {
  const api = createField({ layout, grow, labelTone })
  const autoId = React.useId()
  const generatedId = `${autoId}control`
  const hasHint = hint != null && hint !== false

  let controlId: string | undefined
  let control: React.ReactNode

  if (typeof children === 'function') {
    controlId = htmlFor ?? generatedId
    control = children({
      id: controlId,
      'aria-describedby': hasHint ? fieldHintId(controlId) : undefined,
    })
  } else if (
    isControlElement(children) &&
    (htmlFor === undefined || children.props.id === htmlFor)
  ) {
    controlId = htmlFor ?? children.props.id ?? generatedId
    control = React.cloneElement(children, {
      id: controlId,
      'aria-describedby': mergeDescribedBy(
        children.props['aria-describedby'],
        hasHint && fieldHintId(controlId),
      ),
    })
  } else {
    controlId = htmlFor
    control = children
  }

  if (controlId === undefined) {
    devWarn(
      'react-field/unlabelled-control',
      'Field could not find the control its label names. Pass a single control element, a render function, or htmlFor with the control id.',
    )
  }

  const labelNode = (
    <label data-slot="field-label" htmlFor={controlId} className={api.labelClass}>
      {label}
    </label>
  )

  return (
    <div
      ref={ref}
      className={cn(api.rootClass, className)}
      {...api.dataAttributes}
      {...props}
    >
      {layout === 'inline' ? (
        <>
          {control}
          {labelNode}
        </>
      ) : (
        <>
          {labelNode}
          {control}
        </>
      )}
      {hasHint && (
        <p
          data-slot="field-hint"
          id={fieldHintId(controlId ?? generatedId)}
          className={api.hintClass}
        >
          {hint}
        </p>
      )}
    </div>
  )
})
