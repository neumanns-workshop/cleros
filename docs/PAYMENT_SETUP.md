# Setting Up Payment Options for SORTES

This guide explains how to set up the "Buy Me a Coffee" payment options in the SORTES application.

## Configure Your Payment Links

Open `web/src/components/layout/DonateButton.tsx` and update the payment options with your own accounts:

```typescript
// Define payment options
const paymentOptions: PaymentOption[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <PaymentIcon />,
    url: 'https://paypal.me/YOUR_PAYPAL_USERNAME' // Replace with your PayPal.me link
  },
  {
    id: 'venmo',
    name: 'Venmo',
    icon: <PaymentIcon />,
    url: 'https://venmo.com/YOUR_VENMO_USERNAME' // Replace with your Venmo username
  },
  {
    id: 'card',
    name: 'Credit Card',
    icon: <CreditCardIcon />,
    url: '#' // This will be replaced with Stripe integration
  }
];
```

## Setting Up Stripe (Optional)

For direct credit card processing, follow these steps to set up Stripe:

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Install Stripe Dependencies**:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

3. **Create a Stripe Integration File**:
   Create a new file at `web/src/services/stripe.ts` with:

   ```typescript
   import { loadStripe } from '@stripe/stripe-js';

   // Replace with your own publishable key from the Stripe dashboard
   const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

   export const initiatePayment = async (amount: number, currency: string = 'usd') => {
     try {
       // This would typically call your backend to create a payment intent
       // For demonstration, we're just simulating the flow
       console.log(`Initiating payment of ${amount} ${currency}`);
       
       // In a real implementation, you would:
       // 1. Call your backend to create a payment intent
       // 2. Get the client secret from the response
       // 3. Use Stripe Elements or Checkout to collect payment details
       
       // Example: 
       // const response = await fetch('/api/create-payment-intent', {
       //   method: 'POST',
       //   headers: { 'Content-Type': 'application/json' },
       //   body: JSON.stringify({ amount, currency }),
       // });
       // const { clientSecret } = await response.json();
       
       // const stripe = await stripePromise;
       // const result = await stripe.confirmCardPayment(clientSecret, {
       //   payment_method: {
       //     card: elements.getElement(CardElement),
       //     billing_details: { name: 'Customer Name' },
       //   },
       // });
       
       return { success: true };
     } catch (error) {
       console.error('Payment failed:', error);
       return { success: false, error };
     }
   };

   export default stripePromise;
   ```

4. **Update the DonateButton Component**:
   Modify the `handlePaymentClick` function in `DonateButton.tsx`:

   ```typescript
   import { initiatePayment } from '../../services/stripe';

   const handlePaymentClick = async (option: PaymentOption) => {
     if (option.id === 'card') {
       // Open a modal with different coffee options
       const result = await initiatePayment(5.00); // $5 for a coffee
       if (result.success) {
         // Show success message
         handleClose();
       } else {
         // Show error message
       }
     } else {
       // Open the payment URL in a new tab
       window.open(option.url, '_blank');
       handleClose();
     }
   };
   ```

## Setting Up a Backend for Stripe (Full Implementation)

For a complete Stripe implementation, you'll need a backend service:

1. **Create a simple Express server**:
   ```bash
   mkdir -p server
   cd server
   npm init -y
   npm install express cors stripe dotenv
   ```

2. **Create a `.env` file**:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
   ```

3. **Create `server.js`**:
   ```javascript
   require('dotenv').config();
   const express = require('express');
   const cors = require('cors');
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

   const app = express();
   app.use(express.json());
   app.use(cors());

   app.post('/api/create-payment-intent', async (req, res) => {
     try {
       const { amount, currency } = req.body;
       
       // Create a PaymentIntent
       const paymentIntent = await stripe.paymentIntents.create({
         amount: Math.round(amount * 100), // Stripe expects cents
         currency: currency || 'usd',
         automatic_payment_methods: {
           enabled: true,
         },
       });

       res.json({ clientSecret: paymentIntent.client_secret });
     } catch (error) {
       console.error('Error creating payment intent:', error);
       res.status(500).json({ error: error.message });
     }
   });

   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

4. **Start the server**:
   ```bash
   node server.js
   ```

## Customizing the UI

You can customize the appearance of the payment button and dialog by modifying the Material-UI styles in `DonateButton.tsx`.

## Testing

Always test your payment integration in a development environment before deploying to production:

1. Use Stripe's test mode and test credit card numbers
2. Verify that PayPal and Venmo links open correctly
3. Check that the UI is responsive on different devices

## Deployment Considerations

When deploying to production:
1. Ensure you're using production API keys for Stripe
2. Set up proper error handling and logging
3. Implement HTTPS for secure transactions
4. Consider adding receipt emails for customers

---

Remember that directly processing credit card information requires PCI compliance. Using PayPal, Venmo, and Stripe's hosted checkout can simplify this requirement as these services handle the payment information for you. 