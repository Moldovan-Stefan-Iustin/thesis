import express from 'express'
import cors from 'cors'
import { predict } from './predictor.js'
import { toModelFeatures, validatePredictionInput } from './features.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/predict', (req, res) => {
  const errors = validatePredictionInput(req.body)

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }

  try {
    const features = toModelFeatures(req.body)
    const riskScore = predict(features)

    res.json({
      riskScore: Number(riskScore.toFixed(6)),
    })
  } catch (error) {
    console.error('Prediction failed:', error)
    res.status(500).json({ error: 'Prediction failed' })
  }
})

export default app
