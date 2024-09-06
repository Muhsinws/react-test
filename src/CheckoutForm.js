import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      setError(paymentMethodError.message);
      setLoading(false);
      return;
    }

    // Manually add the JWT token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1MjU0OTcwLCJpYXQiOjE3MjQ2NTAxNzAsImp0aSI6ImYyNTkxZjQ2OGZhNTQzYWQ5MWY0NGNjZTkyMmRhMmFiIiwidXNlcl9pZCI6NywiaXNfdHJhZGVfc2VydmljZV91c2VyIjpmYWxzZSwiaXNfZm9vZF9zZXJ2aWNlX3VzZXIiOnRydWUsImlzX2NhZmVfZW50cmVwcmVuZXVyc2hpcF91c2VyIjpmYWxzZX0.PZ-2CoeCRsnYrYcmEOVJT1rlEuZZfjKRr773Imd0YlI'; // Replace 'your-jwt-token-here' with your actual JWT token

    const response = await fetch('http://127.0.0.1:8000/stripe/fs-subscription/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  
      },
      body: JSON.stringify({
        branch_id:3,
        payment_method_id: paymentMethod.id,
      }),
    });

    const subscription = await response.json();
    setLoading(false);

    if (response.ok) {
      console.log('Subscription created successfully:', subscription);
    } else {
      
      console.error('Error creating subscription:', subscription.error);
      setError(subscription.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};

export default CheckoutForm;
