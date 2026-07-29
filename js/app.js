/* -------------------------------------------------------------------
   Diving & Snorkeling Paradise Mirissa - Application Logic
   ------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentCurrency = 'USD';
  const currencyRates = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    LKR: { symbol: 'Rs ', rate: 300 }
  };

  // Base Package Prices in USD
  const tourPrices = {
    'turtle-snorkeling': { baseUSD: 25, title: 'Snorkeling with Sea Turtles' },
    'whale-snorkeling': { baseUSD: 85, title: 'Snorkeling with Whales' },
    'scuba-discovery': { baseUSD: 60, title: 'Discovery Scuba Diving' },
    'scuba-certified': { baseUSD: 50, title: 'Certified Reef Diving' },
    'deep-sea-fishing': { baseUSD: 75, title: 'Deep Sea & Mullet Fishing' },
    'sunset-boat': { baseUSD: 35, title: 'Sunset Boat Tour & Kayaking' },
    'sri-lanka-tour': { baseUSD: 120, title: 'Sri Lanka Island Tour Package' }
  };

  // DOM Elements
  const currencySelect = document.getElementById('currency-select');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const tourFilterBtns = document.querySelectorAll('.tab-btn');
  const tourCards = document.querySelectorAll('.tour-card');
  const bookingModal = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalTourTitle = document.getElementById('modal-tour-title');
  const modalForm = document.getElementById('modal-booking-form');

  // Calculator Elements
  const calcPackage = document.getElementById('calc-package');
  const calcAdults = document.getElementById('calc-adults');
  const calcChildren = document.getElementById('calc-children');
  const calcGopro = document.getElementById('calc-gopro');
  const calcTransfer = document.getElementById('calc-transfer');
  
  const calcSubtotalEl = document.getElementById('calc-subtotal');
  const calcDiscountEl = document.getElementById('calc-discount');
  const calcTotalEl = document.getElementById('calc-total');
  const calcBookWhatsappBtn = document.getElementById('calc-book-whatsapp');

  // 1. Mobile Menu Toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // 2. Currency Selector
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updateAllDisplayedPrices();
      calculateTotal();
    });
  }

  function formatPrice(amountUSD) {
    const { symbol, rate } = currencyRates[currentCurrency];
    const converted = amountUSD * rate;
    if (currentCurrency === 'LKR') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toFixed(0)}`;
  }

  function updateAllDisplayedPrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usd = parseFloat(el.getAttribute('data-price-usd'));
      el.textContent = formatPrice(usd);
    });
  }

  // 3. Tour Category Filter
  tourFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tourFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      tourCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Interactive Price Calculator
  function calculateTotal() {
    if (!calcPackage) return;

    const selectedKey = calcPackage.value;
    const tourInfo = tourPrices[selectedKey] || tourPrices['turtle-snorkeling'];
    const basePrice = tourInfo.baseUSD;

    const adults = parseInt(calcAdults.value) || 1;
    const children = parseInt(calcChildren.value) || 0;
    const isTurtleTour = selectedKey === 'turtle-snorkeling';

    // Children under 10 are free for Turtle Snorkeling, half price for others
    const childRateMultiplier = isTurtleTour ? 0 : 0.5;
    
    let subtotalUSD = (adults * basePrice) + (children * basePrice * childRateMultiplier);

    // Group discounts
    let discountUSD = 0;
    const totalPeople = adults + children;
    if (totalPeople >= 6) {
      discountUSD = subtotalUSD * 0.15; // 15% discount for 6+
    } else if (totalPeople >= 3) {
      discountUSD = subtotalUSD * 0.10; // 10% discount for 3+
    }

    // Add-ons
    let addonsUSD = 0;
    if (calcGopro && calcGopro.checked) {
      // Free for groups of 3+ people
      if (totalPeople < 3) {
        addonsUSD += 15;
      }
    }
    if (calcTransfer && calcTransfer.checked) {
      addonsUSD += 20; // Hotel transfer
    }

    const totalUSD = Math.max(0, subtotalUSD - discountUSD + addonsUSD);

    // Update DOM
    if (calcSubtotalEl) calcSubtotalEl.textContent = formatPrice(subtotalUSD);
    if (calcDiscountEl) calcDiscountEl.textContent = discountUSD > 0 ? `-${formatPrice(discountUSD)}` : formatPrice(0);
    if (calcTotalEl) calcTotalEl.textContent = formatPrice(totalUSD);

    // Update WhatsApp link
    if (calcBookWhatsappBtn) {
      const date = document.getElementById('calc-date')?.value || 'Today/Tomorrow';
      const msg = `Hello! I would like to book the *${tourInfo.title}*\n📅 Date: ${date}\n👥 Guests: ${adults} Adults, ${children} Children\n💰 Total: ${formatPrice(totalUSD)}\nCan you confirm availability?`;
      calcBookWhatsappBtn.href = `https://wa.me/94742617251?text=${encodeURIComponent(msg)}`;
    }
  }

  // Event Listeners for Calculator Inputs
  [calcPackage, calcAdults, calcChildren, calcGopro, calcTransfer].forEach(input => {
    if (input) {
      input.addEventListener('change', calculateTotal);
      input.addEventListener('input', calculateTotal);
    }
  });

  // 5. Modal Handling
  document.querySelectorAll('.open-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourKey = btn.getAttribute('data-tour-key') || 'turtle-snorkeling';
      const tourTitle = btn.getAttribute('data-tour-title') || 'Mirissa Ocean Adventure';
      
      if (modalTourTitle) modalTourTitle.textContent = tourTitle;
      if (calcPackage) {
        calcPackage.value = tourKey;
        calculateTotal();
      }
      if (bookingModal) bookingModal.classList.add('active');
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      bookingModal.classList.remove('active');
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
      }
    });
  }

  // Modal Form Submission -> Direct WhatsApp
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-name')?.value || 'Guest';
      const date = document.getElementById('modal-date')?.value || 'Upcoming';
      const guests = document.getElementById('modal-guests')?.value || '2';
      const tour = modalTourTitle?.textContent || 'Tour';
      
      const text = `Hi Diving Paradise Mirissa!\nName: ${name}\nTour: ${tour}\nPreferred Date: ${date}\nGuests: ${guests}\nPlease contact me to complete my booking.`;
      window.open(`https://wa.me/94742617251?text=${encodeURIComponent(text)}`, '_blank');
      bookingModal.classList.remove('active');
    });
  }

  // 6. FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Initial setup
  calculateTotal();
  updateAllDisplayedPrices();
});
