/* SAN FRANCISCO LOGISTICS - GLOBAL NETWORK INTERACTIVE SCRIPT */

document.addEventListener('DOMContentLoaded', () => {
  initHubInspector();
  initRouteSimulator();
  initTelemetryFeed();
  initCounters();
});

// Hub Dataset
const networkHubs = {
  sf: {
    id: 'sf',
    name: 'San Francisco Ocean & Air Command',
    country: 'United States (HQ)',
    location: 'Port of San Francisco & SFO Logistics Complex',
    capacity: '2.8 Million TEU / 850K Air Tons',
    cranes: '30 Automated Gantry Cranes',
    depth: '16.5m Deepwater Berth',
    customs: '1.2 Hours (Pre-Cleared)',
    ships: '18 Ocean Vessels | 12 Air Cargo Flights',
    image: 'images/global_network_sf_hq.jpg',
    badge: 'PACIFIC COMMAND HQ',
    desc: 'Primary international nerve center orchestrating satellite tracking, fleet management, and deepwater Pacific trade lanes.'
  },
  shanghai: {
    id: 'shanghai',
    name: 'Shanghai Yangshan Deepwater Hub',
    country: 'China',
    location: 'Yangshan Port & Pudong Logistics Hub',
    capacity: '47.3 Million TEU Annual',
    cranes: '110 Automated Quay Cranes',
    depth: '17.8m Ultra-Deep Berth',
    customs: '1.8 Hours',
    ships: '42 Ocean Vessels | 28 Air Cargo Flights',
    image: 'images/shanghai_mega_hub.jpg',
    badge: 'EAST ASIA MEGA-HUB',
    desc: 'World’s largest automated container terminal featuring zero-emission AGVs and direct silk-road rail links.'
  },
  rotterdam: {
    id: 'rotterdam',
    name: 'Rotterdam Maasvlakte II Gateway',
    country: 'Netherlands',
    location: 'Port of Rotterdam & Euro Terminal',
    capacity: '15.3 Million TEU Annual',
    cranes: '45 Green Electric Cranes',
    depth: '19.5m Super-Deepwater Berth',
    customs: '1.4 Hours',
    ships: '24 Ocean Vessels | 16 Express Barges',
    image: 'images/rotterdam_gateway.jpg',
    badge: 'EUROPEAN GREEN CORRIDOR',
    desc: 'European green corridor gateway equipped with hydrogen fueling berths and cold-chain bio-pharma vaults.'
  },
  singapore: {
    id: 'singapore',
    name: 'Singapore Tuas Megaport & Changi',
    country: 'Singapore',
    location: 'Tuas Port & Changi Air Cargo Complex',
    capacity: '37.5 Million TEU Annual',
    cranes: '85 High-Speed Gantry Cranes',
    depth: '18.0m Deepwater Berth',
    customs: '0.9 Hours (Fast-Track)',
    ships: '36 Ocean Vessels | 31 Air Freighters',
    image: 'images/global_network_banner.jpg',
    badge: 'STRAITS TRANSSHIPMENT',
    desc: 'Strategic crossroads of Southeast Asia featuring 24/7 air express cargo and ultra-fast customs clearance.'
  },
  dubai: {
    id: 'dubai',
    name: 'Dubai Jebel Ali & DWC Cargo Hub',
    country: 'United Arab Emirates',
    location: 'Jebel Ali Free Zone & Al Maktoum Airport',
    capacity: '19.5 Million TEU / 1.2M Air Tons',
    cranes: '55 Automated Cranes',
    depth: '17.0m Deepwater Berth',
    customs: '1.1 Hours',
    ships: '19 Ocean Vessels | 22 Air Freighters',
    image: 'images/dubai_logistics_zone.jpg',
    badge: 'MIDDLE EAST SEA-AIR FREEZONE',
    desc: 'Integrated sea-air free zone connecting Asia, Europe, and Africa with solar-powered climate vaults.'
  },
  sydney: {
    id: 'sydney',
    name: 'Sydney Port Botany Logistics Hub',
    country: 'Australia',
    location: 'Botany Bay & Sydney Intermodal Terminal',
    capacity: '4.2 Million TEU Annual',
    cranes: '18 High-Speed Cranes',
    depth: '16.0m Deepwater Berth',
    customs: '1.5 Hours',
    ships: '11 Ocean Vessels | 8 Air Cargo Flights',
    image: 'images/ocean_freight_ship.jpg',
    badge: 'OCEANIA PACIFIC HUB',
    desc: 'Key Oceania terminal providing containerized breakbulk and dedicated trans-Tasman express corridors.'
  }
};

/* Interactive Map Hub Inspector Logic */
function initHubInspector() {
  const pins = document.querySelectorAll('.hub-pin');
  const chips = document.querySelectorAll('.hub-chip');
  
  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      const hubId = pin.getAttribute('data-hub');
      selectHub(hubId);
    });
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');
      filterHubs(filter);
    });
  });
}

function selectHub(hubId) {
  const hubData = networkHubs[hubId];
  if (!hubData) return;

  // Highlight Pin
  document.querySelectorAll('.hub-pin').forEach(p => p.classList.remove('selected'));
  const targetPin = document.querySelector(`.hub-pin[data-hub="${hubId}"]`);
  if (targetPin) targetPin.classList.add('selected');

  // Update Inspector Card
  const img = document.getElementById('inspector-img');
  const name = document.getElementById('inspector-name');
  const country = document.getElementById('inspector-country');
  const badge = document.getElementById('inspector-badge');
  const capacity = document.getElementById('inspector-capacity');
  const depth = document.getElementById('inspector-depth');
  const customs = document.getElementById('inspector-customs');
  const ships = document.getElementById('inspector-ships');
  const desc = document.getElementById('inspector-desc');

  if (img) img.src = hubData.image;
  if (name) name.textContent = hubData.name;
  if (country) country.textContent = hubData.country;
  if (badge) badge.textContent = hubData.badge;
  if (capacity) capacity.textContent = hubData.capacity;
  if (depth) depth.textContent = hubData.depth;
  if (customs) customs.textContent = hubData.customs;
  if (ships) ships.textContent = hubData.ships;
  if (desc) desc.textContent = hubData.desc;
}

function filterHubs(filter) {
  const cards = document.querySelectorAll('.hub-showcase-card');
  cards.forEach(card => {
    const region = card.getAttribute('data-region');
    if (filter === 'all' || region === filter) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/* Route Simulator Calculation */
function initRouteSimulator() {
  const originSelect = document.getElementById('sim-origin');
  const destSelect = document.getElementById('sim-dest');
  const modeSelect = document.getElementById('sim-mode');
  const calcBtn = document.getElementById('sim-calc-btn');

  const transitVal = document.getElementById('sim-transit-val');
  const freqVal = document.getElementById('sim-freq-val');
  const co2Val = document.getElementById('sim-co2-val');
  const trackIdVal = document.getElementById('sim-track-id');

  calcBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const origin = originSelect?.value || 'sf';
    const dest = destSelect?.value || 'shanghai';
    const mode = modeSelect?.value || 'ocean';

    if (origin === dest) {
      alert('Please select different Origin and Destination hubs!');
      return;
    }

    // Dynamic math simulation based on mode
    let days = 14;
    let freq = 'Daily Sailings';
    let co2 = '42% Saved';

    if (mode === 'air') {
      days = Math.floor(Math.random() * 2) + 1; // 1-2 days
      freq = '4x Daily Flights';
      co2 = '18% Saved (SAF Fuel)';
    } else if (mode === 'multimodal') {
      days = Math.floor(Math.random() * 4) + 5; // 5-8 days
      freq = 'Bi-Weekly Rail/Ocean';
      co2 = '65% Saved (EV & Hydro)';
    } else { // ocean
      days = Math.floor(Math.random() * 5) + 10; // 10-14 days
      freq = '3x Weekly Sailings';
      co2 = '45% Saved (SF Fleet)';
    }

    const randomID = `SFL-${Math.floor(10000 + Math.random() * 90000)}-${mode.toUpperCase().slice(0,3)}`;

    if (transitVal) transitVal.textContent = `${days} Days`;
    if (freqVal) freqVal.textContent = freq;
    if (co2Val) co2Val.textContent = co2;
    if (trackIdVal) trackIdVal.textContent = randomID;
  });
}

/* Live Satellite Telemetry Feed Ticker */
function initTelemetryFeed() {
  const feedBox = document.getElementById('telemetry-feed');
  if (!feedBox) return;

  const sampleTelemetry = [
    { tag: 'OCEAN VESSEL', msg: 'SF Pacific Commander (Vessel #704) crossed Pacific Waypoint 4 at 24.5 knots.' },
    { tag: 'AIR FREIGHT', msg: 'SF Aero Cargo 777-F Flight 402 landed at Frankfurt Airport Terminal 3.' },
    { tag: 'CUSTOMS RELEASE', msg: 'Container #SFL-88392 pre-cleared via Rotterdam Automated Gateway.' },
    { tag: 'PORT BERTH', msg: 'Shanghai Yangshan Berth #9 opened for SF Express Container Vessel.' },
    { tag: 'GREEN FLEET', msg: 'EV Highway Convoy SF-401 completed Los Angeles to SF Corridor run.' },
    { tag: 'SATELLITE TELEMETRY', msg: 'Orbital Satellite SF-Sat-3 verified temperature -22.4°C in Reefer #902.' }
  ];

  let index = 0;
  setInterval(() => {
    const item = sampleTelemetry[index % sampleTelemetry.length];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const line = document.createElement('div');
    line.className = 'telemetry-line';
    line.innerHTML = `
      <span class="telemetry-time">[${timeStr}]</span>
      <span class="telemetry-tag">${item.tag}</span>
      <span>${item.msg}</span>
    `;

    feedBox.prepend(line);
    if (feedBox.children.length > 8) {
      feedBox.removeChild(feedBox.lastChild);
    }
    index++;
  }, 4000);
}

/* Counter Animation */
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    if (!target) return;

    let count = 0;
    const speed = target / 50;

    const updateCount = () => {
      count += speed;
      if (count < target) {
        counter.innerText = Math.ceil(count);
        setTimeout(updateCount, 25);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
}
