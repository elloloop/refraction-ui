// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import userEvent from "@testing-library/user-event"
import { Checklist } from "../src/index.js"

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

const defaultItems = [
  { id: "1", label: "Item 1", checked: false },
  { id: "2", label: "Item 2", checked: true },
  { id: "3", label: "Item 3", checked: false }
]

describe("Checklist interactions", () => {
  it("Clicking an item toggles checked (uncontrolled) + fires onItemToggle/onChange", async () => {
    const onChange = vi.fn()
    const onItemToggle = vi.fn()
    
    render(<Checklist defaultItems={defaultItems} onChange={onChange} onItemToggle={onItemToggle} />)

    const items = container.querySelectorAll("button[role=\"checkbox\"]")
    expect(items.length).toBe(3)
    
    expect(items[0].getAttribute("aria-checked")).toBe("false")
    
    await act(async () => {
      await userEvent.click(items[0])
    })
    
    expect(items[0].getAttribute("aria-checked")).toBe("true")
    expect(onItemToggle).toHaveBeenCalledWith("1")
    expect(onChange).toHaveBeenCalled()
    const newItems = onChange.mock.calls[0][0]
    expect(newItems[0].checked).toBe(true)
  })

  it("aria-checked flips on toggle", async () => {
    render(<Checklist defaultItems={defaultItems} />)
    const items = container.querySelectorAll("button[role=\"checkbox\"]")
    
    expect(items[1].getAttribute("aria-checked")).toBe("true")
    await act(async () => {
      await userEvent.click(items[1])
    })
    expect(items[1].getAttribute("aria-checked")).toBe("false")
  })

  it("Progress summary updates {completed}/{total} when showProgress", async () => {
    render(<Checklist defaultItems={defaultItems} showProgress />)
    
    const getProgress = () => Array.from(container.querySelectorAll("p")).find(p => p.textContent?.includes("completed"))?.textContent

    expect(getProgress()).toBe("1/3 completed")
    
    const items = container.querySelectorAll("button[role=\"checkbox\"]")
    await act(async () => {
      await userEvent.click(items[0])
    })
    
    expect(getProgress()).toBe("2/3 completed")
  })

  it("Controlled items: clicks fire callback, state follows props", async () => {
    const onChange = vi.fn()
    render(<Checklist items={defaultItems} onChange={onChange} />)
    
    const items = container.querySelectorAll("button[role=\"checkbox\"]")
    
    await act(async () => {
      await userEvent.click(items[0])
    })
    
    expect(onChange).toHaveBeenCalled()
    // It is controlled, so state doesn't change
    expect(items[0].getAttribute("aria-checked")).toBe("false")
  })

  it("Toggle is pure (other items unchanged)", async () => {
    let currentItems = defaultItems
    const onChange = (newItems: any) => {
      currentItems = newItems
    }
    render(<Checklist defaultItems={defaultItems} onChange={onChange} />)
    
    const items = container.querySelectorAll("button[role=\"checkbox\"]")
    await act(async () => {
      await userEvent.click(items[0])
    })
    
    expect(currentItems[1].checked).toBe(true)
    expect(currentItems[2].checked).toBe(false)
  })
})
