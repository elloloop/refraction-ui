// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import { userEvent } from "@testing-library/user-event"
import { CallControls, CallControlButton } from "../src/index.js"

// React 19 expects this flag to be set when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe("CallControls interaction", () => {
  it("CallControlButton click fires onClick", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(
      <CallControls>
        <CallControlButton label="Mute" onClick={handleClick} />
      </CallControls>
    )
    
    const button = container.querySelector("button")!
    expect(button).not.toBeNull()
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("aria-pressed reflects pressed and toggles", async () => {
    const user = userEvent.setup()
    
    function TestComponent() {
      const [pressed, setPressed] = React.useState(false)
      return (
        <CallControls>
          <CallControlButton 
            label="Mute" 
            pressed={pressed} 
            onClick={() => setPressed(p => !p)} 
          />
        </CallControls>
      )
    }
    
    render(<TestComponent />)
    
    const button = container.querySelector("button")!
    expect(button.getAttribute("aria-pressed")).toBe("false")
    
    await user.click(button)
    expect(button.getAttribute("aria-pressed")).toBe("true")
    
    await user.click(button)
    expect(button.getAttribute("aria-pressed")).toBe("false")
  })

  it("Destructive (leave) button renders + click fires", async () => {
    const user = userEvent.setup()
    const handleLeave = vi.fn()
    
    render(
      <CallControls>
        <CallControlButton label="Leave" tone="destructive" onClick={handleLeave} />
      </CallControls>
    )
    
    const button = container.querySelector("button")!
    expect(button.className).toContain("destructive")
    
    await user.click(button)
    expect(handleLeave).toHaveBeenCalledTimes(1)
  })
})
