// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import { userEvent } from "@testing-library/user-event"
import { FloatingReactions, useFloatingReactions } from "../src/index.js"
import { REACTION_LIFETIME_MS } from "@refraction-ui/floating-reactions"

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  vi.useFakeTimers()
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe("FloatingReactions interaction", () => {
  it("useFloatingReactions: emitting adds a reaction", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    function TestComponent() {
      const { reactions, emit } = useFloatingReactions()
      return (
        <div>
          <FloatingReactions reactions={reactions} />
          <button onClick={() => emit("👍")}>Like</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const btn = container.querySelector("button")!
    await user.click(btn)
    
    const items = container.querySelectorAll("span[aria-hidden=\"true\"]")
    expect(items.length).toBe(1)
    expect(items[0].textContent).toContain("👍")
  })

  it("Each reaction auto-expires after REACTION_LIFETIME_MS", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    function TestComponent() {
      const { reactions, emit } = useFloatingReactions()
      return (
        <div>
          <FloatingReactions reactions={reactions} />
          <button onClick={() => emit("🔥")}>Fire</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const btn = container.querySelector("button")!
    await user.click(btn)
    
    expect(container.querySelectorAll("span[aria-hidden=\"true\"]").length).toBe(1)
    
    act(() => {
      vi.advanceTimersByTime(REACTION_LIFETIME_MS)
    })
    
    expect(container.querySelectorAll("span[aria-hidden=\"true\"]").length).toBe(0)
  })

  it("Multiple emits stack and expire independently", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    function TestComponent() {
      const { reactions, emit } = useFloatingReactions()
      return (
        <div>
          <FloatingReactions reactions={reactions} />
          <button data-testid="b1" onClick={() => emit("A")}>A</button>
          <button data-testid="b2" onClick={() => emit("B")}>B</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const b1 = container.querySelector("[data-testid=\"b1\"]")!
    const b2 = container.querySelector("[data-testid=\"b2\"]")!
    
    await user.click(b1)
    
    act(() => {
      vi.advanceTimersByTime(REACTION_LIFETIME_MS / 2)
    })
    
    await user.click(b2)
    
    expect(container.querySelectorAll("span[aria-hidden=\"true\"]").length).toBe(2)
    
    act(() => {
      vi.advanceTimersByTime(REACTION_LIFETIME_MS / 2)
    })
    
    // First reaction should expire, second remains
    const remaining1 = container.querySelectorAll("span[aria-hidden=\"true\"]")
    expect(remaining1.length).toBe(1)
    expect(remaining1[0].textContent).toContain("B")
    
    act(() => {
      vi.advanceTimersByTime(REACTION_LIFETIME_MS / 2)
    })
    
    // Second reaction expires
    expect(container.querySelectorAll("span[aria-hidden=\"true\"]").length).toBe(0)
  })

  it("ids stable/unique without Math.random", async () => {
    let capturedReactions: any[] = []
    function TestComponent() {
      const { reactions, emit } = useFloatingReactions()
      capturedReactions = reactions
      return (
        <div>
          <FloatingReactions reactions={reactions} />
          <button onClick={() => emit("A")}>Emit</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    const btn = container.querySelector("button")!
    
    // User clicks manually without userEvent since fake timers with userEvent can be tricky sometimes
    act(() => { btn.click() })
    act(() => { btn.click() })
    
    expect(capturedReactions.length).toBe(2)
    expect(capturedReactions[0].id).toBe("fr-1")
    expect(capturedReactions[1].id).toBe("fr-2")
  })
})
