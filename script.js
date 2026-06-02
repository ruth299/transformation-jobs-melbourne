/* =============================================
   MELBOURNE JOBDASH — LIVE + TREND CHARTS
   ============================================= */

const APP_ID  = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Live job queries
const JOB_QUERIES = [
  { label: 'Transformation', q: 'transformation+lead' },
  { label: 'Business Analyst', q: 'business+analyst' },
  { label: 'Program Manager', q: 'program+manager' },
  { label: 'Project Manager', q: 'project+manager' },
  { label: 'Change Manager', q: 'change+manager' },
  { label: 'ERP', q: 'ERP+consultant' },
];

// History trend queries — these roles for the trend chart
const TREND_ROLES = [
  { label: 'Project Manager', q: 'project manager', color: '#58A6FF' },
  { label: 'Program Manager', q: 'program manager', color: '#3FB950' },
  { label: 'Business Analyst', q: 'business analyst', color: '#E3B341' },
  { label: 'ERP',             q: 'ERP consultant',   color: '#BC8CFF' },
  { label: 'Change Manager',  q: 'change manager',   color: '#39D0B8' },
];

let allJobs      = [];
let filteredJobs = [];
let activeFilter = { type: 'keyword', val: '' };
let searchTerm   = '';
let donutChart   = null;
let trendChart   = null;

// DOM
const $ = id => document.getElementById(id);
const jobsContainer  = $('jobsContainer');
const searchInput    = $('searchInput');
const jobCount       = $('jobCount');
const loadingState   = $('loadingState');
const errorState     = $('errorState');
const noResultsState = $('noResultsState');
const tableHead      = $('tableHead');

document.addEventListener('DOMContentLoaded', () => {
  fetchJobs();
  fetchTrends();
  startClock();

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value.toLowerCase();
    applyFilters();
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = { type: chip.dataset.type, val: chip.dataset.val.toLowerCase() };
      applyFilters();
    });
  });

  $('clearBtn')?.addEventListener('click', clearAll);
  $('refreshBtn')?.addEventListener('click', () => { fetchJobs(); fetchTrends(); });
  $('retryButton')?.addEventListener('click', fetchJobs);
});

// CLOCK
function startClock() {
  const tick = () => {
    const t = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    const el = $('sidebarTime');
    if (el) el.textContent = t;
  };
  tick();
  setInterval(tick, 60000);
}

// =====================
// FETCH LIVE JOBS
// =====================
async function fetchJobs() {
  showLoading();
  let jobs = [];

  for (const { q } of JOB_QUERIES) {
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=50&what=${q}&where=Melbourne&sort_by=date`;
    for (const proxy of PROXIES) {
      try {
        const res = await fetch(proxy + encodeURIComponent(apiUrl), { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data.results?.length) { jobs = [...jobs, ...data.results]; break; }
        }
      } catch(e) { continue; }
    }
  }

  if (!jobs.length) { showError('Unable to reach the jobs API. Please retry.'); return; }

  allJobs = Array.from(new Map(jobs.map(j => [j.id, j])).values());
  allJobs.sort((a, b) => new Date(b.created) - new Date(a.created));

  updateStats();
  buildDonut();
  filteredJobs = [...allJobs];
  applyFilters();
  hideError();
}

// =====================
// FETCH TREND HISTORY
// =====================
async function fetchTrends() {
  $('trendLoading')?.classList.remove('hidden');
  $('trendChart')?.classList.add('hidden');
  $('trendError')?.classList.add('hidden');

  const datasets = [];
  let labels = [];

  for (const role of TREND_ROLES) {
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/au/history?app_id=${APP_ID}&app_key=${API_KEY}&what=${encodeURIComponent(role.q)}&location0=Australia&location1=Victoria`;
    let fetched = false;

    for (const proxy of PROXIES) {
      try {
        const res = await fetch(proxy + encodeURIComponent(apiUrl), { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          // Adzuna history returns { month: count } object
          if (data && typeof data === 'object' && !data.error) {
            const entries = Object.entries(data).sort((a,b) => a[0].localeCompare(b[0]));
            // Keep last 12 months
            const recent = entries.slice(-12);
            if (labels.length === 0) {
              labels = recent.map(([k]) => {
                const d = new Date(k);
                return d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' });
              });
            }
            datasets.push({
              label: role.label,
              data: recent.map(([, v]) => v),
              borderColor: role.color,
              backgroundColor: role.color + '18',
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.4,
              fill: false,
            });
            fetched = true;
            break;
          }
        }
      } catch(e) { continue; }
    }
  }

  $('trendLoading')?.classList.add('hidden');

  if (!datasets.length) {
    $('trendError')?.classList.remove('hidden');
    return;
  }

  const canvas = $('trendChart');
  canvas.classList.remove('hidden');

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8B949E', font: { family: 'DM Mono', size: 11 }, boxWidth: 12, padding: 16 }
        },
        tooltip: {
          backgroundColor: '#1C2333',
          borderColor: '#30363D',
          borderWidth: 1,
          titleColor: '#E6EDF3',
          bodyColor: '#8B949E',
          padding: 10,
        }
      },
      scales: {
        x: {
          ticks: { color: '#484F58', font: { family: 'DM Mono', size: 10 } },
          grid: { color: '#21262D' },
        },
        y: {
          ticks: { color: '#484F58', font: { family: 'DM Mono', size: 10 } },
          grid: { color: '#21262D' },
          title: { display: true, text: 'Job Count', color: '#484F58', font: { size: 11 } }
        }
      }
    }
  });
}

// =====================
// DONUT CHART
// =====================
function buildDonut() {
  const keywords = ['Transformation', 'Business Analyst', 'Program Manager', 'Project Manager', 'Change Manager', 'ERP'];
  const colors   = ['#58A6FF','#3FB950','#E3B341','#BC8CFF','#39D0B8','#F78166'];

  const counts = keywords.map(kw => {
    return allJobs.filter(j => {
      const t = `${j.title} ${j.description}`.toLowerCase();
      return t.includes(kw.toLowerCase());
    }).length;
  });

  const canvas = $('donutChart');
  if (!canvas) return;
  if (donutChart) donutChart.destroy();

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: keywords,
      datasets: [{ data: counts, backgroundColor: colors, borderColor: '#0D1117', borderWidth: 3, hoverOffset: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8B949E', font: { family: 'DM Mono', size: 10 }, boxWidth: 10, padding: 10 }
        },
        tooltip: {
          backgroundColor: '#1C2333', borderColor: '#30363D', borderWidth: 1,
          titleColor: '#E6EDF3', bodyColor: '#8B949E', padding: 10,
        }
      }
    }
  });
}

// =====================
// STATS
// =====================
function updateStats() {
  const now = new Date();
  $('totalJobs').textContent = allJobs.length;

  const newCount = allJobs.filter(j => Math.floor((now - new Date(j.created)) / 86400000) === 0).length;
  $('newToday').textContent = newCount;

  const withSal = allJobs.filter(j => j.salary_min && j.salary_max);
  $('avgSalary').textContent = withSal.length
    ? `$${Math.round(withSal.reduce((s,j) => s + (j.salary_min+j.salary_max)/2, 0) / withSal.length / 1000)}K`
    : 'N/A';

  const sources = {};
  allJobs.forEach(j => { const s = getSource(j.redirect_url); sources[s] = (sources[s]||0)+1; });
  const top = Object.entries(sources).sort((a,b) => b[1]-a[1])[0];
  $('topSource').textContent = top ? top[0] : '—';
  $('lastUpdated').textContent = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

// =====================
// FILTERS & RENDER
// =====================
function applyFilters() {
  filteredJobs = allJobs.filter(job => {
    const text = `${job.title} ${job.description} ${job.company?.display_name} ${job.location?.display_name}`.toLowerCase();
    const matchSearch = !searchTerm || text.includes(searchTerm);
    const matchFilter = !activeFilter.val || text.includes(activeFilter.val);
    return matchSearch && matchFilter;
  });
  renderJobs(filteredJobs);
}

function clearAll() {
  searchTerm = ''; if (searchInput) searchInput.value = '';
  activeFilter = { type: 'keyword', val: '' };
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-val=""]')?.classList.add('active');
  filteredJobs = [...allJobs];
  renderJobs(filteredJobs);
}

function renderJobs(jobs) {
  jobsContainer.innerHTML = '';
  hideLoading(); hideError();
  if (!jobs.length) {
    noResultsState.classList.remove('hidden');
    tableHead.classList.add('hidden');
    jobCount.textContent = '0 roles found';
    return;
  }
  noResultsState.classList.add('hidden');
  tableHead.classList.remove('hidden');
  jobCount.textContent = `${jobs.length} role${jobs.length !== 1 ? 's' : ''} found`;
  jobs.forEach((job, i) => jobsContainer.appendChild(createCard(job, i)));
}

function createCard(job, index) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.style.animationDelay = `${Math.min(index * 20, 400)}ms`;
  const days = Math.floor((new Date() - new Date(job.created)) / 86400000);
  const postedText = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`;
  const hasSalary = job.salary_min && job.salary_max;
  const salary = hasSalary ? `$${Math.round(job.salary_min/1000)}K–$${Math.round(job.salary_max/1000)}K` : 'Not listed';

  card.innerHTML = `
    <div>
      <div class="job-title-text">${esc(job.title)}${days===0?'<span class="badge-new">NEW</span>':''}</div>
      <div class="job-company-text">${esc(job.company?.display_name||'')}</div>
    </div>
    <div><span class="salary-pill ${hasSalary?'':'none'}">${salary}</span></div>
    <div><span class="posted-text ${days===0?'today':''}">${postedText}</span></div>
    <div><span class="source-pill">${getSource(job.redirect_url)}</span></div>
    <div><span style="font-size:12px;color:var(--text2)">${esc(job.location?.display_name||'Melbourne')}</span></div>
    <div><a href="${job.redirect_url}" target="_blank" rel="noopener noreferrer" class="view-btn">View →</a></div>
  `;
  return card;
}

function getSource(url) {
  if (!url) return 'Board';
  const u = url.toLowerCase();
  if (u.includes('seek')) return 'Seek';
  if (u.includes('linkedin')) return 'LinkedIn';
  if (u.includes('indeed')) return 'Indeed';
  if (u.includes('jora')) return 'Jora';
  return 'Adzuna';
}

function esc(str='') {
  return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function showLoading() { loadingState.classList.remove('hidden'); errorState.classList.add('hidden'); noResultsState.classList.add('hidden'); tableHead.classList.add('hidden'); jobsContainer.innerHTML=''; jobCount.textContent='Loading…'; }
function hideLoading() { loadingState.classList.add('hidden'); }
function showError(msg) { errorState.classList.remove('hidden'); loadingState.classList.add('hidden'); noResultsState.classList.add('hidden'); tableHead.classList.add('hidden'); jobsContainer.innerHTML=''; const el=$('errorMessage'); if(el) el.textContent=msg; }
function hideError() { errorState.classList.add('hidden'); }
