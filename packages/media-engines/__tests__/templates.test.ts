import { describe, it, expect } from 'vitest'
import {
  TEMPLATES,
  createProjectFromTemplate,
  getAvailableTemplates,
} from '../src/templates.js'
import type { ProjectTemplate, Speaker } from '../src/templates.js'

// ---------------------------------------------------------------------------
// TEMPLATES registry
// ---------------------------------------------------------------------------
describe('TEMPLATES', () => {
  it('should contain a blank template', () => {
    expect(TEMPLATES.blank).toBeDefined()
    expect(TEMPLATES.blank.name).toBe('blank')
  })

  it('should contain a podcast template', () => {
    expect(TEMPLATES.podcast).toBeDefined()
    expect(TEMPLATES.podcast.name).toBe('podcast')
  })

  it('should contain a tutorial template', () => {
    expect(TEMPLATES.tutorial).toBeDefined()
    expect(TEMPLATES.tutorial.name).toBe('tutorial')
  })

  it('should contain an audiobook template', () => {
    expect(TEMPLATES.audiobook).toBeDefined()
    expect(TEMPLATES.audiobook.name).toBe('audiobook')
  })

  it('should contain an interview template', () => {
    expect(TEMPLATES.interview).toBeDefined()
    expect(TEMPLATES.interview.name).toBe('interview')
  })

  it('podcast template should have 30min duration, 3 tracks, 2 speakers', () => {
    const t = TEMPLATES.podcast
    expect(t.duration).toBe(30 * 60)
    expect(t.tracks.length).toBe(3)
    expect(t.speakers?.length).toBe(2)
  })

  it('tutorial template should have 10min duration and 3 tracks', () => {
    const t = TEMPLATES.tutorial
    expect(t.duration).toBe(10 * 60)
    expect(t.tracks.length).toBe(3)
  })

  it('audiobook template should have 1hr duration and 2 tracks', () => {
    const t = TEMPLATES.audiobook
    expect(t.duration).toBe(60 * 60)
    expect(t.tracks.length).toBe(2)
  })

  it('interview template should have 20min duration and 4 tracks', () => {
    const t = TEMPLATES.interview
    expect(t.duration).toBe(20 * 60)
    expect(t.tracks.length).toBe(4)
  })

  it('all templates should have valid resolution', () => {
    for (const key of Object.keys(TEMPLATES)) {
      const t = TEMPLATES[key]
      expect(t.resolution.width).toBeGreaterThan(0)
      expect(t.resolution.height).toBeGreaterThan(0)
    }
  })

  it('speaker objects should have id, name, color', () => {
    const speakers = TEMPLATES.podcast.speakers!
    speakers.forEach((s) => {
      expect(s.id).toBeDefined()
      expect(s.name).toBeDefined()
      expect(s.color).toBeDefined()
    })
  })
})

// ---------------------------------------------------------------------------
// createProjectFromTemplate
// ---------------------------------------------------------------------------
describe('createProjectFromTemplate', () => {
  it('should return a Timeline for a valid template name', () => {
    const tl = createProjectFromTemplate('blank')
    expect(tl).toBeDefined()
    expect(tl.fps).toBeGreaterThan(0)
    expect(Array.isArray(tl.tracks)).toBe(true)
  })

  it('should create a timeline matching podcast template', () => {
    const tl = createProjectFromTemplate('podcast')
    expect(tl.tracks.length).toBe(3)
    expect(tl.duration).toBe(30 * 60)
  })

  it('should throw for unknown template name', () => {
    expect(() => createProjectFromTemplate('nonexistent')).toThrow()
  })

  it('should return a new object each time (no shared state)', () => {
    const a = createProjectFromTemplate('blank')
    const b = createProjectFromTemplate('blank')
    expect(a).not.toBe(b)
    a.fps = 999
    expect(b.fps).not.toBe(999)
  })
})

// ---------------------------------------------------------------------------
// getAvailableTemplates
// ---------------------------------------------------------------------------
describe('getAvailableTemplates', () => {
  it('should return all 5 templates', () => {
    const templates = getAvailableTemplates()
    expect(templates.length).toBe(5)
  })

  it('should return ProjectTemplate objects', () => {
    const templates = getAvailableTemplates()
    templates.forEach((t) => {
      expect(t.name).toBeDefined()
      expect(t.description).toBeDefined()
      expect(t.duration).toBeGreaterThanOrEqual(0)
    })
  })

  it('should not return references to the internal registry', () => {
    const templates = getAvailableTemplates()
    templates[0].name = 'MUTATED'
    expect(TEMPLATES.blank.name).toBe('blank')
  })
})
