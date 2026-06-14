// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import userEvent from "@testing-library/user-event"
import { RatingScale } from "../src/index.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container;
let root;

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

function render(ui) {
  act(() => {
    root.render(ui)
  })
}

describe("RatingScale interactions", () => {
  it("updates selection and fires onValueChange on click (uncontrolled)", async () => {
    const onChange = vi.fn()
    render(<RatingScale count={5} onValueChange={onChange} />)

    const points = container.querySelectorAll('button[role="radio"]')
    expect(points.length).toBe(5)

    expect(points[0].getAttribute("aria-checked")).toBe("false")

    await act(async () => {
      await userEvent.click(points[2])
    })

    expect(onChange).toHaveBeenCalledWith(3)
    expect(points[2].getAttribute("aria-checked")).toBe("true")
  })

  it("ArrowRight/ArrowUp -> next, ArrowLeft/Down -> previous, clamped at ends", async () => {
    const onChange = vi.fn()
    render(<RatingScale count={3} defaultValue={2} onValueChange={onChange} />)

    const points = container.querySelectorAll('button[role="radio"]')
    expect(points[1].getAttribute("aria-checked")).toBe("true")
    points[1].focus()

    await act(async () => {
      await userEvent.keyboard("{ArrowRight}")
    })
    expect(onChange).toHaveBeenCalledWith(3)
    expect(points[2].getAttribute("aria-checked")).toBe("true")

    onChange.mockClear()
    await act(async () => {
      await userEvent.keyboard("{ArrowRight}")
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(points[2].getAttribute("aria-checked")).toBe("true")

    await act(async () => {
      await userEvent.keyboard("{ArrowLeft}")
    })
    expect(onChange).toHaveBeenCalledWith(2)

    await act(async () => {
      await userEvent.keyboard("{ArrowDown}")
    })
    expect(onChange).toHaveBeenCalledWith(1)

    await act(async () => {
      await userEvent.keyboard("{ArrowUp}")
    })
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it("Home selects first, End selects last", async () => {
    const onChange = vi.fn()
    render(<RatingScale count={4} defaultValue={2} onValueChange={onChange} />)

    const points = container.querySelectorAll('button[role="radio"]')
    points[1].focus()

    await act(async () => {
      await userEvent.keyboard("{End}")
    })
    expect(onChange).toHaveBeenCalledWith(4)
    expect(points[3].getAttribute("aria-checked")).toBe("true")

    await act(async () => {
      await userEvent.keyboard("{Home}")
    })
    expect(onChange).toHaveBeenCalledWith(1)
    expect(points[0].getAttribute("aria-checked")).toBe("true")
  })

  it("controlled value: clicks fire onValueChange but selection stays until parent updates", async () => {
    const onChange = vi.fn()
    render(<RatingScale count={3} value={1} onValueChange={onChange} />)

    const points = container.querySelectorAll('button[role="radio"]')
    
    await act(async () => {
      await userEvent.click(points[2])
    })

    expect(onChange).toHaveBeenCalledWith(3)
    expect(points[0].getAttribute("aria-checked")).toBe("true")
    expect(points[2].getAttribute("aria-checked")).toBe("false")
  })

  it("roving tabindex: only the selected (or first) point is tabbable", () => {
    render(<RatingScale count={3} defaultValue={2} />)
    const points = container.querySelectorAll('button[role="radio"]')
    
    expect(points[0].getAttribute("tabindex")).toBe("-1")
    expect(points[1].getAttribute("tabindex")).toBe("0")
    expect(points[2].getAttribute("tabindex")).toBe("-1")
    
    act(() => {
      root.render(<RatingScale key="new" count={3} />)
    })
    
    const newPoints = container.querySelectorAll('button[role="radio"]')
    expect(newPoints[0].getAttribute("tabindex")).toBe("0")
    expect(newPoints[1].getAttribute("tabindex")).toBe("-1")
    expect(newPoints[2].getAttribute("tabindex")).toBe("-1")
  })

  it("disabled: clicks/keys are no-ops", async () => {
    const onChange = vi.fn()
    render(<RatingScale count={3} disabled onValueChange={onChange} />)

    const points = container.querySelectorAll('button[role="radio"]')
    
    await act(async () => {
      await userEvent.click(points[1])
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(points[1].getAttribute("aria-checked")).toBe("false")

    points[0].focus()
    await act(async () => {
      await userEvent.keyboard("{ArrowRight}")
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(points[1].getAttribute("aria-checked")).toBe("false")
  })
})
