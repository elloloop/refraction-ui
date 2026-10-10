import {describe,it,expect} from 'vitest'
import {renderToString} from 'react-dom/server'
import {CelebrationScene} from '../src'
describe('CelebrationScene SSR structure',()=>{
 it('is decorative and supports settled output',()=>{
  const out=renderToString(<CelebrationScene scene="heart-bloom" animate={false}/>)
  expect(out).toContain('aria-hidden="true"');expect(out).toContain('data-animate="false"')
  expect(out).toContain('<svg');expect(out).not.toContain('<button')
 })
})
