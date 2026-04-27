import * as React from 'react'

/**
 * Minimal Slot implementation.
 *
 * Why not @radix-ui/react-slot? Per package policy, no external runtime deps
 * are allowed in @refraction-ui/* packages. This Slot does the small amount
 * of work we actually need:
 *   - Forwards a single React child
 *   - Merges incoming props onto that child (event handlers are chained,
 *     className is concatenated, style is shallow-merged)
 *   - Merges refs (callback refs and ref objects)
 *
 * It is intentionally simpler than Radix Slot — no <Slottable/>, no asChild
 * recursion. FormControl renders exactly one child input/textarea/etc., which
 * is all we need here.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(
  props,
  forwardedRef,
) {
  const { children, ...slotProps } = props

  if (!React.isValidElement(children)) {
    return null
  }

  // The child element's existing props
  const childProps = (children.props ?? {}) as Record<string, unknown>

  const mergedProps = mergeProps(slotProps as Record<string, unknown>, childProps)

  // Forward + merge refs. In React 19 `ref` is a regular prop on `props`; in
  // React 18 it's hoisted onto the element. Prefer the prop and only fall back
  // to the element field if `props.ref` truly wasn't there — that fallback path
  // is React 18 only.
  let childRef: React.Ref<unknown> | undefined = childProps.ref as
    | React.Ref<unknown>
    | undefined
  if (childRef === undefined && !('ref' in (childProps as object))) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    childRef = (children as any).ref as React.Ref<unknown> | undefined
  }
  const mergedRef = composeRefs(forwardedRef as React.Ref<unknown>, childRef)

  return React.cloneElement(
    children as React.ReactElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { ...mergedProps, ref: mergedRef } as any,
  )
})

Slot.displayName = 'Slot'

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps }

  for (const key of Object.keys(childProps)) {
    const slotValue = slotProps[key]
    const childValue = childProps[key]

    // Chain event handlers: child's handler runs after slot's
    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        const child = childValue as (...a: unknown[]) => unknown
        const slot = slotValue as (...a: unknown[]) => unknown
        child(...args)
        slot(...args)
      }
    } else if (key === 'className') {
      merged[key] = [slotValue, childValue].filter(Boolean).join(' ')
    } else if (key === 'style') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    } else if (childValue !== undefined) {
      // Child wins for non-event, non-merged props
      merged[key] = childValue
    }
  }

  return merged
}

type PossibleRef<T> = React.Ref<T> | undefined

function composeRefs<T>(...refs: Array<PossibleRef<T>>): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref != null) {
        const objectRef = ref as React.MutableRefObject<T | null>
        objectRef.current = node
      }
    }
  }
}
