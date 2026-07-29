import { describe, it, expect } from 'vitest'
import {
  createSteps,
  createStep,
  createStepIndicator,
  createStepContent,
  createStepTitle,
  createStepDescription,
} from '../src/index.js'

describe('steps core — data-slot contract', () => {
  it('exposes the full steps slot family', () => {
    expect({
      steps: createSteps().dataAttributes['data-slot'],
      step: createStep().dataAttributes['data-slot'],
      indicator: createStepIndicator().dataAttributes['data-slot'],
      content: createStepContent().dataAttributes['data-slot'],
      title: createStepTitle().dataAttributes['data-slot'],
      description: createStepDescription().dataAttributes['data-slot'],
    }).toEqual({
      steps: 'steps',
      step: 'step',
      indicator: 'step-indicator',
      content: 'step-content',
      title: 'step-title',
      description: 'step-description',
    })
  })
})
