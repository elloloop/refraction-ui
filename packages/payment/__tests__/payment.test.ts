import { describe, it, expect } from 'vitest'
import { createPayment } from '../src/index.js'

describe('payment core — data-slot contract', () => {
  it('exposes the payment data-slot on the returned props', () => {
    expect(createPayment()).toEqual({
      props: { 'data-slot': 'payment' },
    })
  })
})
