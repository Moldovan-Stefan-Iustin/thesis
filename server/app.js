import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { predict } from './predictor.js'
import { toModelFeatures, validatePredictionInput } from './features.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist')

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

if (process.env.NODE_ENV === 'production' && existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

export default app
