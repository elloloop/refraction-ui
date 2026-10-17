// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import userEvent from "@testing-library/user-event"
import { Wizard } from "../src/index.js"

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

const steps = [
  { id: "1", label: "Step 1" },
  { id: "2", label: "Step 2", optional: true },
  { id: "3", label: "Step 3" }
]

describe("Wizard interactions", () => {
  it("Next advances step + fires onStepChange; Back goes to previous", async () => {
    const onStepChange = vi.fn()
    render(
      <Wizard steps={steps} onStepChange={onStepChange}>
        {(index) => <div data-testid="content">Content {index}</div>}
      </Wizard>
    )

    const nextBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Next")
    expect(nextBtn).toBeDefined()
    
    await act(async () => {
      await userEvent.click(nextBtn!)
    })
    
    expect(onStepChange).toHaveBeenCalledWith(1)
    
    const backBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Back")
    expect(backBtn).toBeDefined()
    
    await act(async () => {
      await userEvent.click(backBtn!)
    })
    
    expect(onStepChange).toHaveBeenCalledWith(0)
  })

  it("Skip shows only on optional steps and advances", async () => {
    const onStepChange = vi.fn()
    render(
      <Wizard steps={steps} defaultStep={1} onStepChange={onStepChange}>
        {() => null}
      </Wizard>
    )

    const skipBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Skip")
    expect(skipBtn).toBeDefined()

    await act(async () => {
      await userEvent.click(skipBtn!)
    })
    
    expect(onStepChange).toHaveBeenCalledWith(2)
  })

  it("Complete fires onComplete on the final step (no further advance)", async () => {
    const onComplete = vi.fn()
    const onStepChange = vi.fn()
    render(
      <Wizard steps={steps} defaultStep={2} onComplete={onComplete} onStepChange={onStepChange}>
        {() => null}
      </Wizard>
    )

    const completeBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Complete")
    expect(completeBtn).toBeDefined()

    await act(async () => {
      await userEvent.click(completeBtn!)
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onStepChange).not.toHaveBeenCalled()
  })

  it("Controlled step: buttons fire callbacks but active step follows the prop", async () => {
    const onStepChange = vi.fn()
    render(
      <Wizard steps={steps} step={1} onStepChange={onStepChange}>
        {(index) => <div data-testid="content">Content {index}</div>}
      </Wizard>
    )

    const nextBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Next")
    
    await act(async () => {
      await userEvent.click(nextBtn!)
    })
    
    expect(onStepChange).toHaveBeenCalledWith(2)
    // Should still render content for index 1
    const content = container.querySelector('[data-testid="content"]')
    expect(content?.textContent).toBe("Content 1")
  })

  it("Active step content renders for the current index", () => {
    render(
      <Wizard steps={steps} defaultStep={2}>
        {(index) => <div data-testid="content">Content {index}</div>}
      </Wizard>
    )
    
    const content = container.querySelector('[data-testid="content"]')
    expect(content?.textContent).toBe("Content 2")
  })

  it("Back disabled on first step", () => {
    render(
      <Wizard steps={steps} defaultStep={0}>
        {() => null}
      </Wizard>
    )
    
    const backBtn = Array.from(container.querySelectorAll("button")).find(b => b.textContent === "Back")
    expect(backBtn?.hasAttribute("disabled")).toBe(true)
  })
})
