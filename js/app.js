/* -------------------------------------------------------------------
   Diving & Snorkeling Paradise Mirissa - Application Logic
   ------------------------------------------------------------------- */

// Global Mobile Drawer Controls (100% reliable full-screen overlay)
window.openMobileDrawer = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.classList.add('active');
};

window.closeMobileDrawer = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.classList.remove('active');
};

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
    'turtle-snorkeling': { baseUSD: 25, title: 'Snorkeling with Turtle' },
    'fun-diving': { baseUSD: 50, title: 'Fun Diving' },
    'wreck-diving': { baseUSD: 90, title: 'Wreck Diving Adventure (Min 3 Guests)' },
    'diving-course': { baseUSD: 400, title: 'Diving Course' },
    'whale-dolphin-snorkeling': { baseUSD: 85, title: 'Snorkeling with Whales & Dolphins' },
    'sunset-lighthouse-boat': { baseUSD: 35, title: 'Sunset & Lighthouse Boat Tour' }
  };

  // DOM Elements
  const currencySelect = document.getElementById('currency-select');
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

    let adults = parseInt(calcAdults.value) || 1;
    const isWreckTour = selectedKey === 'wreck-diving';
    if (isWreckTour) {
      if (calcAdults) calcAdults.min = "3";
      if (adults < 3) {
        adults = 3;
        if (calcAdults) calcAdults.value = 3;
      }
    } else {
      if (calcAdults) calcAdults.min = "1";
    }

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

  // 6.5 Mobile Navigation Drawer Listeners
  const mobileToggleBtn = document.getElementById('mobile-toggle');
  const navLinksList = document.getElementById('nav-links');

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', window.toggleMobileMenu);
  }

  if (navLinksList) {
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 991 && navLinksList.style.display === 'flex' && !navLinksList.contains(e.target) && !mobileToggleBtn?.contains(e.target)) {
        navLinksList.classList.remove('active', 'show');
        navLinksList.style.setProperty('display', 'none', 'important');
        const icon = document.querySelector('#mobile-toggle i');
        if (icon) icon.className = 'bi bi-list';
      }
    });

    navLinksList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 991) {
          navLinksList.classList.remove('active', 'show');
          navLinksList.style.setProperty('display', 'none', 'important');
          const icon = document.querySelector('#mobile-toggle i');
          if (icon) icon.className = 'bi bi-list';
        }
      });
    });
  }

  // 7. Active Navigation Link Highlighter & Glassy Header Observer
  const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
  const navbarEl = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbarEl?.classList.add('scrolled');
    } else {
      navbarEl?.classList.remove('scrolled');
    }
  });

  if (currentFileName === 'index.html' || currentFileName === '') {
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    window.addEventListener('scroll', () => {
      let scrollY = window.scrollY;
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navAnchors.forEach(a => {
            if (a.getAttribute('href') === '#' + sectionId) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }
      });
    });
  } else {
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentFileName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 8. Gallery Page Filter Bar
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
  
  if (galleryFilterBtns.length > 0) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-filter');
        galleryItems.forEach(item => {
          const itemCat = item.getAttribute('data-category') || '';
          const cats = itemCat.split(' ');
          if (cat === 'all' || cats.includes(cat)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 9. Lightbox Viewer & Video Player Logic
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryIndex = 0;
  let visibleGalleryItems = [];

  function openLightbox(index) {
    visibleGalleryItems = Array.from(document.querySelectorAll('.gallery-grid .gallery-item')).filter(el => el.style.display !== 'none');
    if (visibleGalleryItems.length === 0) return;

    currentGalleryIndex = (index + visibleGalleryItems.length) % visibleGalleryItems.length;
    const currentItem = visibleGalleryItems[currentGalleryIndex];
    const imgEl = currentItem.querySelector('img');
    const titleEl = currentItem.querySelector('h4');
    const descEl = currentItem.querySelector('p');
    const videoSrc = currentItem.getAttribute('data-video-src');

    if (videoSrc && lightboxVideo) {
      if (lightboxImg) lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = videoSrc;
      lightboxVideo.play().catch(() => {});
    } else {
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
      }
      if (lightboxImg && imgEl) {
        lightboxImg.style.display = 'block';
        lightboxImg.src = imgEl.src;
      }
    }

    if (lightboxTitle && titleEl) lightboxTitle.textContent = titleEl.textContent;
    if (lightboxDesc && descEl) lightboxDesc.textContent = descEl.textContent;

    if (lightboxModal) lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const visibleList = Array.from(document.querySelectorAll('.gallery-grid .gallery-item')).filter(el => el.style.display !== 'none');
      const idxInVisible = visibleList.indexOf(item);
      openLightbox(idxInVisible >= 0 ? idxInVisible : index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(currentGalleryIndex - 1);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(currentGalleryIndex + 1);
    });
  }

  // 10. Contact Page Form Handler
  const mainContactForm = document.getElementById('main-contact-form');
  const contactSuccessAlert = document.getElementById('contact-success-alert');

  if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value || 'Guest';
      const tour = document.getElementById('contact-tour')?.value || 'General Inquiry';
      const date = document.getElementById('contact-date')?.value || 'Flexible';
      const guests = document.getElementById('contact-guests')?.value || '1';
      const msg = document.getElementById('contact-message')?.value || '';

      if (contactSuccessAlert) {
        contactSuccessAlert.style.display = 'flex';
      }

      // Automatically construct WhatsApp message fallback option
      const waText = `Hi Diving Paradise Mirissa!\nMy Name: ${name}\nTour Interested: ${tour}\nPreferred Date: ${date}\nGuests: ${guests}\nMessage: ${msg}`;
      const waUrl = `https://wa.me/94742617251?text=${encodeURIComponent(waText)}`;
      
      const whatsappBtn = document.getElementById('contact-wa-btn');
      if (whatsappBtn) {
        whatsappBtn.href = waUrl;
      }

      mainContactForm.reset();
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    });
  }

  // 11. Live Google Places API Reviews Fetcher (Optional Integration)
  // Set your Google Cloud Places API Key below to automatically fetch & replace reviews dynamically
  const GOOGLE_PLACES_API_KEY = ""; // Insert your Google Places API Key here (e.g. AIzaSy...)
  const GOOGLE_PLACE_ID = "ChIJ24Vo4zU-4ToRikoD6xZJ0io"; // Diving & Snorkeling Paradise Mirissa Place ID

  function fetchLiveGoogleReviews() {
    if (!GOOGLE_PLACES_API_KEY) return; // Skip if no API key provided yet

    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,reviews,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.result && data.result.reviews) {
          const reviewsContainer = document.querySelector('#reviews .reviews-grid');
          if (!reviewsContainer) return;

          // Render live Google reviews dynamically
          reviewsContainer.innerHTML = data.result.reviews.map(r => `
            <div class="review-card">
              <div class="review-header">
                <img src="${r.profile_photo_url}" alt="${r.author_name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div class="reviewer-info">
                  <h4>${r.author_name} <span class="review-verified-badge"><i class="bi bi-patch-check-fill"></i> Verified</span></h4>
                  <span>${r.relative_time_description} • Google Review</span>
                </div>
              </div>
              <div class="review-stars" style="color: var(--accent-gold); margin: 10px 0;">${'★'.repeat(r.rating)}</div>
              <p class="review-text">"${r.text}"</p>
            </div>
          `).join('');
        }
      })
      .catch(err => console.log('Google Places API Notice:', err));
  }

  fetchLiveGoogleReviews();

  // 12. Floating Back to Top Arrow Button Handler
  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 13. Scroll Reveal Animation Observer
  const revealElements = document.querySelectorAll('.tour-card, .why-card, .review-card, .gallery-item, .calculator-card, .contact-info-card, .contact-form-card, .section-title, .faq-item');
  
  revealElements.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    const delay = (index % 3) + 1;
    el.classList.add(`reveal-delay-${delay}`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 14. Animated Stat / Number Counter
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g, ''));
    const isDecimal = target % 1 !== 0;
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = el.dataset.suffix
        ? (isDecimal ? current.toFixed(1) : Math.floor(current)) + el.dataset.suffix
        : (isDecimal ? current.toFixed(1) : Math.floor(current)) + (el.dataset.unit || '');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statEls = document.querySelectorAll('.stat-number, [data-target]');
  if (statEls.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => counterObserver.observe(el));
  }

  // Initial setup
  calculateTotal();
  updateAllDisplayedPrices();
});


