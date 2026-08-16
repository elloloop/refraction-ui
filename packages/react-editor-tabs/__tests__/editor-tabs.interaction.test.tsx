// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import userEvent from "@testing-library/user-event"
import { EditorTabs } from "../src/index.js"

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

const defaultTabs = [
  { id: "1", label: "File1.ts" },
  { id: "2", label: "File2.ts", closable: true },
  { id: "3", label: "File3.ts", dirty: true, closable: true }
]

describe("EditorTabs interactions", () => {
  it("Clicking a tab fires onSelect with its id; aria-selected moves", async () => {
    const onSelect = vi.fn()
    
    render(<EditorTabs tabs={defaultTabs} activeId="1" onSelect={onSelect} />)

    const tabs = container.querySelectorAll("button[role=\"tab\"]")
    expect(tabs.length).toBe(3)
    
    expect(tabs[0].getAttribute("aria-selected")).toBe("true")
    expect(tabs[1].getAttribute("aria-selected")).toBe("false")
    
    await act(async () => {
      await userEvent.click(tabs[1])
    })
    
    expect(onSelect).toHaveBeenCalledWith("2")
    
    // Simulate parent updating prop
    render(<EditorTabs tabs={defaultTabs} activeId="2" onSelect={onSelect} />)
    expect(tabs[0].getAttribute("aria-selected")).toBe("false")
    expect(tabs[1].getAttribute("aria-selected")).toBe("true")
  })

  it("Close button fires onClose and does NOT trigger onSelect (stopPropagation)", async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    
    render(<EditorTabs tabs={defaultTabs} activeId="1" onSelect={onSelect} onClose={onClose} />)

    const tabs = container.querySelectorAll("button[role=\"tab\"]")
    const closeBtn = tabs[1].querySelector("[aria-label=\"Close File2.ts\"]")
    expect(closeBtn).toBeDefined()
    
    await act(async () => {
      await userEvent.click(closeBtn!)
    })
    
    expect(onClose).toHaveBeenCalledWith("2")
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("ArrowLeft/Right move active tab (roving, wrap), Home/End jump", async () => {
    const onSelect = vi.fn()
    
    render(<EditorTabs tabs={defaultTabs} activeId="2" onSelect={onSelect} />)
    const tabs = container.querySelectorAll("button[role=\"tab\"]")
    
    tabs[1].focus()
    
    await act(async () => {
      await userEvent.keyboard("{ArrowRight}")
    })
    expect(onSelect).toHaveBeenCalledWith("3")
    
    onSelect.mockClear()
    // Test wrap right to left
    render(<EditorTabs tabs={defaultTabs} activeId="3" onSelect={onSelect} />)
    tabs[2].focus()
    await act(async () => {
      await userEvent.keyboard("{ArrowRight}")
    })
    expect(onSelect).toHaveBeenCalledWith("1")
    
    onSelect.mockClear()
    // Test wrap left to right
    render(<EditorTabs tabs={defaultTabs} activeId="1" onSelect={onSelect} />)
    tabs[0].focus()
    await act(async () => {
      await userEvent.keyboard("{ArrowLeft}")
    })
    expect(onSelect).toHaveBeenCalledWith("3")
    
    onSelect.mockClear()
    await act(async () => {
      await userEvent.keyboard("{Home}")
    })
    expect(onSelect).toHaveBeenCalledWith("1")
    
    onSelect.mockClear()
    await act(async () => {
      await userEvent.keyboard("{End}")
    })
    expect(onSelect).toHaveBeenCalledWith("3")
  })

  it("Close button only when closable; dirty dot when dirty", () => {
    render(<EditorTabs tabs={defaultTabs} activeId="1" onSelect={() => {}} />)
    
    const tabs = container.querySelectorAll("button[role=\"tab\"]")
    
    // Tab 1 (not closable, not dirty)
    expect(tabs[0].querySelector("[aria-label^=\"Close\"]")).toBeNull()
    expect(tabs[0].querySelector("[aria-label=\"unsaved changes\"]")).toBeNull()
    
    // Tab 2 (closable, not dirty)
    expect(tabs[1].querySelector("[aria-label^=\"Close\"]")).not.toBeNull()
    expect(tabs[1].querySelector("[aria-label=\"unsaved changes\"]")).toBeNull()
    
    // Tab 3 (closable, dirty)
    expect(tabs[2].querySelector("[aria-label^=\"Close\"]")).not.toBeNull()
    expect(tabs[2].querySelector("[aria-label=\"unsaved changes\"]")).not.toBeNull()
  })
})
