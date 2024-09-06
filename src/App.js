import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import CheckoutForm from './CheckoutForm';
import ChatBox1 from './ChatBox1'
import ChatBox2 from './ChatBox2'
import ChatComponent from './ChatComponent'
import ChatComponent2 from './ChatComponent2'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';

// Your actual Stripe public key
const stripePromise = loadStripe('pk_test_51PdQReI2SPLgXlZ7dC7aLvtf1x1e5aoE5trPqYK4Vf95EShqegEo8s0KHt1Mepz5Z4aXPP9C5jMRv4esbZq2vWKy00kMa6r0Cf');

const App = () => {

  const priceId = 'price_1PdTgoI2SPLgXlZ76UFwEJbA';  // Replace with your actual price ID

  return (
   
    <>
     {/* <Elements stripe={stripePromise}>
      <CheckoutForm priceId={priceId}/>
    </Elements> */}

   
    <Router>
      <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/chatbox-1/" element={
        <ChatBox1 
          senderId={1} 
          senderType="cafe_branch" 
          receiverId={3} 
          receiverType="food_service_branch" 
        />
      } />

      <Route path="/chatbox-2/" element={
        <ChatBox2 
          senderId={3} 
          senderType="food_service_branch" 
          receiverId={1} 
          receiverType="cafe_branch" 
        />
      } />

      <Route path="/chat-component-1/" element={
        <ChatComponent 
          senderId={3} 
          senderContentTypeId="food_service_branch" 
          receiverId={1} 
          receiverContentTypeId="cafe_branch" 
        />
      } />

    <Route path="/chat-component-2/" element={
      <ChatComponent2
        senderId={1} 
        senderContentTypeId="cafe_branch" 
        receiverId={3} 
        receiverContentTypeId="food_service_branch" 
      />
      } />


      </Routes>
    </Router>

    

    </>
  );
};

export default App;
