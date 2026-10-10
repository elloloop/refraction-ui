import {describe,it,expect} from 'vitest'
import {celebrationSceneSVG,celebrationSceneStyles,celebrationSceneCSS} from '../src'
describe('celebration scenes',()=>{
 it('has twenty distinct deterministic inert illustrations',()=>{
  const scenes=celebrationSceneStyles.map(celebrationSceneSVG)
  expect(new Set(scenes).size).toBe(20)
  for(const s of scenes){expect(s).toContain('aria-hidden="true"');expect(s).not.toMatch(/<script|<image|href=|onload=/);expect(s).toContain('<path')}
  expect(celebrationSceneSVG('rocket')).toBe(celebrationSceneSVG('rocket'))
 })
 it('rejects unknown styles and honors reduced motion in CSS',()=>{
  expect(()=>celebrationSceneSVG('unknown' as never)).toThrow('Unknown')
  expect(celebrationSceneCSS).toContain('prefers-reduced-motion:reduce')
  expect(celebrationSceneCSS).toContain('2400ms')
  expect(celebrationSceneCSS).not.toContain('infinite')
 })
})
