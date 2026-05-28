/* ==========================================
   TRANSFORMATION JOBS MELBOURNE - ENHANCED
   ========================================== */

console.log('App loaded');

/* ==========================================
   CONFIG
========================================== */

// IMPORTANT: move these to a backend later
const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

// Wider search for your target roles
const SEARCH_TERMS = [
    'program manager',
    'project manager',
    'business analyst',
    'senior business analyst',
    'transformation',
    'erp',
    'technology transformation',
    'delivery lead'
];

const BASE_URL =
    'https://corsproxy.io/?https://api.adzuna.com/v1/api/jobs/au/search/1';

// fallback jobs if API fails
const backupJobs = [];

/* ==========================================
   STATE
========================================== */

let allJobs = [];
let filteredJobs = [];

/* ==========================================
   DOM
========================================== */

const jobsContainer = document.getElementById('jobsContainer');
const searchInput = document.getElementById('searchInput');
const filterChips = document.querySelectorAll('.filter-chip');
const jobCount = document.getElementById('jobCount');
const totalJobs = document.getElementById('totalJobs');
const clearFiltersBtn = document.getElementById('clearFilters');
const retryButton = document.getElementById('retryButton');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const noResultsState = document.getElementById('noResultsState');

// dashboard stats
const newJobsToday = document.getElementById('newJobsToday');
const avgSalary = document.getElementById('avgSalary');

/* ==========================================
   INIT
========================================== */

document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    searchInput?.addEventListener('input', applyFilters);

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            applyFilters();
        });
    });

    clearFiltersBtn?.addEventListener('click', clearFilters);
    retryButton?.addEventListener('click', fetchJobs);
});

/* ==========================================
   FETCH JOBS
========================================== */

async function fetchJobs() {
    showLoadingState();

    try {
        console.log('Fetching jobs...');

        // fetch all searches in parallel
        const requests = SEARCH_TERMS.map(term => {
            const url =
                `${BASE_URL}?app_id=${APP_ID}` +
                `&app_key=${API_KEY}` +
                `&results_per_page=50` +
                `&what=${encodeURIComponent(term)}` +
                `&where=Melbourne` +
                `&sort_by=date` +
                `&content-type=application/json`;

            return fetch(url).then(res => {
                if (!res.ok) {
                    throw new Error(`API failed: ${res.status}`);
                }
                return res.json();
            });
        });

        const responses = await Promise.all(requests);

        // merge + dedupe jobs
        const jobsMap = new Map();

        responses.forEach(data => {
            (data.results || []).forEach(job => {
                jobsMap.set(job.id, job);
            });
        });

        allJobs = Array.from(jobsMap.values());

        // sort newest first
        allJobs.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
        );

        filteredJobs = [...allJobs];

        updateDashboardStats();
        renderJobs(filteredJobs);
        updateTimestamp();

    } catch (error) {
        console.error(error);

        // fallback
        if (backupJobs.length > 0) {
            allJobs = backupJobs;
            filteredJobs = [...backupJobs];

            renderJobs(filteredJobs);

            alert(
                'Live jobs unavailable. Showing cached jobs.'
            );
        } else {
            showErrorState(
                'Unable to load jobs right now. Please retry.'
            );
        }
    }
}

/* ==========================================
   FILTERS
========================================== */

function applyFilters() {
    const searchTerm =
        (searchInput?.value || '').toLowerCase();

    filteredJobs = allJobs.filter(job => {

        const jobText = `
            ${job.title || ''}
            ${job.description || ''}
            ${job.company?.display_name || ''}
            ${job.location?.display_name || ''}
        `.toLowerCase();

        return (
            !searchTerm ||
            jobText.includes(searchTerm)
        );
    });

    renderJobs(filteredJobs);
}

/* ==========================================
   CLEAR FILTERS
========================================== */

function clearFilters() {
    if (searchInput) {
        searchInput.value = '';
    }

    filterChips.forEach(chip =>
        chip.classList.remove('active')
    );

    filteredJobs = [...allJobs];
    renderJobs(filteredJobs);
}

/* ==========================================
   DASHBOARD STATS
========================================== */

function updateDashboardStats() {

    totalJobs &&
        (totalJobs.textContent =
            allJobs.length);

    // new today
    const todayJobs = allJobs.filter(job => {
        const diffDays = getPostedDays(job.created);
        return diffDays === 0;
    });

    newJobsToday &&
        (newJobsToday.textContent =
            todayJobs.length);

    // avg salary
    const salaries = allJobs
        .filter(job => job.salary_max)
        .map(job => job.salary_max);

    const average =
        salaries.length
            ? Math.round(
                  salaries.reduce(
                      (a, b) => a + b,
                      0
                  ) / salaries.length
              )
            : 0;

    avgSalary &&
        (avgSalary.textContent =
            average
                ? `$${Math.round(
                      average / 1000
                  )}K`
                : 'N/A');
}

/* ==========================================
   RENDER JOBS
========================================== */

function renderJobs(jobs) {

    jobsContainer.innerHTML = '';

    hideLoadingState();
    hideErrorState();

    if (!jobs.length) {
        showNoResultsState();
        return;
    }

    jobCount &&
        (jobCount.textContent =
            `${jobs.length} jobs found`);

    jobs.forEach((job, index) => {

        const card = createJobCard(job);

        card.style.animation =
            `fadeIn ${200 + index * 40}ms ease-out forwards`;

        card.style.opacity = '0';

        jobsContainer.appendChild(card);
    });
}

/* ==========================================
   CREATE JOB CARD
========================================== */

function createJobCard(job) {

    const card =
        document.createElement('div');

    card.className = 'job-card';

    const diffDays =
        getPostedDays(job.created);

    const postedText =
        diffDays === 0
            ? 'Today'
            : diffDays === 1
            ? 'Yesterday'
            : `${diffDays}d ago`;

    const isNewToday =
        diffDays === 0;

    const salary =
        job.salary_min &&
        job.salary_max
            ? `$${Math.round(
                  job.salary_min / 1000
              )}K - $${Math.round(
                  job.salary_max / 1000
              )}K`
            : 'Salary not listed';

    const source =
        getSourceName(
            job.redirect_url
        );

    card.innerHTML = `
        <div class="job-card-header">
            <div>
                <h3 class="job-title">
                    ${escapeHtml(job.title)}
                </h3>

                <p class="job-company">
                    ${escapeHtml(
                        job.company?.display_name ||
                        'Company'
                    )}
                </p>
            </div>

            ${
                isNewToday
                    ? `<span class="new-badge">
                        NEW TODAY
                    </span>`
                    : ''
            }
        </div>

        <div class="salary-badge">
            ${salary}
        </div>

        <div class="job-meta">
            📍 ${
                escapeHtml(
                    job.location?.display_name ||
                    'Melbourne'
                )
            }
        </div>

        <div class="job-footer">

            <span class="posted-badge">
                ${postedText}
            </span>

            <span class="job-source">
                ${source}
            </span>

            <a href="${job.redirect_url}"
               target="_blank"
               rel="noopener noreferrer"
               class="apply-btn">

                View Job
            </a>

        </div>
    `;

    return card;
}

/* ==========================================
   HELPERS
========================================== */

function getPostedDays(date) {
    const postedDate =
        new Date(date);

    return Math.floor(
        (new Date() - postedDate) /
        (1000 * 60 * 60 * 24)
    );
}

function getSourceName(url = '') {

    const lower =
        url.toLowerCase();

    if (lower.includes('seek'))
        return 'Seek';

    if (lower.includes('linkedin'))
        return 'LinkedIn';

    if (lower.includes('indeed'))
        return 'Indeed';

    if (lower.includes('jora'))
        return 'Jora';

    return 'Job Board';
}

function escapeHtml(text = '') {

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return String(text).replace(
        /[&<>"']/g,
        m => map[m]
    );
}

/* ==========================================
   STATES
========================================== */

function showLoadingState() {
    loadingState?.classList.remove(
        'hidden'
    );

    errorState?.classList.add(
        'hidden'
    );

    noResultsState?.classList.add(
        'hidden'
    );

    jobsContainer.innerHTML = '';
}

function hideLoadingState() {
    loadingState?.classList.add(
        'hidden'
    );
}

function showErrorState(message) {

    errorState?.classList.remove(
        'hidden'
    );

    loadingState?.classList.add(
        'hidden'
    );

    jobsContainer.innerHTML = '';

    const errorMessage =
        document.getElementById(
            'errorMessage'
        );

    if (errorMessage) {
        errorMessage.textContent =
            message;
    }
}

function hideErrorState() {
    errorState?.classList.add(
        'hidden'
    );
}

function showNoResultsState() {
    noResultsState?.classList.remove(
        'hidden'
    );
}

/* ==========================================
   TIMESTAMP
========================================== */

function updateTimestamp() {

    const now =
        new Date();

    const timeString =
        now.toLocaleTimeString(
            'en-AU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    const lastUpdated =
        document.getElementById(
            'lastUpdated'
        );

    if (lastUpdated) {
        lastUpdated.textContent =
            `Updated ${timeString}`;
    }
}
