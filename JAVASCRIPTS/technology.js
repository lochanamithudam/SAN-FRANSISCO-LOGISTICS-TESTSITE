/* SAN FRANCISCO LOGISTICS - TECHNOLOGY & AI INTERFACE LOGIC */

document.addEventListener('DOMContentLoaded', () => {
  initEtaSimulator();
  initAgvController();
  initIotTelemetry();
  initCustomsApiSandbox();
  initTechCounters();
});

/* 1. Predictive ETA Modeling Simulator */
function initEtaSimulator() {
  const simBtn = document.getElementById('eta-sim-btn');
  if (!simBtn) return;

  simBtn.addEventListener('click', () => {
    const origin = document.getElementById('eta-origin')?.value || 'shanghai';
    const weather = document.getElementById('eta-weather')?.value || 'moderate';
    const queue = document.getElementById('eta-queue')?.value || 'standard';

    simBtn.innerHTML = '<i class="fas fa-microchip fa-spin"></i> Analyzing ML Variables...';

    setTimeout(() => {
      simBtn.innerHTML = '<i class="fas fa-play"></i> Run ML ETA Prediction Model';
      
      let baseHours = 240; // 10 days base
      if (origin === 'rotterdam') baseHours = 192;
      if (origin === 'singapore') baseHours = 216;
      if (origin === 'yokohama') baseHours = 144;

      if (weather === 'storm') baseHours += 36;
      if (weather === 'calm') baseHours -= 12;

      if (queue === 'heavy') baseHours += 48;
      if (queue === 'express') baseHours -= 18;

      const days = (baseHours / 24).toFixed(1);
      const accuracy = (99.85 + Math.random() * 0.14).toFixed(2);
      const hoursSaved = Math.floor(18 + Math.random() * 24);

      const resultBox = document.getElementById('eta-output-box');
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 6px;">
            <i class="fas fa-check-circle"></i> AI ETA PREDICTION COMPUTED
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div>
              <span style="color: var(--text-dim); font-size: 0.75rem;">PREDICTED ARRIVAL TIME</span>
              <div class="sim-output-value">${days} Days</div>
            </div>
            <div>
              <span style="color: var(--text-dim); font-size: 0.75rem;">ML MODEL ACCURACY</span>
              <div class="sim-output-value" style="color: var(--accent-emerald);">${accuracy}%</div>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 0.8rem; color: #94a3b8;">
            <i class="fas fa-bolt" style="color: var(--accent-gold);"></i> Algorithm rerouted around ocean swell — saved approx ${hoursSaved} transit hours.
          </div>
        `;
      }
    }, 900);
  });
}

/* 2. Autonomous AGV Robotics Warehouse Simulator */
function initAgvController() {
  const slider = document.getElementById('agv-speed-slider');
  const rateDisplay = document.getElementById('agv-sort-rate');
  const countDisplay = document.getElementById('agv-live-count');

  if (!slider) return;

  let currentCount = 84200;
  setInterval(() => {
    const rate = parseInt(slider.value, 10);
    const added = Math.floor(rate / 3600 * 2);
    currentCount += added;
    if (countDisplay) {
      countDisplay.textContent = currentCount.toLocaleString();
    }
  }, 2000);

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (rateDisplay) {
      rateDisplay.textContent = val.toLocaleString() + ' sorts / hr';
    }
  });
}

/* 3. IoT Telemetry & Sensor Stream Simulator */
function initIotTelemetry() {
  const tempDisplay = document.getElementById('iot-temp-val');
  const shockDisplay = document.getElementById('iot-shock-val');
  const humidityDisplay = document.getElementById('iot-humidity-val');
  const profileSelect = document.getElementById('iot-profile-select');

  if (!tempDisplay) return;

  const profiles = {
    pharma: { temp: -20.4, shock: 0.02, humidity: 42, label: 'Vaccine Cold Chain' },
    semicon: { temp: 21.5, shock: 0.01, humidity: 30, label: 'Silicon Wafer ULD' },
    fresh: { temp: 3.2, shock: 0.05, humidity: 85, label: 'Perishable Produce' }
  };

  let activeKey = 'pharma';

  profileSelect?.addEventListener('change', (e) => {
    activeKey = e.target.value;
  });

  setInterval(() => {
    const data = profiles[activeKey] || profiles.pharma;
    const tempJitter = (data.temp + (Math.random() * 0.2 - 0.1)).toFixed(1);
    const shockJitter = (data.shock + (Math.random() * 0.01)).toFixed(2);
    const humJitter = Math.floor(data.humidity + (Math.random() * 2 - 1));

    if (tempDisplay) tempDisplay.textContent = `${tempJitter} °C`;
    if (shockDisplay) shockDisplay.textContent = `${shockJitter} G`;
    if (humidityDisplay) humidityDisplay.textContent = `${humJitter}%`;
  }, 2500);
}

/* 4. Automated Customs API Sandbox Simulator */
function initCustomsApiSandbox() {
  const apiBtn = document.getElementById('customs-api-btn');
  const apiOutput = document.getElementById('customs-api-output');

  if (!apiBtn) return;

  apiBtn.addEventListener('click', () => {
    apiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitting Digital Declaration...';

    setTimeout(() => {
      apiBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Execute Instant Customs Filing';

      const timestamp = new Date().toISOString();
      const authHash = '0x' + Math.random().toString(16).substring(2, 10).toUpperCase();

      if (apiOutput) {
        apiOutput.style.display = 'block';
        apiOutput.innerHTML = `
<pre style="margin: 0; white-space: pre-wrap; font-family: monospace; color: #38bdf8;">
HTTP/2 200 OK
Content-Type: application/json; charset=utf-8
X-Customs-Clearance-Time: 00:01:42 (102 seconds)

{
  "status": "APPROVED",
  "declaration_id": "SF-CUST-2026-${Math.floor(100000 + Math.random() * 900000)}",
  "port_of_entry": "US-SFO (San Francisco)",
  "clearance_timestamp": "${timestamp}",
  "duty_fee_paid": "$0.00 (Exempt Cargo)",
  "customs_digital_signature": "${authHash}",
  "inspection_bypassed": true,
  "ai_risk_score": "0.001 (LOWEST_RISK_TIER)"
}
</pre>
        `;
      }
    }, 1100);
  });
}

/* 5. Ticker & Counter Animations */
function initTechCounters() {
  const counters = document.querySelectorAll('.tech-counter');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    let start = 0;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      counter.textContent = (target % 1 === 0 ? Math.floor(start) : start.toFixed(1)) + suffix;
    }, stepTime);
  });
}

/* Modal Openers */
function openTechModal() {
  const modal = document.getElementById('tech-modal-overlay');
  if (modal) modal.classList.add('active');
}

function closeTechModal() {
  const modal = document.getElementById('tech-modal-overlay');
  if (modal) modal.classList.remove('active');
}
