import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from './app.js'

const validPayload = {
  age: 45,
  gender: 'male',
  ethnicity: 3,
  pregnant: false,
  hoursOfSleep: 7,
  troubleSleeping: false,
  sleepDisorder: false,
}

describe('API', () => {
  describe('GET /api/health', () => {
    it('returns ok status', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('POST /api/predict', () => {
    it('returns a risk score for valid input', async () => {
      const response = await request(app)
        .post('/api/predict')
        .send(validPayload)

      expect(response.status).toBe(200)
      expect(response.body.riskScore).toBeCloseTo(0.560133, 5)
    })

    it('returns validation errors for invalid input', async () => {
      const response = await request(app)
        .post('/api/predict')
        .send({ ...validPayload, age: 200, gender: 'other' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'age must be a number between 1 and 120',
          'gender must be "male" or "female"',
        ]),
      )
    })

    it('rejects pregnant male', async () => {
      const response = await request(app)
        .post('/api/predict')
        .send({ ...validPayload, pregnant: true })

      expect(response.status).toBe(400)
      expect(response.body.details).toContain(
        'pregnant cannot be true when gender is male',
      )
    })

    it('returns JSON content type', async () => {
      const response = await request(app)
        .post('/api/predict')
        .send(validPayload)

      expect(response.headers['content-type']).toMatch(/json/)
    })
  })
})
