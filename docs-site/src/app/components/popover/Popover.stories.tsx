import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@refraction-ui/react-popover'
import { PopoverExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Overlays/Popover' }
export default meta

export const Basic = { render: () => <PopoverExamples section="basic" /> }

export const Placements = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-16 p-16">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side} placement={side} defaultOpen>
          <PopoverTrigger className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1.5 text-xs font-medium capitalize hover:bg-secondary/80">
            {side}
          </PopoverTrigger>
          <PopoverContent className="w-44 p-3">
            <p className="text-sm text-muted-foreground">
              This popover is placed on the {side}.
            </p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
}
