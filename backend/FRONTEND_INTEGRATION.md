# Frontend Integration Instructions

## Add Booking Calendar to index.html

### Step 1: Add Stripe Script
Before closing `</head>` tag, add:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### Step 2: Set Stripe Publishable Key
After Stripe script, add:
```html
<script>
  // Replace with your actual Stripe publishable key
  window.STRIPE_PUBLISHABLE_KEY = 'pk_test_your_key_here';
</script>
```

### Step 3: Add Booking Section to HTML
Find the `<!-- Book Section -->` or `#book` section in your HTML and add:

```html
<section id="book" class="relative overflow-hidden bg-gradient-to-b from-slate-900 to-black py-20">
  <div class="mx-auto max-w-6xl px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-black text-white">Book Your Session</h2>
      <p class="mt-4 text-lg text-slate-400">Choose a time slot and complete your booking below</p>
    </div>
    
    <div class="grid gap-8 md:grid-cols-2">
      <!-- Available Slots -->
      <div class="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 class="font-semibold text-white mb-4">Available Times (IST)</h3>
        <div id="slotsContainer" class="space-y-2 max-h-[500px] overflow-y-auto">
          <div class="text-slate-400">Loading available slots...</div>
        </div>
      </div>

      <!-- Booking Form -->
      <div class="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div id="bookingFormContainer">
          <p class="text-slate-400 mb-4">Select a time slot to begin</p>
        </div>
        
        <div id="bookingForm" style="display: none;" class="space-y-4">
          <p class="text-brand-300">
            <strong>Selected:</strong> <span id="selectedSlotDisplay"></span>
          </p>

          <form id="bookingFormSubmit" class="space-y-4">
            <input 
              type="text" 
              id="customerName" 
              placeholder="Your Full Name" 
              required
              class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-slate-500"
            />
            <input 
              type="email" 
              id="customerEmail" 
              placeholder="Your Email" 
              required
              class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-slate-500"
            />
            <input 
              type="tel" 
              id="customerPhone" 
              placeholder="Phone (optional)" 
              class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-slate-500"
            />
            <textarea 
              id="sessionTopic" 
              placeholder="What would you like to discuss?" 
              required
              rows="3"
              class="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder-slate-500"
            ></textarea>

            <div id="card-element" class="w-full rounded-lg bg-white/10 border border-white/20 p-3"></div>

            <button 
              type="submit" 
              class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-neon-pink py-3 font-semibold text-white transition hover:shadow-neon disabled:opacity-50"
            >
              Complete Booking & Pay
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Step 4: Add JavaScript
At the end of your HTML (before `</body>`), add:

```html
<script>
  const API_URL = 'https://megaverse-api.azurewebsites.net/api'; // Update with your Azure URL
  let stripe, elements, cardElement;
  let selectedSlot = null;

  // Initialize Stripe
  function initStripe() {
    stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();
    cardElement = elements.create('card');
    cardElement.mount('#card-element');
  }

  // Fetch available slots
  async function loadSlots() {
    try {
      const response = await fetch(`${API_URL}/slots?mentor_id=1&limit=30`);
      const data = await response.json();
      displaySlots(data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      document.getElementById('slotsContainer').innerHTML = 
        '<p class="text-red-400">Error loading slots. Please refresh.</p>';
    }
  }

  // Display available slots
  function displaySlots(slots) {
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';

    if (slots.length === 0) {
      container.innerHTML = '<p class="text-slate-400">No available slots. Please check back soon!</p>';
      return;
    }

    slots.forEach(slot => {
      const date = new Date(slot.start_time);
      const displayTime = date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-full rounded-lg border border-brand-300/30 bg-brand-50/10 p-3 text-left transition hover:bg-brand-100/20 hover:border-brand-400/50';
      button.innerHTML = `
        <div class="font-semibold text-brand-300">${displayTime} IST</div>
        <div class="text-sm text-brand-400">45 minutes</div>
      `;
      button.onclick = () => selectSlot(slot);
      container.appendChild(button);
    });
  }

  // Select time slot
  function selectSlot(slot) {
    selectedSlot = slot;
    const date = new Date(slot.start_time);
    document.getElementById('selectedSlotDisplay').textContent = date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    document.getElementById('bookingForm').style.display = 'block';
    if (!stripe) initStripe();
  }

  // Submit booking
  document.getElementById('bookingFormSubmit')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      // Create booking
      const bookingResponse = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: 1,
          customer_name: document.getElementById('customerName').value,
          customer_email: document.getElementById('customerEmail').value,
          customer_phone: document.getElementById('customerPhone').value,
          session_topic: document.getElementById('sessionTopic').value,
          start_time: selectedSlot.start_time,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || 'Booking failed');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        bookingData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: document.getElementById('customerName').value,
              email: document.getElementById('customerEmail').value,
            },
          },
        }
      );

      if (error) {
        alert(`Payment error: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        alert('✅ Booking confirmed! Check your email for details.');
        setTimeout(() => location.reload(), 2000);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Load slots on page load
  document.addEventListener('DOMContentLoaded', loadSlots);
</script>
```

### Step 5: Update API URL
Change `const API_URL` to your actual Azure App Service URL:
```javascript
const API_URL = 'https://megaverse-api.azurewebsites.net/api';
```

### Step 6: Update Stripe Key
In your `index.html`, change the Stripe publishable key:
```html
<script>
  window.STRIPE_PUBLISHABLE_KEY = 'pk_live_your_actual_key_here'; // Get from Stripe dashboard
</script>
```

---

## Testing Locally

1. Start your backend:
```bash
cd backend
npm run dev
```

2. Update `API_URL` in frontend script:
```javascript
const API_URL = 'http://localhost:8080/api';
```

3. Open `index.html` in browser and test booking flow

4. Use Stripe test card: `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits)

---

## Production Checklist

- [ ] Replace localhost API URL with Azure App Service URL
- [ ] Replace Stripe test keys with live keys
- [ ] Test with real payment card
- [ ] Add SSL certificate (Azure handles this)
- [ ] Test email notifications
- [ ] Monitor Azure logs for errors
