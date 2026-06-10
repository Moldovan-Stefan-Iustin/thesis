import { describe, it, expect } from 'vitest'
import { predict, FEATURE_NAMES } from './predictor.js'

describe('predictor', () => {
  it('exports the expected NHANES feature names', () => {
    expect(FEATURE_NAMES).toEqual([
      'RIDAGEYR',
      'RIAGENDR',
      'RIDRETH1',
      'RIDEXPRG',
      'SLD010H',
      'SLQ050',
      'SLQ060',
    ])
  })

  it('returns a probability between 0 and 1', () => {
    const score = predict([45, 1, 3, 2, 7, 2, 2])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('returns a stable score for a known feature vector', () => {
    const score = predict([45, 1, 3, 2, 7, 2, 2])
    expect(score).toBeCloseTo(0.560133, 5)
  })

  it('throws when feature count is wrong', () => {
    expect(() => predict([45, 1, 3])).toThrow(
      'Expected 7 features, received 3',
    )
  })

  it('produces different scores for different inputs', () => {
    const lowRisk = predict([25, 2, 3, 2, 9, 2, 2])
    const highRisk = predict([70, 1, 4, 2, 4, 1, 1])
    expect(lowRisk).not.toBeCloseTo(highRisk, 2)
  })
})
