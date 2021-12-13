import React, { useState } from 'react'
import {
  loadStripe,
  StripeCardElement,
  Token,
  StripeCardElementChangeEvent
} from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

import Button from 'components/Button'
import TextInput from 'components/TextInput'
import { stripeKey } from 'configs'
import { useInputState } from 'utils/hook'

import styles from './styles.scss?type=global'

type Period = 'annual' | 'month'
// Custom styling can be passed to options when creating an Element.
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'HelveticaNeue, Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
}

export type CardData = {
  token: Token
  name: string
}

interface CardInputProps {
  message?: React.ReactNode
  onSubmit: (data: CardData) => void
}

function CardInput({ message, onSubmit }: CardInputProps) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [completed, setCompleted] = useState(false)
  const [name, setName] = useInputState('')

  const stripe = useStripe()
  const elements = useElements()

  function onChange(ev: StripeCardElementChangeEvent) {
    if (ev.error) {
      setError(ev.error.message)
    } else {
      setError(undefined)
    }

    setCompleted(ev.complete)
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()

    if (!elements || !stripe) return

    const card = elements.getElement(CardElement) as StripeCardElement
    const result = await stripe.createToken(card)
    if (result.error) {
      setError(result.error.message)
    } else {
      setError(undefined)
      if (result.token) {
        onSubmit({
          token: result.token,
          name
        })
      }
    }
  }

  return (
    <form className='th-card-input' onSubmit={handleSubmit}>
      <div className='row my-2'>
        <TextInput
          className='col-12'
          placeholder='Name'
          required
          value={name}
          onChange={setName}
        />
      </div>
      <CardElement
        id='card-elements'
        className='th-card-elements'
        options={CARD_ELEMENT_OPTIONS}
        onChange={onChange}
      />
      {error && (
        <span className='th-error-message' role='alert'>
          {error}
        </span>
      )}

      {message && <div className='th-message mt-3'>{message}</div>}

      <Button
        className='th-submit-button mt-4'
        disabled={error !== undefined || !completed || !name}
        type='submit'
      >
        Add
      </Button>

      <style jsx>{styles}</style>
    </form>
  )
}

// Setup Stripe.js and the Elements provider
const stripePromise = loadStripe(stripeKey)

export default function THCardInput(props: CardInputProps) {
  return (
    <Elements stripe={stripePromise}>
      <CardInput {...props} />
    </Elements>
  )
}
