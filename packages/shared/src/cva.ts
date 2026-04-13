/**
 * Lightweight class-variance-authority alternative — zero dependencies.
 * Creates variant-driven class name functions for components.
 */

interface VariantConfig {
  [variant: string]: Record<string, string>
}

interface CVAConfig<V extends VariantConfig> {
  base?: string
  variants?: V
  defaultVariants?: {
    [K in keyof V]?: keyof V[K]
  }
  compoundVariants?: Array<
    {
      [K in keyof V]?: keyof V[K]
    } & { class: string }
  >
}

type VariantProps<V extends VariantConfig> = {
  [K in keyof V]?: keyof V[K]
}

export function cva<V extends VariantConfig>(config: CVAConfig<V>) {
  return (props?: VariantProps<V> & { className?: string }): string => {
    const classes: string[] = []

    if (config.base) {
      classes.push(config.base)
    }

    if (config.variants) {
      for (const [variantKey, variantOptions] of Object.entries(config.variants)) {
        const selectedValue =
          (props as Record<string, unknown> | undefined)?.[variantKey] ??
          config.defaultVariants?.[variantKey]

        if (selectedValue != null) {
          const variantClass = (variantOptions as Record<string, string>)[
            selectedValue as string
          ]
          if (variantClass) {
            classes.push(variantClass)
          }
        }
      }
    }

    if (config.compoundVariants) {
      for (const compound of config.compoundVariants) {
        const { class: compoundClass, ...conditions } = compound
        let matches = true

        for (const [key, value] of Object.entries(conditions)) {
          const propValue =
            (props as Record<string, unknown>)?.[key] ??
            config.defaultVariants?.[key]
          if (propValue !== value) {
            matches = false
            break
          }
        }

        if (matches) {
          classes.push(compoundClass as string)
        }
      }
    }

    if (props?.className) {
      classes.push(props.className)
    }

    return classes.filter(Boolean).join(' ')
  }
}
