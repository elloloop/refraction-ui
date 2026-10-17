// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as React from "react"
import { createRoot, type Root } from "react-dom/client"
import { act } from "react"
import { userEvent } from "@testing-library/user-event"
import { PreCallLobby } from "../src/index.js"

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

describe("PreCallLobby interaction", () => {
  it("Toggle camera flips state + fires onToggleCamera; camera-off shows placeholder", async () => {
    const user = userEvent.setup()
    const handleToggleCamera = vi.fn()
    
    function TestComponent() {
      const [cameraOn, setCameraOn] = React.useState(true)
      return (
        <PreCallLobby 
          cameraOn={cameraOn}
          micOn={true}
          onToggleCamera={() => {
            setCameraOn(v => !v)
            handleToggleCamera()
          }}
          previewSlot={<div data-testid="preview-slot">Video</div>}
        />
      )
    }
    
    render(<TestComponent />)
    
    const toggle = container.querySelector("[data-testid=\"camera-toggle\"]")!
    expect(toggle.getAttribute("aria-pressed")).toBe("true")
    expect(container.querySelector("[data-testid=\"preview-slot\"]")).not.toBeNull()
    expect(container.querySelector("[data-testid=\"camera-off-placeholder\"]")).toBeNull()
    
    await user.click(toggle)
    
    expect(handleToggleCamera).toHaveBeenCalledTimes(1)
    expect(toggle.getAttribute("aria-pressed")).toBe("false")
    expect(container.querySelector("[data-testid=\"preview-slot\"]")).toBeNull()
    expect(container.querySelector("[data-testid=\"camera-off-placeholder\"]")).not.toBeNull()
  })

  it("Toggle mic fires onToggleMic", async () => {
    const user = userEvent.setup()
    const handleToggleMic = vi.fn()
    
    render(
      <PreCallLobby 
        cameraOn={true} 
        micOn={true} 
        onToggleMic={handleToggleMic} 
      />
    )
    
    const toggle = container.querySelector("[data-testid=\"mic-toggle\"]")!
    await user.click(toggle)
    
    expect(handleToggleMic).toHaveBeenCalledTimes(1)
  })

  it("Device <select> change fires onDeviceChange with kind+id", async () => {
    const user = userEvent.setup()
    const handleDeviceChange = vi.fn()
    
    render(
      <PreCallLobby 
        cameraOn={true}
        micOn={true}
        cameras={[{ id: "cam1", label: "Camera 1" }, { id: "cam2", label: "Camera 2" }]}
        microphones={[{ id: "mic1", label: "Mic 1" }, { id: "mic2", label: "Mic 2" }]}
        speakers={[{ id: "spk1", label: "Speaker 1" }, { id: "spk2", label: "Speaker 2" }]}
        selectedCamera="cam1"
        selectedMicrophone="mic1"
        selectedSpeaker="spk1"
        onDeviceChange={handleDeviceChange}
      />
    )
    
    const camSelect = container.querySelector("[data-testid=\"camera-select\"]") as HTMLSelectElement
    await user.selectOptions(camSelect, "cam2")
    expect(handleDeviceChange).toHaveBeenCalledWith("camera", "cam2")
    
    const micSelect = container.querySelector("[data-testid=\"microphone-select\"]") as HTMLSelectElement
    await user.selectOptions(micSelect, "mic2")
    expect(handleDeviceChange).toHaveBeenCalledWith("microphone", "mic2")
    
    const spkSelect = container.querySelector("[data-testid=\"speaker-select\"]") as HTMLSelectElement
    await user.selectOptions(spkSelect, "spk2")
    expect(handleDeviceChange).toHaveBeenCalledWith("speaker", "spk2")
  })

  it("Join button fires onJoin; mic-level meter lit-bar count tracks micLevel", async () => {
    const user = userEvent.setup()
    const handleJoin = vi.fn()
    
    render(
      <PreCallLobby 
        cameraOn={true}
        micOn={true}
        micLevel={0.5} // 50% of 8 bars = 4 lit bars
        onJoin={handleJoin}
      />
    )
    
    const joinBtn = container.querySelector("[data-testid=\"join-button\"]")!
    await user.click(joinBtn)
    expect(handleJoin).toHaveBeenCalledTimes(1)
    
    // Check mic level
    const bars = Array.from(container.querySelectorAll("[data-testid^=\"mic-bar-\"]"))
    expect(bars.length).toBe(8)
    const litBars = bars.filter(b => b.getAttribute("data-lit") === "true")
    expect(litBars.length).toBe(4)
  })
})
