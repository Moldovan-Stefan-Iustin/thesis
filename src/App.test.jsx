import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

function getResultSection() {
  return within(document.getElementById('result-wrapper'))
}

async function fillAndSubmitForm(user, overrides = {}) {
  const {
    age = '45',
    gender = 'male',
    ethnicity = '3',
    hoursOfSleep = '7',
    pregnant = false,
    troubleSleeping = false,
    sleepDisorder = false,
  } = overrides

  await user.type(screen.getByLabelText(/^age$/i), age)
  await user.selectOptions(screen.getByLabelText(/^gender$/i), gender)
  await user.selectOptions(screen.getByLabelText(/race \/ ethnicity/i), ethnicity)
  await user.type(screen.getByLabelText(/hours of sleep per night/i), hoursOfSleep)

  if (pregnant) {
    await user.click(screen.getByLabelText(/are you pregnant/i))
  }

  if (troubleSleeping) {
    await user.click(screen.getByLabelText(/diagnosed with trouble sleeping/i))
  }

  if (sleepDisorder) {
    await user.click(screen.getByLabelText(/diagnosed with sleep disorder/i))
  }

  await user.click(screen.getByRole('button', { name: 'Get #riskScore prediction' }))
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the hypertension risk form', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /hypertension #riskscore/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^age$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^gender$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/race \/ ethnicity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hours of sleep per night/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get #riskScore prediction' })).toBeInTheDocument()
  })

  it('shows initial risk score of 0.00', () => {
    render(<App />)
    expect(getResultSection().getByText('0.00')).toBeInTheDocument()
  })

  it('submits the form and displays the predicted risk score', async () => {
    const user = userEvent.setup()

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ riskScore: 0.560133 }),
    })

    render(<App />)
    await fillAndSubmitForm(user)

    await waitFor(() => {
      expect(getResultSection().getByText('0.56')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age: 45,
        gender: 'male',
        ethnicity: 3,
        pregnant: false,
        hoursOfSleep: 7,
        troubleSleeping: false,
        sleepDisorder: false,
      }),
    })
  })

  it('shows a loading state while predicting', async () => {
    const user = userEvent.setup()

    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ riskScore: 0.42 }),
              }),
            100,
          )
        }),
    )

    render(<App />)
    await fillAndSubmitForm(user)

    expect(screen.getByRole('button', { name: 'Analyzing Risk...' })).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get #riskScore prediction' })).toBeEnabled()
    })
  })

  it('displays API validation errors', async () => {
    const user = userEvent.setup()

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Validation failed',
        details: ['pregnant cannot be true when gender is male'],
      }),
    })

    render(<App />)
    await fillAndSubmitForm(user)

    await waitFor(() => {
      expect(
        screen.getByText('pregnant cannot be true when gender is male'),
      ).toBeInTheDocument()
    })
  })

  it('includes checked medical history flags in the payload', async () => {
    const user = userEvent.setup()

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ riskScore: 0.75 }),
    })

    render(<App />)
    await fillAndSubmitForm(user, {
      age: '30',
      gender: 'female',
      ethnicity: '4',
      hoursOfSleep: '6',
      pregnant: true,
      troubleSleeping: true,
      sleepDisorder: true,
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: 30,
          gender: 'female',
          ethnicity: 4,
          pregnant: true,
          hoursOfSleep: 6,
          troubleSleeping: true,
          sleepDisorder: true,
        }),
      })
    })
  })

  it('rotates the gauge needle based on the risk score', async () => {
    const user = userEvent.setup()

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ riskScore: 0.5 }),
    })

    render(<App />)

    const needle = document.getElementById('gauge-needle')
    expect(needle).toHaveStyle({ transform: 'translateX(-50%) rotate(-90deg)' })

    await fillAndSubmitForm(user)

    await waitFor(() => {
      expect(needle).toHaveStyle({ transform: 'translateX(-50%) rotate(0deg)' })
    })
  })
})
