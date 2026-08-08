/* ============================================================
   SAN FRANCISCO LOGISTICS — 4K AUTOMATED GANTRY CRANES JAVASCRIPT
   Interactive Telemetry, ROS Simulator & Power Calculations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCraneNavHighlight();
  initRegenCalculator();
  initAirDraftVisualizer();
  initRosSimulator();
  initCraneLightbox();
  initSpecToggle();
});

/* Navigation Ribbon Highlight Tracking */
function initCraneNavHighlight() {
  const links = document.querySelectorAll('.quick-nav-list a');
  const sections = document.querySelectorAll('section[id], div[id].crane-section-target');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* 1. Live Regenerative Energy & Cost Savings Calculator */
function initRegenCalculator() {
  const movesSlider = document.getElementById('calc-moves-slider');
  const movesValBadge = document.getElementById('calc-moves-val');
  const energyKwhEl = document.getElementById('calc-output-kwh');
  const costSavedEl = document.getElementById('calc-output-savings');
  const co2AvoidedEl = document.getElementById('calc-output-co2');

  if (!movesSlider) return;

  function updateCalculations() {
    const annualMoves = parseInt(movesSlider.value, 10);
    movesValBadge.textContent = `${annualMoves.toLocaleString()} Container Moves/Year`;

    // Engineering Constants:
    // Average regen energy recovered per container lowering cycle: ~3.85 kWh
    // Peak commercial electricity rate in Bay Area (PG&E E-20): ~$0.24 / kWh
    // Average CO2 grid factor: ~0.385 kg CO2 / kWh saved
    const totalKwh = Math.round(annualMoves * 3.85);
    const totalSavings = Math.round(totalKwh * 0.24);
    const totalCo2Tons = ( (totalKwh * 0.385) / 1000 ).toFixed(1);

    if (energyKwhEl) energyKwhEl.textContent = (totalKwh / 1000).toFixed(1) + ' MWh';
    if (costSavedEl) costSavedEl.textContent = '$' + totalSavings.toLocaleString();
    if (co2AvoidedEl) co2AvoidedEl.textContent = totalCo2Tons + ' Metric Tons';
  }

  movesSlider.addEventListener('input', updateCalculations);
  updateCalculations(); // initial run
}

/* 2. Bay Bridge Air Draft & Tidal Height Clearance Visualizer */
function initAirDraftVisualizer() {
  const tideSlider = document.getElementById('tide-level-slider');
  const tideValBadge = document.getElementById('tide-level-val');
  const clearanceTextEl = document.getElementById('bridge-clearance-text');
  const clearanceBarEl = document.getElementById('crane-clearance-bar-fill');
  const boomStatusBadge = document.getElementById('boom-transit-status');

  if (!tideSlider) return;

  function updateTideClearance() {
    const tideFt = parseFloat(tideSlider.value);
    tideValBadge.textContent = `${tideFt.toFixed(1)} ft (Mean Lower Low Water)`;

    // San Francisco - Oakland Bay Bridge baseline air draft: 220 ft at 0.0 MLLW tide
    // As tide rises, available bridge air draft drops: 220 ft - tideFt
    const availableBridgeDraft = 220 - tideFt;
    
    // Fully erected Super Post-Panamax with upright boom: ~245 ft (DOES NOT CLEAR)
    // Shipped with boom lowered on heavy-lift vessel: ~165 ft (CLEARS WITH MARGIN)
    const boomLoweredDraft = 165;
    const safetyMargin = (availableBridgeDraft - boomLoweredDraft).toFixed(1);

    if (clearanceTextEl) {
      clearanceTextEl.innerHTML = `Bridge Air Draft: <strong>${availableBridgeDraft.toFixed(1)} ft</strong> | Safety Margin (Lowered Boom): <strong style="color: var(--crane-cyan);">${safetyMargin} ft</strong>`;
    }

    if (clearanceBarEl) {
      const heightPercent = Math.min(95, Math.max(30, (boomLoweredDraft / availableBridgeDraft) * 100));
      clearanceBarEl.style.height = `${heightPercent}%`;
      clearanceBarEl.textContent = `${boomLoweredDraft} ft Draft`;
    }

    if (boomStatusBadge) {
      if (safetyMargin >= 30) {
        boomStatusBadge.innerHTML = '<i class="fas fa-check-circle"></i> SAFE NAVIGATION CLEARANCE CONFIRMED';
        boomStatusBadge.style.color = '#10b981';
      } else {
        boomStatusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> RESTRICTED TIDAL WINDOW TRANSIT';
        boomStatusBadge.style.color = '#ffb703';
      }
    }
  }

  tideSlider.addEventListener('input', updateTideClearance);
  updateTideClearance();
}

/* 3. Interactive Remote Operator Station (ROS) Multi-Camera Switcher */
function initRosSimulator() {
  const camButtons = document.querySelectorAll('.ros-cam-btn');
  const mainFeed = document.getElementById('ros-main-feed-img');
  const feedTag = document.getElementById('ros-feed-tag');
  const feedFps = document.getElementById('ros-feed-fps');

  const feeds = {
    'cam-1': {
      src: 'images/sf_gantry_cranes_hero.jpg',
      tag: 'CAM 01: SPREADER 3D LIDAR & TWIN-LIFT FEED (QUAY BERTH 80)',
      fps: '60 FPS | 4K HDR'
    },
    'cam-2': {
      src: 'images/remote_operator_ros.jpg',
      tag: 'CAM 02: ROS CONTROL ROOM WORKSTATION #04 TELEMETRY',
      fps: '60 FPS | 1080p'
    },
    'cam-3': {
      src: 'images/armg_asc_cranes.jpg',
      tag: 'CAM 03: ARMG / ASC YARD STACKING BLOCK #B-12 (E-BUSBAR)',
      fps: '60 FPS | 4K HDR'
    },
    'cam-4': {
      src: 'images/sf_crane_power_substation.jpg',
      tag: 'CAM 04: 12kV SUBSTATION & REGEN POWER INVERTER MONITOR',
      fps: '30 FPS | SENSOR GRID'
    }
  };

  camButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const feedKey = btn.getAttribute('data-cam');
      if (!feeds[feedKey]) return;

      camButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (mainFeed) {
        mainFeed.style.opacity = '0.3';
        setTimeout(() => {
          mainFeed.src = feeds[feedKey].src;
          mainFeed.style.opacity = '1';
        }, 150);
      }

      if (feedTag) feedTag.textContent = feeds[feedKey].tag;
      if (feedFps) feedFps.textContent = feeds[feedKey].fps;
    });
  });
}

/* 4. 4K Photo Lightbox Gallery */
function initCraneLightbox() {
  const galleryCards = document.querySelectorAll('.gallery-item-card');
  const lightboxModal = document.getElementById('crane-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-target-img');
  const lightboxCaption = document.getElementById('lightbox-target-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const caption = card.getAttribute('data-caption') || img?.alt || 'San Francisco Logistics Automated Crane System';

      if (lightboxImg && img) lightboxImg.src = img.src;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxModal) lightboxModal.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', () => {
    lightboxModal?.classList.remove('active');
  });

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  });

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightboxModal?.classList.remove('active');
    }
  });
}

/* 5. Specification View Toggle (Quay STS vs Yard ARMG/ASC) */
function initSpecToggle() {
  const toggleBtns = document.querySelectorAll('.spec-toggle-btn');
  const rows = document.querySelectorAll('.spec-table-custom tbody tr');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode'); // 'all', 'sts', 'armg'

      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      rows.forEach(row => {
        if (mode === 'all') {
          row.style.display = '';
        } else if (mode === 'sts') {
          row.style.display = row.classList.contains('row-sts') || !row.classList.contains('row-armg') ? '' : 'none';
        } else if (mode === 'armg') {
          row.style.display = row.classList.contains('row-armg') || !row.classList.contains('row-sts') ? '' : 'none';
        }
      });
    });
  });

  initBannerSwitcher();
}

/* 6. Interactive 4K Panoramic Banner Switcher */
function initBannerSwitcher() {
  const bannerTabs = document.querySelectorAll('.banner-tab-item');
  const bannerImg = document.getElementById('crane-main-banner-img');
  const bannerTitle = document.getElementById('banner-live-title');

  bannerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const src = tab.getAttribute('data-banner-src');
      const title = tab.getAttribute('data-banner-title');

      bannerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (bannerImg && src) {
        bannerImg.style.opacity = '0.4';
        setTimeout(() => {
          bannerImg.src = src;
          bannerImg.style.opacity = '1';
        }, 150);
      }

      if (bannerTitle && title) {
        bannerTitle.textContent = title;
      }
    });
  });
}

/* Global function to open banner image in full lightbox */
function openBannerLightbox() {
  const bannerImg = document.getElementById('crane-main-banner-img');
  const bannerTitle = document.getElementById('banner-live-title');
  const lightboxModal = document.getElementById('crane-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-target-img');
  const lightboxCaption = document.getElementById('lightbox-target-caption');

  if (lightboxImg && bannerImg) lightboxImg.src = bannerImg.src;
  if (lightboxCaption && bannerTitle) lightboxCaption.textContent = bannerTitle.textContent;
  if (lightboxModal) lightboxModal.classList.add('active');
}
