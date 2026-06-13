import { describe, it, expect } from 'vitest'
import { createPreCallLobby, micLevelToBars } from '../src/index.js'

describe('micLevelToBars', () => {
  it('returns 0 for level 0', () => {
    expect(micLevelToBars(0, 10)).toBe(0)
  })

  it('returns barCount for level 1', () => {
    expect(micLevelToBars(1, 10)).toBe(10)
  })

  it('returns half barCount for level 0.5', () => {
    expect(micLevelToBars(0.5, 10)).toBe(5)
  })

  it('clamps levels above 1', () => {
    expect(micLevelToBars(1.5, 8)).toBe(8)
  })

  it('clamps levels below 0', () => {
    expect(micLevelToBars(-0.3, 8)).toBe(0)
  })

  it('returns 0 when barCount is 0', () => {
    expect(micLevelToBars(0.8, 0)).toBe(0)
  })
})

describe('createPreCallLobby', () => {
  it('sets role="group" and aria-label on ariaProps', () => {
    const { ariaProps } = createPreCallLobby({ cameraOn: true, micOn: true })
    expect(ariaProps.role).toBe('group')
    expect(ariaProps['aria-label']).toBe('Device setup')
  })

  it('sets data-camera="on" when camera is on', () => {
    const { dataAttributes } = createPreCallLobby({ cameraOn: true, micOn: false })
    expect(dataAttributes['data-camera']).toBe('on')
  })

  it('sets data-camera="off" when camera is off', () => {
    const { dataAttributes } = createPreCallLobby({ cameraOn: false, micOn: true })
    expect(dataAttributes['data-camera']).toBe('off')
  })

  it('sets data-mic="on" when mic is on', () => {
    const { dataAttributes } = createPreCallLobby({ cameraOn: false, micOn: true })
    expect(dataAttributes['data-mic']).toBe('on')
  })

  it('sets data-mic="off" when mic is off', () => {
    const { dataAttributes } = createPreCallLobby({ cameraOn: true, micOn: false })
    expect(dataAttributes['data-mic']).toBe('off')
  })
})
