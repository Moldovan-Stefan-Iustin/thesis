import { useState } from 'react'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [riskScore, setRiskScore] = useState(0)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const form = e.target
    const formData = new FormData(form)

    const payload = {
      age: Number(formData.get('patient_age')),
      gender: formData.get('patient_gender'),
      ethnicity: Number(formData.get('patient_ethnicity')),
      pregnant: formData.get('patient_pregnant') === 'on',
      hoursOfSleep: Number(formData.get('patient_hours_of_sleep')),
      troubleSleeping: formData.get('patient_trouble_sleeping') === 'on',
      sleepDisorder: formData.get('patient_sleep_disorder') === 'on',
    }

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        const message = data.details?.join(', ') || data.error || 'Prediction failed'
        throw new Error(message)
      }

      setRiskScore(data.riskScore)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const degrees = (riskScore * 180) - 90

  return (
    <>
      <br/>
      <section id="center">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1>Get your hypertension #riskScore💤</h1>
          <p>
            Fill in your data below and get a risk prediction now: 
          </p>
        </div>

        <div className="form-wrapper">
          <form className="patient-form" onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label htmlFor="patient_age">Age</label>
              <input type="number" id="patient_age" name="patient_age" placeholder="e.g. 34" required min="1" max="120"/>
            </div>

            <div className="form-group">
              <label htmlFor="patient_gender">Gender</label>
              <select id="patient_gender" name="patient_gender" defaultValue="" required>
                <option value="" disabled>Select gender...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="patient_ethnicity">Race / Ethnicity</label>
              <select id="patient_ethnicity" name="patient_ethnicity" defaultValue="" required>
                <option value="" disabled>Select race/ethnicity...</option>
                <option value="1">Mexican American</option>
                <option value="2">Other Hispanic</option>
                <option value="3">Non-Hispanic White</option>
                <option value="4">Non-Hispanic Black</option>
                <option value="5">Other Race</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="patient_hours_of_sleep">Hours of sleep per night</label>
              <input type="number" id="patient_hours_of_sleep" name="patient_hours_of_sleep" placeholder="e.g. 8" required min="0" max="24" step="0.5"/>
            </div>

            <fieldset className="checkbox-group">
              <legend>Medical History</legend>
              
              <label className="checkbox-label" htmlFor="patient_pregnant">
                <input type="checkbox" id="patient_pregnant" name="patient_pregnant"/>
                Are you pregnant?
              </label>
              
              <label className="checkbox-label" htmlFor="patient_trouble_sleeping">
                <input type="checkbox" id="patient_trouble_sleeping" name="patient_trouble_sleeping"/>
                Diagnosed with trouble sleeping?
              </label>
              
              <label className="checkbox-label" htmlFor="patient_sleep_disorder">
                <input type="checkbox" id="patient_sleep_disorder" name="patient_sleep_disorder"/>
                Diagnosed with sleep disorder?
              </label>
            </fieldset>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Analyzing Risk..." : "Get #riskScore prediction"}
            </button>
          </form>

          <div className="result-container" id="result-wrapper">
            <h3>Hypertension Risk</h3>
            
            <div className="gauge-container">
              <svg viewBox="0 0 100 50" className="gauge-svg">
                <defs>
                  <linearGradient id="risk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#risk-gradient)" strokeWidth="8" strokeLinecap="round" />
              </svg>
              
              <div 
                className="needle" 
                id="gauge-needle"
                style={{ transform: `translateX(-50%) rotate(${degrees}deg)` }}
              ></div>
            </div>
            
            <div className="risk-score">
              Score: <span>{riskScore.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}

export default App
