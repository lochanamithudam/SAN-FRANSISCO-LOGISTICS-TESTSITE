/* SAN FRANCISCO LOGISTICS - SECTORS PAGE DYNAMIC SCRIPT */

document.addEventListener('DOMContentLoaded', () => {
  initSectorFilters();
  initSectorSearch();
  initSectorModals();
  initSmoothScroll();
});

/* Category Pill Filtering */
function initSectorFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.luxury-card');
  const segmentSections = document.querySelectorAll('.segment-block');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      segmentSections.forEach(section => {
        const category = section.getAttribute('data-category');
        if (filterValue === 'all' || filterValue === category) {
          section.style.display = 'block';
          section.style.opacity = '1';
        } else {
          section.style.display = 'none';
          section.style.opacity = '0';
        }
      });
    });
  });
}

/* Real-Time Live Search */
function initSectorSearch() {
  const searchInput = document.getElementById('sector-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.luxury-card');
    const tableRows = document.querySelectorAll('.economic-table tbody tr');

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(term)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    tableRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(term)) {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

/* Sector Details Dynamic Modal */
const sectorDataMap = {
  'road-freight': {
    title: 'Road Freight Logistics',
    subtitle: 'Long-haul, Regional, LTL & FTL Highway Solutions',
    badge: 'Freight Transportation',
    img: 'images/fleet_truck.jpg',
    description: 'Our overland fleet comprises 1,200+ electric heavy-duty rigs and temperature-controlled trailers operating across interstates with real-time GPS telemetry.',
    features: [
      'Full Truckload (FTL) direct terminal delivery',
      'Less-Than-Truckload (LTL) consolidated routing',
      'Zero-emission electric interstate corridor access',
      '24/7 continuous driver telemetry and temperature logging'
    ],
    metric: '1,200+ EV Rigs'
  },
  'ocean-freight': {
    title: 'Ocean & Maritime Freight',
    subtitle: 'Containerized Cargo, Bulk Shipping & Port Operations',
    badge: 'Maritime Transport',
    img: 'images/ocean_freight_ship.jpg',
    description: 'San Francisco Logistics operates 48 ultra-large container ships connecting Asia-Pacific, North American, and European deepwater ports with automated crane handling.',
    features: [
      'Containerized FCL (Full Container Load) & LCL consolidation',
      'Bulk cargo and specialized heavy maritime transport',
      'Automated Gantry Crane port terminal operations',
      'Integrated expedited customs clearance filing'
    ],
    metric: '2.8M TEU Annual'
  },
  'air-cargo': {
    title: 'Air Cargo Expedite',
    subtitle: 'Express Cargo & Belly-Freight via Commercial Carriers',
    badge: 'Air Expedite',
    img: 'images/air_cargo_plane.jpg',
    description: 'Priority scheduled air freighter charters and commercial belly-cargo access delivering time-critical tech equipment, pharmaceuticals, and high-value cargo globally.',
    features: [
      '18-hour transpacific express flights',
      'Temperature-monitored ULD containerization',
      'Dedicated Boeing 777-F and 747-8F cargo air charters',
      'Real-time flight path satellite tracking'
    ],
    metric: '24/7 Priority Express'
  },
  'rail-logistics': {
    title: 'Rail Logistics & Intermodal',
    subtitle: 'Heavy Freight & Double-Stack Rail Transport',
    badge: 'Rail Logistics',
    img: 'images/rail_logistics_train.jpg',
    description: 'Cost-effective, sustainable heavy freight transport connecting deepwater ocean terminals with inland rail ramps for long-distance container haulage.',
    features: [
      'Intermodal double-stack container trains',
      'Direct ocean port-to-rail ramp transfers',
      'High-capacity heavy industrial rail transport',
      '50% reduction in carbon footprint vs long-haul road transport'
    ],
    metric: 'Direct Port Ramps'
  },
  'fulfilment-centers': {
    title: 'Smart Fulfilment Centers',
    subtitle: 'Automated Order Processing, Picking & Packing',
    badge: 'Warehousing & 3PL',
    img: 'images/smart_warehouse.jpg',
    description: 'Next-generation robotics hubs featuring AGV autonomous sorting, WMS inventory APIs, and same-day e-commerce dispatch capabilities.',
    features: [
      'AGV autonomous robotic picking systems',
      'Real-time cloud WMS inventory API',
      'Custom luxury packaging and kitting services',
      'Peak season scalable storage solutions'
    ],
    metric: '4.5M Sq Ft Storage'
  },
  'cold-storage': {
    title: 'Cold Storage & BioLogistics',
    subtitle: 'Temperature-Controlled Pharma & Food Storage',
    badge: 'Cold Storage',
    img: 'images/cold_storage_facility.jpg',
    description: 'Ultra-low temperature facilities engineered for biological vaccines, life sciences, fresh agriculture, and perishable foods with strict GDP certification.',
    features: [
      'Ultra-low -80°C cryo storage capability',
      'Redundant multi-stage backup power systems',
      'GDP and FDA regulatory compliant tracking',
      'Continuous humidity and thermal sensor logging'
    ],
    metric: '-80°C Cryo Storage'
  },
  'cross-docking': {
    title: 'Cross-Docking & Transit Hubs',
    subtitle: 'Direct Transport Transfer with Minimal Storage Time',
    badge: 'Transit Hubs',
    img: 'images/news_terminal_cranes.jpg',
    description: 'Rapid inbound-to-outbound truck unloading and sorting hubs designed to bypass long warehouse storage times and accelerate distribution speed.',
    features: [
      'Immediate inbound to outbound trailer transfer',
      'Zero-delay inventory turnaround times',
      'Barcode & RFID automatic scan verification',
      'Consolidation of regional distribution flows'
    ],
    metric: '< 2 Hour Turnaround'
  },
  'express-lastmile': {
    title: 'Express & Last-Mile Delivery',
    subtitle: 'Urban Parcel Networks & E-Commerce Fulfillment',
    badge: 'Last-Mile Express',
    img: 'images/news_ev_truck.jpg',
    description: 'Localized electric van delivery networks providing guaranteed same-day and next-day final mile handoffs to consumer doorsteps and retail stores.',
    features: [
      '100% Zero-emission urban electric vans',
      'Real-time consumer ETA SMS notification',
      'Signature-proof electronic proof of delivery (ePOD)',
      'Automated return pickup management'
    ],
    metric: '99.94% On-Time'
  },
  '3pl-4pl-services': {
    title: '3PL & 4PL Lead Logistics',
    subtitle: 'Customs Brokerage, Supply Chain Orchestration & Reverse Logistics',
    badge: '3PL / 4PL Services',
    img: 'images/news_air_cargo.jpg',
    description: 'End-to-end supply chain management including automated customs clearing, 4PL digital orchestration platforms, and sustainable reverse returns handling.',
    features: [
      'International trade compliance & customs brokerage',
      '4PL single-point supply chain control tower',
      'Reverse logistics, refurbishing & returns sorting',
      'AI supply chain bottleneck forecasting'
    ],
    metric: 'Global Compliance'
  }
};

function initSectorModals() {
  const modal = document.getElementById('sector-detail-modal');
  const closeBtn = document.querySelector('.sector-modal-close');
  const cardBtns = document.querySelectorAll('.btn-card-action');

  if (!modal) return;

  cardBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectorKey = btn.getAttribute('data-sector');
      const data = sectorDataMap[sectorKey];

      if (data) {
        document.getElementById('modal-sector-badge').textContent = data.badge;
        document.getElementById('modal-sector-title').textContent = data.title;
        document.getElementById('modal-sector-subtitle').textContent = data.subtitle;
        document.getElementById('modal-sector-img').src = data.img;
        document.getElementById('modal-sector-desc').textContent = data.description;
        document.getElementById('modal-sector-metric').textContent = data.metric;

        const featureList = document.getElementById('modal-sector-features');
        featureList.innerHTML = '';
        data.features.forEach(feat => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-cyan);"></i> ${feat}`;
          featureList.appendChild(li);
        });

        modal.classList.add('active');
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
