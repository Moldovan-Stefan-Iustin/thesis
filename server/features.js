import { FEATURE_NAMES } from './predictor.js'

const GENDER_CODES = { male: 1, female: 2 }

export function toModelFeatures(input) {
  const {
    age,
    gender,
    ethnicity,
    pregnant,
    hoursOfSleep,
    troubleSleeping,
    sleepDisorder,
  } = input

  const featureMap = {
    RIDAGEYR: Number(age),
    RIAGENDR: GENDER_CODES[gender],
    RIDRETH1: Number(ethnicity),
    RIDEXPRG: pregnant ? 1 : 2,
    SLD010H: Number(hoursOfSleep),
    SLQ050: troubleSleeping ? 1 : 2,
    SLQ060: sleepDisorder ? 1 : 2,
  }

  return FEATURE_NAMES.map((name) => featureMap[name])
}

export function validatePredictionInput(body) {
  const errors = []

  const age = Number(body.age)
  if (!Number.isFinite(age) || age < 1 || age > 120) {
    errors.push('age must be a number between 1 and 120')
  }

  if (!['male', 'female'].includes(body.gender)) {
    errors.push('gender must be "male" or "female"')
  }

  const ethnicity = Number(body.ethnicity)
  if (!Number.isInteger(ethnicity) || ethnicity < 1 || ethnicity > 5) {
    errors.push('ethnicity must be an integer between 1 and 5')
  }

  const hoursOfSleep = Number(body.hoursOfSleep)
  if (!Number.isFinite(hoursOfSleep) || hoursOfSleep < 0 || hoursOfSleep > 24) {
    errors.push('hoursOfSleep must be a number between 0 and 24')
  }

  if (typeof body.pregnant !== 'boolean') {
    errors.push('pregnant must be a boolean')
  }

  if (typeof body.troubleSleeping !== 'boolean') {
    errors.push('troubleSleeping must be a boolean')
  }

  if (typeof body.sleepDisorder !== 'boolean') {
    errors.push('sleepDisorder must be a boolean')
  }

  if (body.gender === 'male' && body.pregnant === true) {
    errors.push('pregnant cannot be true when gender is male')
  }

  return errors
}
