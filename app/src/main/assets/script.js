const FEATURES = [
  {
    id: 'mta_prock',
    title: 'MTA prock',
    desc: 'Глубокий анализ отладки соседних устройств. Перехват debug-сессий и инъекция payload.',
    tags: ['ADB', 'inject', 'debug'],
    minSec: 10, maxSec: 22
  },
  {
    id: 'mto_check',
    title: 'Чек уязвимостей по MTO',
    desc: 'Сканирование уязвимостей по базе MTO. Проверка известных CVE и слабых протоколов.',
    tags: ['CVE', 'scan', 'MTO'],
    minSec: 9, maxSec: 20
  },
  {
    id: 'crc_check',
    title: 'CRC проверка',
    desc: 'Проверка гниения кода передачи данных других устройств. Анализ CRC-сумм и целостности пакетов.',
    tags: ['CRC', 'packet', 'integrity'],
    minSec: 8, maxSec: 18
  },
  {
    id: 'ao_adl11',
    title: 'AO ADL11',
    desc: 'Анализ уязвимостей через отладку Bluetooth и Wi-Fi. Поиск открытых портов и уязвимых протоколов.',
    tags: ['BT', 'WiFi', 'recon'],
    minSec: 12, maxSec: 25
  },
  {
    id: 'ao_adl10',
    title: 'AO ADL10',
    desc: 'Предыдущая версия ADL11 — только Bluetooth-отладка. Устаревший, но стабильный модуль.',
    tags: ['BT', 'legacy'],
    minSec: 9, maxSec: 18
  },
  {
    id: 'extrim_hack',
    title: 'ExtrimHack',
    desc: 'Полный разнос. Тяжёлый режим: определяет устройства рядом и выявляет гниение кода на всех уровнях.',
    tags: ['FULL', 'heavy', 'multi'],
    minSec: 25, maxSec: 40
  }
];

const HEX = () => '0x' + Math.floor(Math.random()*0xFFFFFFF).toString(16).toUpperCase().padStart(8,'0');
const RAND_ID = () => Math.random().toString(36).substring(2,10).toUpperCase();

const CODE_TEMPLATES = [
  () => `[+] init_module(${HEX()}) -> ok`,
  () => `[+] loading kernel_hook @ ${HEX()}`,
  () => `[~] resolving symbol: ${['inject_payload','bypass_ssl','patch_crc','scan_bt','sniff_wifi'][Math.floor(Math.random()*5)]}`,
  () => `[+] handshake ${RAND_ID()} accepted`,
  () => `[~] injecting shellcode block ${Math.floor(Math.random()*255)}`,
  () => `[+] ssl_bypass: chain_${RAND_ID()} patched`,
  () => `[!] ${['retry','timeout','fallback','reconnect'][Math.floor(Math.random()*4)]} -> ${HEX()}`,
  () => `[+] crc_check segment ${Math.floor(Math.random()*9999)}: OK`,
  () => `[~] debugger attach: pid=${Math.floor(Math.random()*99999)}`,
  () => `[+] payload signature: ${HEX()}-${HEX()}`,
  () => `[~] scanning ports ${[22,80,443,8080,5555][Math.floor(Math.random()*5)]} ...`,
  () => `[+] tunnel established -> ${RAND_ID().toLowerCase()}.node`,
  () => `[!] anti-debug bypass: ${['OK','PATCHED','SILENT'][Math.floor(Math.random()*3)]}`,
  () => `[+] mem_write @ ${HEX()} size=${Math.floor(Math.random()*512)}b`,
  () => `[~] decrypting stream ${RAND_ID()}`,
  () => `[+] heap spray: ${Math.floor(Math.random()*9000)+1000} blocks`,
  () => `[~] device fingerprint: ${RAND_ID()}-${RAND_ID()}`,
  () => `[+] root_check: ${['BYPASSED','MASKED'][Math.floor(Math.random()*2)]}`,
  () => `[!] signal ${Math.floor(Math.random()*99)} -> handler patched`,
  () => `[+] integrity_chain: ${HEX()} verified`
];

function randomLine() {
  const t = CODE_TEMPLATES[Math.floor(Math.random()*CODE_TEMPLATES.length)];
  const line = t();
  let cls = 'ln';
  if (line.startsWith('[!]')) cls += ' warn';
  if (line.startsWith('[+]')) cls += ' ok';
  return { text: line, cls };
}

const catalog = document.getElementById('catalog');
FEATURES.forEach(f => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-title">${f.title}</div>
    <div class="card-desc">${f.desc}</div>
    <div class="card-meta">${f.tags.map(t=>`<span>${t}</span>`).join('')}</div>
    <button class="btn-start" data-id="${f.id}">START</button>
  `;
  catalog.appendChild(card);
});

setTimeout(() => {
  document.getElementById('splash').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
}, 3000);

const runner = document.getElementById('runner');
const runnerTitle = document.getElementById('runner-title');
const consoleEl = document.getElementById('console');
const progressFill = document.getElementById('progressFill');
const progressPct = document.getElementById('progressPct');
const resultEl = document.getElementById('result');
let activeTimers = [];
let currentFeature = null;

function clearTimers() {
  activeTimers.forEach(t => clearTimeout(t));
  activeTimers = [];
}

function runFeature(feature) {
  currentFeature = feature;
  clearTimers();
  runnerTitle.textContent = '> ' + feature.title;
  consoleEl.innerHTML = '';
  resultEl.classList.add('hidden');
  resultEl.innerHTML = '';
  progressFill.style.width = '0%';
  progressPct.textContent = '0%';
  runner.classList.remove('hidden');

  const totalMs = (feature.minSec + Math.random() * (feature.maxSec - feature.minSec)) * 1000;
  const startTime = Date.now();

  let progress = 0;

  function tickProgress() {
    const elapsed = Date.now() - startTime;
    const ratio = Math.min(elapsed / totalMs, 1);

    let target;
    if (ratio < 0.15) target = ratio * 60;
    else if (ratio < 0.5) target = 9 + (ratio-0.15)*100;
    else if (ratio < 0.7) target = 44 + (ratio-0.5)*60;
    else if (ratio < 0.9) target = 56 + (ratio-0.7)*150;
    else target = 86 + (ratio-0.9)*140;
    target = Math.min(target, 99);

    progress = Math.max(progress, Math.round(target + (Math.random()*2-1)));
    progress = Math.min(progress, 99);
    progressFill.style.width = progress + '%';
    progressPct.textContent = progress + '%';

    if (ratio < 1) {
      const next = 80 + Math.random()*300;
      activeTimers.push(setTimeout(tickProgress, next));
    }
  }
  tickProgress();

  function emitLine() {
    if (Date.now() - startTime >= totalMs) return;
    const { text, cls } = randomLine();
    const ln = document.createElement('div');
    ln.className = cls;
    ln.textContent = text;
    consoleEl.appendChild(ln);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    const burst = Math.random() < 0.25 ? 3 : 1;
    for (let i=1;i<burst;i++) {
      activeTimers.push(setTimeout(() => {
        if (Date.now() - startTime >= totalMs) return;
        const nx = randomLine();
        const nln = document.createElement('div');
        nln.className = nx.cls;
        nln.textContent = nx.text;
        consoleEl.appendChild(nln);
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }, i*60));
    }

    const delay = 120 + Math.random()*550;
    activeTimers.push(setTimeout(emitLine, delay));
  }
  emitLine();

  activeTimers.push(setTimeout(() => {
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
    showResult(feature);
  }, totalMs + 200));
}

function showResult(feature) {
  const rows = [];
  const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
  const mac = Array.from({length:6},()=>Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2,'0')).join(':');
  const id = RAND_ID();
  const crc = '0x' + Math.floor(Math.random()*0xFFFFFFFF).toString(16).toUpperCase().padStart(8,'0');

  rows.push(`<div class="r-row">target_id: <b>${id}</b></div>`);
  rows.push(`<div class="r-row">ip: <b>${ip}</b></div>`);
  rows.push(`<div class="r-row">mac: <b>${mac}</b></div>`);

  if (feature.id === 'crc_check') {
    rows.push(`<div class="r-row">crc_sum: <b>${crc}</b></div>`);
    rows.push(`<div class="r-row">corruption: <b>${['NONE','LOW','MEDIUM'][Math.floor(Math.random()*3)]}</b></div>`);
  } else if (feature.id === 'ao_adl11' || feature.id === 'ao_adl10') {
    rows.push(`<div class="r-row">bt_devices: <b>${Math.floor(Math.random()*6)+1}</b></div>`);
    if (feature.id === 'ao_adl11') rows.push(`<div class="r-row">wifi_aps: <b>${Math.floor(Math.random()*9)+2}</b></div>`);
  } else if (feature.id === 'extrim_hack') {
    rows.push(`<div class="r-row">devices_near: <b>${Math.floor(Math.random()*12)+3}</b></div>`);
    rows.push(`<div class="r-row">code_rot: <b>${['DETECTED','CRITICAL','HIGH'][Math.floor(Math.random()*3)]}</b></div>`);
    rows.push(`<div class="r-row">nodes: <b>${Math.floor(Math.random()*20)+5}</b></div>`);
  } else if (feature.id === 'mto_check') {
    rows.push(`<div class="r-row">cve_found: <b>${Math.floor(Math.random()*5)}</b></div>`);
    rows.push(`<div class="r-row">risk: <b>${['LOW','MEDIUM','HIGH'][Math.floor(Math.random()*3)]}</b></div>`);
  } else {
    rows.push(`<div class="r-row">payload: <b>${crc}</b></div>`);
    rows.push(`<div class="r-row">access: <b>GRANTED</b></div>`);
  }

  resultEl.innerHTML = `
    <div class="r-title">✓ SUCCESS</div>
    ${rows.join('')}
    <div class="r-row" style="margin-top:8px;opacity:0.7">session closed · ${new Date().toLocaleTimeString()}</div>
  `;
  resultEl.classList.remove('hidden');
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-start')) {
    const id = e.target.getAttribute('data-id');
    const f = FEATURES.find(x => x.id === id);
    if (f) runFeature(f);
  }
  if (e.target.id === 'closeRunner') {
    clearTimers();
    runner.classList.add('hidden');
  }
});
