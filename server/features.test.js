import { describe, it, expect } from 'vitest'
import { toModelFeatures, validatePredictionInput } from './features.js'

const validInput = {
  age: 45,
  gender: 'male',
  ethnicity: 3,
  pregnant: false,
  hoursOfSleep: 7,
  troubleSleeping: false,
  sleepDisorder: false,
}

describe('toModelFeatures', () => {
  it('maps form input to NHANES feature order', () => {
    expect(toModelFeatures(validInput)).toEqual([45, 1, 3, 2, 7, 2, 2])
  })

  it('encodes female gender and checked medical flags as 1', () => {
    expect(
      toModelFeatures({
        ...validInput,
        gender: 'female',
        pregnant: true,
        troubleSleeping: true,
        sleepDisorder: true,
      }),
    ).toEqual([45, 2, 3, 1, 7, 1, 1])
  })
})

describe('validatePredictionInput', () => {
  it('returns no errors for valid input', () => {
    expect(validatePredictionInput(validInput)).toEqual([])
  })

  it('rejects invalid age', () => {
    const errors = validatePredictionInput({ ...validInput, age: 0 })
    expect(errors).toContain('age must be a number between 1 and 120')
  })

  it('rejects invalid gender', () => {
    const errors = validatePredictionInput({ ...validInput, gender: 'other' })
    expect(errors).toContain('gender must be "male" or "female"')
  })

  it('rejects invalid ethnicity', () => {
    const errors = validatePredictionInput({ ...validInput, ethnicity: 6 })
    expect(errors).toContain('ethnicity must be an integer between 1 and 5')
  })

  it('rejects invalid hours of sleep', () => {
    const errors = validatePredictionInput({ ...validInput, hoursOfSleep: 25 })
    expect(errors).toContain('hoursOfSleep must be a number between 0 and 24')
  })

  it('rejects non-boolean medical flags', () => {
    const errors = validatePredictionInput({ ...validInput, pregnant: 'yes' })
    expect(errors).toContain('pregnant must be a boolean')
  })

  it('rejects pregnant male', () => {
    const errors = validatePredictionInput({ ...validInput, pregnant: true })
    expect(errors).toContain('pregnant cannot be true when gender is male')
  })

  it('collects multiple validation errors', () => {
    const errors = validatePredictionInput({
      age: -5,
      gender: 'unknown',
      ethnicity: 0,
      pregnant: 'yes',
      hoursOfSleep: 30,
      troubleSleeping: 'no',
      sleepDisorder: null,
    })

    expect(errors.length).toBeGreaterThan(1)
  })
})
