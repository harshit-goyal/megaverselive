<!-- 
  PAYMENT INTEGRATION GUIDE
  
  This code adds a payment modal that:
  1. Opens when user clicks "Book a Session"
  2. Shows two payment options:
     - ₹1200 for Indians (UPI)
     - $15 for International (PayPal)
  3. After payment, redirects to cal.com
  
  INSTRUCTIONS:
  1. Add the SDKs to your <head>
  2. Replace the "Book a Session" button
  3. Add the modal HTML
  4. Add the JavaScript functions
-->

<!-- ============= STEP 1: Add to <head> ============= -->

<!-- Add these two script tags in your <head> section: -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID_HERE"></script>

<!-- Replace YOUR_PAYPAL_CLIENT_ID_HERE with your actual PayPal Client ID -->


<!-- ============= STEP 2: Replace Booking Button ============= -->

<!-- Find this line in your HTML: -->
<!-- <a href="https://cal.com/hgoyal925/1-1-connect" ...>Book a 1:1 Session</a> -->

<!-- Replace it with this button: -->
<button 
  onclick="openPaymentModal()"
  class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-brand-700 shadow-xl transition hover:shadow-2xl hover:scale-105 cursor-pointer"
>
  Book a 1:1 Session
  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
  </svg>
</button>


<!-- ============= STEP 3: Add Payment Modal HTML ============= -->

<!-- Add this before </body>: -->

<div id="paymentModal" class="hidden fixed inset-0 z-50 overflow-y-auto">
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick="closePaymentModal()"></div>
  
  <!-- Modal Content -->
  <div class="relative flex min-h-screen items-center justify-center p-4">
    <div class="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <!-- Close Button -->
      <button 
        onclick="closePaymentModal()"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Book Your 1:1 Session</h2>
      <p class="text-gray-600 mb-8">Choose your payment method</p>

      <!-- Payment Options -->
      <div class="space-y-4">
        <!-- India UPI Option -->
        <button 
          onclick="processPayment('upi')"
          id="upiBtn"
          class="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
          <span>₹1200 - Pay with UPI</span>
        </button>

        <!-- International PayPal Option -->
        <button 
          onclick="processPayment('paypal')"
          id="paypalBtn"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.012 5C7.546 5 6.348 6.199 6.348 7.665c0 1.466 1.198 2.665 2.664 2.665h3.676V5H9.012m.024 8.33h-3.7c-1.466 0-2.664 1.199-2.664 2.665 0 1.466 1.198 2.665 2.664 2.665h3.7v-5.33m0 8h-3.7c-1.466 0-2.664 1.199-2.664 2.665 0 1.466 1.198 2.665 2.664 2.665h3.7v-5.33m5.988-16.33h-4c-1.466 0-2.664 1.199-2.664 2.665v1.998h6.664V7.665c0-1.466-1.198-2.665-2.664-2.665"/>
          </svg>
          <span>$15 - Pay with PayPal</span>
        </button>
      </div>

      <!-- Processing Message -->
      <div id="processingMessage" class="hidden mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-700 font-medium">
        Processing your payment...
      </div>

      <!-- Error Message -->
      <div id="errorMessage" class="hidden mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 font-medium"></div>

      <!-- Info Text -->
      <p class="text-xs text-gray-500 text-center mt-6">
        After successful payment, you'll be redirected to schedule your session on our calendar
      </p>
    </div>
  </div>
</div>


<!-- ============= STEP 4: Add JavaScript Functions ============= -->

<!-- Add this before </body>: -->

<script>
const CAL_URL = 'https://cal.com/hgoyal925/1-1-connect';

// Open Payment Modal
function openPaymentModal() {
  document.getElementById('paymentModal').classList.remove('hidden');
  document.getElementById('errorMessage').classList.add('hidden');
  document.getElementById('processingMessage').classList.add('hidden');
}

// Close Payment Modal
function closePaymentModal() {
  document.getElementById('paymentModal').classList.add('hidden');
  document.getElementById('errorMessage').classList.add('hidden');
  document.getElementById('processingMessage').classList.add('hidden');
}

// Process Payment
async function processPayment(method) {
  const processingMsg = document.getElementById('processingMessage');
  const errorMsg = document.getElementById('errorMessage');
  const upiBtn = document.getElementById('upiBtn');
  const paypalBtn = document.getElementById('paypalBtn');
  
  // Disable buttons and show processing message
  upiBtn.disabled = true;
  paypalBtn.disabled = true;
  processingMsg.classList.remove('hidden');
  errorMsg.classList.add('hidden');

  try {
    if (method === 'upi') {
      // Razorpay UPI Payment (₹1200)
      await processRazorpayPayment();
    } else if (method === 'paypal') {
      // PayPal Payment ($15)
      await processPayPalPayment();
    }
  } catch (error) {
    console.error('Payment error:', error);
    errorMsg.textContent = error.message || 'Payment failed. Please try again.';
    errorMsg.classList.remove('hidden');
    processingMsg.classList.add('hidden');
    upiBtn.disabled = false;
    paypalBtn.disabled = false;
  }
}

// Razorpay Payment Handler
async function processRazorpayPayment() {
  try {
    // Step 1: Create order on backend
    const response = await fetch('https://megaverse-live.onrender.com/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 120000, // ₹1200 in paise
        currency: 'INR'
      })
    });

    if (!response.ok) throw new Error('Failed to create payment order');
    const data = await response.json();

    // Step 2: Open Razorpay checkout
    const options = {
      key: data.razorpayKeyId,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      handler: function(response) {
        // Payment successful - redirect to cal
        redirectToCalendar();
      },
      prefill: {
        name: 'Customer',
        email: 'customer@example.com'
      },
      theme: {
        color: '#3b82f6'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    throw new Error(error.message);
  }
}

// PayPal Payment Handler
async function processPayPalPayment() {
  try {
    // Step 1: Create PayPal order on backend
    const response = await fetch('https://megaverse-live.onrender.com/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: '15.00',
        currency: 'USD'
      })
    });

    if (!response.ok) throw new Error('Failed to create PayPal order');
    const data = await response.json();

    // Step 2: Create PayPal order using PayPal SDK
    if (typeof paypal === 'undefined') {
      throw new Error('PayPal SDK not loaded. Check your Client ID.');
    }

    paypal.Buttons({
      createOrder: (data, actions) => {
        return data.id; // Return the order ID from backend
      },
      onApprove: (data, actions) => {
        // Payment approved - redirect to cal
        redirectToCalendar();
      },
      onError: (err) => {
        throw new Error('PayPal payment failed: ' + err);
      }
    }).render('#paymentModal');
  } catch (error) {
    throw new Error(error.message);
  }
}

// Redirect to Calendar
function redirectToCalendar() {
  document.getElementById('processingMessage').textContent = 'Payment successful! Redirecting to calendar...';
  setTimeout(() => {
    window.location.href = CAL_URL;
  }, 1500);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('paymentModal');
  if (e.target === modal) {
    closePaymentModal();
  }
});
</script>
