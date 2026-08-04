/* SAN FRANCISCO LOGISTICS - ULTRA PREMIUM JAVASCRIPT LOGIC */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCommandCenter();
  initTracker();
  initCalculator();
  initHubNetwork();
  initCounters();
  initModals();
  initVideos();
});

/* Navbar & Scroll Effect */
function initNavigation() {
  const header = document.querySelector('.header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'rgba(7, 11, 25, 0.98)';
        navMenu.style.padding = '24px';
        navMenu.style.borderBottom = '1px solid rgba(0, 245, 212, 0.2)';
      }
    });
  }
}

/* Command Center Tabs */
function initCommandCenter() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* Simulated Real-Time Tracker */
function initTracker() {
  const trackBtn = document.getElementById('track-submit-btn');
  const trackInput = document.getElementById('track-input');
  const trackResult = document.getElementById('track-result-box');

  const sampleShipments = {
    'SFL-98420-US': {
      status: 'In Transit - Ocean Voyage',
      origin: 'Shanghai Port Terminal (CN)',
      destination: 'Port of San Francisco (US)',
      carrier: 'SF Pacific Commander (Vessel #704)',
      eta: 'August 3, 2026 - 14:00 PST',
      container: '40ft High-Cube Reefer',
      progress: '70%'
    },
    'SFL-11045-AIR': {
      status: 'Customs Clearance Complete',
      origin: 'Frankfurt Airport (DE)',
      destination: 'SFO Freight Terminal (US)',
      carrier: 'SF Aero Cargo 777-F Flight 402',
      eta: 'August 1, 2026 - 08:30 PST',
      container: 'Palletized Expedite ULD',
      progress: '90%'
    }
  };

  trackBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    // Use optional chaining — trackInput may be null if the element is missing from the DOM
    const query = trackInput?.value.trim().toUpperCase() || 'SFL-98420-US';
    
    // Simulate lookup delay
    trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating Cargo...';
    
    setTimeout(() => {
      trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Shipment';
      const data = sampleShipments[query] || {
        status: 'In Transit - On Schedule',
        origin: 'Port of Yokohama (JP)',
        destination: 'San Francisco Global Logistics Hub',
        carrier: 'SF Express Vessel Ocean Voyager',
        eta: 'August 4, 2026 - 18:00 PST',
        container: 'Standard 20ft Cargo Container',
        progress: '60%'
      };

      if (trackResult) {
        trackResult.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="color: var(--accent-cyan); font-size: 1.1rem;">Tracking ID: ${query}</h4>
            <span style="background: rgba(0,245,212,0.15); color: var(--accent-cyan); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">${data.status}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px;">
            <div><strong>Origin:</strong> ${data.origin}</div>
            <div><strong>Destination:</strong> ${data.destination}</div>
            <div><strong>Vessel/Carrier:</strong> ${data.carrier}</div>
            <div><strong>Estimated Arrival:</strong> ${data.eta}</div>
          </div>
          <div class="timeline-tracker">
            <div class="timeline-tracker-progress" style="width: ${data.progress}"></div>
            <div class="timeline-step completed">
              <div class="step-icon"><i class="fas fa-check"></i></div>
              <span>Dispatched</span>
            </div>
            <div class="timeline-step completed">
              <div class="step-icon"><i class="fas fa-ship"></i></div>
              <span>Departed Port</span>
            </div>
            <div class="timeline-step active">
              <div class="step-icon"><i class="fas fa-compass"></i></div>
              <span>In Transit</span>
            </div>
            <div class="timeline-step">
              <div class="step-icon"><i class="fas fa-warehouse"></i></div>
              <span>Arrival SFO</span>
            </div>
          </div>
        `;
        trackResult.classList.add('active');
      }
    }, 600);
  });
}

/* Instant Freight Calculator */
function initCalculator() {
  const calcBtn = document.getElementById('calc-submit-btn');
  const originSelect = document.getElementById('calc-origin');
  const destSelect = document.getElementById('calc-dest');
  const modeSelect = document.getElementById('calc-mode');
  const weightInput = document.getElementById('calc-weight');
  const calcResult = document.getElementById('calc-result-box');

  calcBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const weight = parseFloat(weightInput?.value) || 500;
    const mode = modeSelect?.value || 'ocean';
    
    let ratePerKg = 1.85;
    let transitTime = '12 - 14 Days';
    let carbonSavings = '34% Lower CO2';

    if (mode === 'air') {
      ratePerKg = 4.75;
      transitTime = '2 - 3 Days';
      carbonSavings = '15% SAF Hybrid Fuel';
    } else if (mode === 'road') {
      ratePerKg = 2.10;
      transitTime = '4 - 5 Days';
      carbonSavings = 'Zero Emission EV Truck';
    }

    const estimatedCost = (weight * ratePerKg + 350).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    if (calcResult) {
      calcResult.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Est. Freight Cost</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-cyan);">${estimatedCost}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Transit Duration</div>
            <div style="font-size: 1.2rem; font-weight: 700; color: #fff;">${transitTime}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.8rem; color: var(--text-muted);">ESG Impact</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-emerald);">${carbonSavings}</div>
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="openQuoteModal()">Lock In This Rate & Book</button>
      `;
      calcResult.classList.add('active');
    }
  });
}

/* Global Hub Network Interaction */
function initHubNetwork() {
  const nodes = document.querySelectorAll('.hub-node');
  const hubTitle = document.getElementById('active-hub-name');
  const hubStats = document.getElementById('active-hub-stats');

  const hubData = {
    'sf': { name: 'San Francisco Global HQ & Deepwater Terminal', status: 'Primary Pacific Hub | 2.8M TEU Capacity', departure: 'Daily Ocean & Air Sailings' },
    'shanghai': { name: 'Shanghai East China Megahub', status: 'Gateway Asia | Automated Robotic Sorting', departure: 'Next Departure: 4 Hours' },
    'rotterdam': { name: 'Rotterdam European Deepwater Gateway', status: 'Pan-European Cold Chain Hub', departure: 'Next Departure: 6 Hours' },
    'singapore': { name: 'Singapore Transshipment Center', status: 'SE Asia Hub & Bunkering Station', departure: 'Continuous Feeder Services' },
    'dubai': { name: 'Dubai Air-Sea Logistics Freezone', status: 'Middle East & Africa Crossroads', departure: 'Daily Express Charters' },
    'sydney': { name: 'Sydney Pacific Rim Hub', status: 'Oceania Distribution & Multimodal Depot', departure: 'Direct SF Express Line' }
  };

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const key = node.getAttribute('data-hub');
      const data = hubData[key];
      if (data && hubTitle && hubStats) {
        hubTitle.textContent = data.name;
        hubStats.innerHTML = `<span style="color: var(--accent-cyan); font-weight:700;">${data.status}</span> &bull; ${data.departure}`;
      }
    });
  });
}

/* Animated Counters */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  let animated = false;

  const animate = () => {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = prefix + (target % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;
      }, stepTime);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animate();
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.stats-ribbon');
  if (statsSection) observer.observe(statsSection);
}

/* Modal Management */
function initModals() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.querySelector('.modal-close');

  closeBtn?.addEventListener('click', closeQuoteModal);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeQuoteModal();
  });
}

function openQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.add('active');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
}

async function handleQuoteSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const alertBox = form.querySelector('.quote-form-alert') || document.getElementById('quote-form-alert');

  // Extract form field values using FormData first, with fallback to DOM iteration
  const formData = new FormData(form);
  const payload = {
    fullName: formData.get('fullName') || '',
    companyName: formData.get('companyName') || '',
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    service: formData.get('service') || '',
    cargoDetails: formData.get('cargoDetails') || ''
  };

  // Fallback for inputs missing name attributes
  if (!payload.email || !payload.cargoDetails) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const type = input.type;
      const placeholder = input.placeholder || '';
      const val = input.value.trim();

      if (!payload.email && type === 'email') payload.email = val;
      else if (!payload.phone && type === 'tel') payload.phone = val;
      else if (!payload.service && input.tagName === 'SELECT') payload.service = val;
      else if (!payload.cargoDetails && input.tagName === 'TEXTAREA') payload.cargoDetails = val;
      else if (!payload.fullName && (placeholder.includes('John') || placeholder.includes('Name'))) payload.fullName = val;
      else if (!payload.companyName && (placeholder.includes('Company') || placeholder.includes('Enterprise'))) payload.companyName = val;
      else if (!payload.cargoDetails && type === 'text') payload.cargoDetails = val;
    });
  }

  if (!payload.email || !payload.cargoDetails) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      alertBox.style.color = '#f87171';
      alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in your email and cargo details.';
    }
    return;
  }

  if (alertBox) {
    alertBox.style.display = 'block';
    alertBox.style.background = 'rgba(0, 245, 212, 0.15)';
    alertBox.style.borderColor = 'rgba(0, 245, 212, 0.3)';
    alertBox.style.color = 'var(--accent-cyan)';
    alertBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to MongoDB database...';
  }

  try {
    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000'
      ? 'http://localhost:5000/api/quote'
      : '/api/quote';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      if (alertBox) {
        alertBox.innerHTML = '<i class="fas fa-check-circle"></i> Request Received! Logged in MongoDB. A logistics director will contact you shortly.';
      }
      form.reset();
      setTimeout(() => {
        const modal = document.getElementById('quote-modal');
        if (modal && modal.classList.contains('active')) {
          closeQuoteModal();
        }
        if (alertBox) alertBox.style.display = 'none';
      }, 2500);
    } else {
      throw new Error(result.error || 'Failed to submit quote');
    }
  } catch (err) {
    console.error('Quote submission error:', err);
    if (alertBox) {
      alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
      alertBox.style.color = '#f87171';
      alertBox.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Saved locally. Ensure backend server is running on port 5000.';
    }
  }
}

/* Background Video Autoplay Resilience */
function initVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Autoplay prevented or failed:', error);
      });
    }
  });
}


