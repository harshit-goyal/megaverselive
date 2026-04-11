# Frontend Payment Integration Guide

This guide shows how to integrate the dual payment system (UPI + PayPal) into your index.html booking form.

---

## Quick Integration (5 minutes)

### Step 1: Add Payment SDKs to `<head>`

Add these scripts before `</head>`:

```html
<!-- Razorpay SDK (UPI) -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<!-- PayPal SDK (International) -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID_HERE"></script>
```

**Note:** Replace `YOUR_PAYPAL_CLIENT_ID_HERE` with your actual PayPal Client ID (you'll get this from Step 2 of deployment).

---

### Step 2: Replace Booking Button

Replace this line:
```html
<a href="https://cal.com/hgoyal925/1-1-connect" ...>
  Book a 1:1 Session
</a>
```

With this:
```html
<button 
  id="bookingBtn"
  class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-brand-700 shadow-xl transition hover:shadow-2xl hover:scale-105 cursor-pointer"
  onclick="openBookingModal()"
>
  Book a 1:1 Session
  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
</button>
```

---

### Step 3: Add Booking Modal HTML

Add this before `</body>`:

```html
<!-- Booking Modal -->
<div id="bookingModal" class="hidden fixed inset-0 z-50 overflow-y-auto">
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick="closeBookingModal()"></div>
  
  <!-- Modal Content -->
  <div class="relative flex min-h-screen items-center justify-center p-4">
    <div class="relative w-full max-w-2xl rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-700">
      <!-- Close Button -->
      <button 
        onclick="closeBookingModal()"
        class="absolute top-4 right-4 text-slate-400 hover:text-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <h2 class="text-2xl font-bold text-white mb-6">Book Your 1:1 Session</h2>

      <!-- Customer Info Form -->
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input 
            type="text" 
            id="customerName" 
            placeholder="Your name"
            class="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input 
            type="email" 
            id="customerEmail" 
            placeholder="your@email.com"
            class="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Phone Number (with country code)</label>
          <input 
            type="tel" 
            id="customerPhone" 
            placeholder="+91 9876543210"
            class="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Session Topic</label>
          <select id="sessionTopic" class="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-brand-500 focus:outline-none">
            <option value="System Design">System Design Interview</option>
            <option value="Backend Interview">Backend Interview Prep</option>
            <option value="English Coaching">English Coaching</option>
            <option value="Mock Interview">Mock Interview</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Preferred Date & Time</label>
          <input 
            type="datetime-local" 
            id="sessionTime"
            class="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Payment Method Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-300 mb-3">Payment Method</label>
        <div class="space-y-3">
          <label class="flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-brand-500 cursor-pointer transition">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="upi" 
              checked
              class="w-4 h-4 text-brand-500"
            />
            <span class="ml-3">
              <span class="block font-medium text-white">UPI (₹ For India)</span>
              <span class="text-sm text-slate-400">Google Pay, PhonePe, Paytm, etc.</span>
            </span>
          </label>

          <label class="flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-brand-500 cursor-pointer transition">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="paypal"
              class="w-4 h-4 text-brand-500"
            />
            <span class="ml-3">
              <span class="block font-medium text-white">PayPal (International)</span>
              <span class="text-sm text-slate-400">Credit card, Debit card, Wallet</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Session Cost Display -->
      <div class="bg-slate-800 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <span class="text-slate-300">Session Cost (45 minutes)</span>
          <span class="text-2xl font-bold text-brand-400">₹5,000</span>
        </div>
      </div>

      <!-- Payment Containers -->
      <div id="paypalContainer" class="mb-6"></div>

      <!-- Buttons -->
      <div class="flex gap-4">
        <button 
          onclick="closeBookingModal()"
          class="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button 
          id="proceedBtn"
          onclick="proceedToPayment()"
          class="flex-1 px-4 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
        >
          Proceed to Payment
        </button>
      </div>

      <!-- Loading Spinner (hidden by default) -->
      <div id="loadingSpinner" class="hidden text-center mt-4">
        <div class="inline-block">
          <svg class="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="mt-2 text-slate-400">Processing...</p>
      </div>
    </div>
  </div>
</div>
```

---

### Step 4: Add JavaScript Integration

Add this script before `</body>` (after the modal HTML):

```html
<script>
  const API_URL = 'https://api.megaverselive.com'; // Will work after Render deployment
  const PAYMENT_AMOUNT = 5000; // ₹5000

  function openBookingModal() {
    document.getElementById('bookingModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  async function proceedToPayment() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const sessionTopic = document.getElementById('sessionTopic').value;
    const sessionTime = document.getElementById('sessionTime').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !sessionTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!sessionTime) {
      alert('Please select a session date and time');
      return;
    }

    // Show loading
    document.getElementById('proceedBtn').disabled = true;
    document.getElementById('loadingSpinner').classList.remove('hidden');

    try {
      // 1. Create booking
      const bookingResponse = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          session_topic: sessionTopic,
          start_time: new Date(sessionTime).toISOString(),
          mentor_id: 1 // Harshit Goyal
        })
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      const bookingId = bookingData.booking_id;
      const amount = bookingData.amount;

      console.log('Booking created:', bookingId);

      // 2. Process payment based on selection
      if (paymentMethod === 'upi') {
        await processRazorpayPayment(bookingId, amount);
      } else {
        await processPayPalPayment(bookingId, amount);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      document.getElementById('proceedBtn').disabled = false;
      document.getElementById('loadingSpinner').classList.add('hidden');
    }
  }

  async function processRazorpayPayment(bookingId, amount) {
    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: amount
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.order_id) {
        throw new Error('Failed to create Razorpay order');
      }

      // Open Razorpay payment
      const options = {
        key: orderData.razorpay_key,
        order_id: orderData.order_id,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        description: 'Megaverse Live 1:1 Session',
        prefill: {
          email: document.getElementById('customerEmail').value,
          contact: document.getElementById('customerPhone').value,
          name: document.getElementById('customerName').value
        },
        handler: function(response) {
          alert('✅ Payment successful! Your booking is confirmed. Check your email for details.');
          closeBookingModal();
          clearBookingForm();
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
          }
        }
      };

      new Razorpay(options).open();
    } catch (error) {
      console.error('Razorpay error:', error);
      alert('Error processing UPI payment: ' + error.message);
    }
  }

  async function processPayPalPayment(bookingId, amount) {
    try {
      // Create PayPal order
      const orderResponse = await fetch(`${API_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: amount
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.id) {
        throw new Error('Failed to create PayPal order');
      }

      // Render PayPal button
      document.getElementById('paypalContainer').innerHTML = '';
      
      paypal.Buttons({
        createOrder: () => orderData.id,
        onApprove: async (data, actions) => {
          alert('✅ Payment successful! Your booking is confirmed. Check your email for details.');
          closeBookingModal();
          clearBookingForm();
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          alert('Payment error: ' + err);
        },
        onCancel: () => {
          console.log('Payment cancelled');
        }
      }).render('#paypalContainer');

    } catch (error) {
      console.error('PayPal setup error:', error);
      alert('Error setting up PayPal: ' + error.message);
    }
  }

  function clearBookingForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('sessionTopic').value = 'System Design';
    document.getElementById('sessionTime').value = '';
    document.querySelector('input[name="paymentMethod"][value="upi"]').checked = true;
    document.getElementById('paypalContainer').innerHTML = '';
  }
</script>
```

---

## Integration Checklist

Before going live:

- [ ] PayPal Client ID added to `<script src="https://www.paypal.com/sdk/js?client-id=...">` 
- [ ] API_URL matches your Render deployment URL
- [ ] PAYMENT_AMOUNT set correctly (₹5000)
- [ ] Both SDKs loading (check browser console)
- [ ] Modal opens when clicking "Book" button
- [ ] Form validation working
- [ ] UPI option shows Razorpay
- [ ] PayPal option shows PayPal button
- [ ] Success messages appear after payment

---

## Testing URLs

### Test Payment (Sandbox Mode)
- **UPI**: Use `success@razorpay` as UPI ID
- **PayPal**: Use sandbox account (automatically created in PayPal)
- **Amount**: ₹5000 / $60 USD equivalent

### Endpoints to Test
```bash
# Health check
curl https://api.megaverselive.com/health

# Get available slots
curl https://api.megaverselive.com/api/slots

# Create booking
curl -X POST https://api.megaverselive.com/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "+919876543210",
    "session_topic": "System Design",
    "start_time": "2024-12-25T14:00:00Z"
  }'
```

---

## Troubleshooting

### Razorpay not loading
- Check console for JavaScript errors
- Verify Razorpay script is in `<head>`
- Ensure Key ID is correct

### PayPal button not showing
- Check console for JavaScript errors
- Verify PayPal Client ID is correct
- Ensure `#paypalContainer` exists in HTML

### Payment endpoint 404
- Verify backend is deployed on Render
- Check API_URL matches Render domain
- Test `/health` endpoint first

### Email not sent
- Check email service credentials in Render
- Verify customer email is correct
- Check Gmail app password is set

---

## Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check Render logs (Dashboard → Services → Logs)
3. Review PAYMENT_SETUP.md for detailed configuration
4. Contact Razorpay/PayPal support for payment issues

