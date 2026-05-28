
/* ==========================================
   TRANSFORMATION JOBS MELBOURNE - SCRIPT V2
   Premium Dashboard + Better API Handling
========================================== */

console.log('App loaded');

/* ==========================================
   CONFIG
========================================== */

// NOTE:
// Move these to backend later for security

const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

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

/* ==========================================
   STATE
========================================== */

let allJobs = [];
let filteredJobs = [];

/* ==========================================
   DOM ELEMENTS
========================================== */

const jobsContainer =
    document.getElementById('jobsContainer');

const searchInput =
    document.getElementById('searchInput');

const filterChips =
    document.querySelectorAll('.filter-chip');

const jobCount =
    document.getElementById('jobCount');

const totalJobs =
    document.getElementById('totalJobs');

const newJobsToday =
    document.getElementById('newJobsToday');

const avgSalary =
    document.getElementById('avgSalary');

const lastUpdated =
    document.getElementById('lastUpdated');

const clearFiltersBtn =
    document.getElementById('clearFilters');

const retryButton =
    document.getElementById('retryButton');

const loadingState =
    document.getElementById('loadingState');

const errorState =
    document.getElementById('errorState');

const noResultsState =
    document.getElementById('noResultsState');

/* ==========================================
   INIT
========================================== */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        fetchJobs();

        searchInput?.addEventListener(
            'input',
            applyFilters
        );

        filterChips.forEach(chip => {
            chip.addEventListener(
                'click',
                () => {
                    chip.classList.toggle(
                        'active'
                    );

                    applyFilters();
                }
            );
        });

        clearFiltersBtn?.addEventListener(
            'click',
            clearFilters
        );

        retryButton?.addEventListener(
            'click',
            fetchJobs
        );
    }
);

/* ==========================================
   FETCH JOBS
========================================== */

async function fetchJobs() {

    showLoadingState();

    try {

        console.log(
            'Fetching jobs...'
        );

        const requests =
            SEARCH_TERMS.map(term => {

                const url =
                    `${BASE_URL}` +
                    `?app_id=${APP_ID}` +
                    `&app_key=${API_KEY}` +
                    `&results_per_page=50` +
                    `&what=${encodeURIComponent(term)}` +
                    `&where=Melbourne` +
                    `&sort_by=date` +
                    `&content-type=application/json`;

                return fetch(url)
                    .then(response => {

                        if (!response.ok) {
                            throw new Error(
                                `API Error ${response.status}`
                            );
                        }

                        return response.json();
                    });
            });

        const responses =
            await Promise.all(requests);

        const jobsMap =
            new Map();

        responses.forEach(data => {

            const jobs =
                data.results || [];

            jobs.forEach(job => {

                if (job.id) {
                    jobsMap.set(
                        job.id,
                        job
                    );
                }
            });
        });

        allJobs =
            Array.from(
                jobsMap.values()
            );

        allJobs.sort(
            (a, b) =>
                new Date(b.created) -
                new Date(a.created)
        );

        filteredJobs =
            [...allJobs];

        updateDashboardStats();

        renderJobs(
            filteredJobs
        );

        updateTimestamp();

    } catch (error) {

        console.error(
            'Error loading jobs:',
            error
        );

        showErrorState(
            'Unable to load jobs right now. Please retry.'
        );
    }
}

/* ==========================================
   FILTERS
========================================== */

function applyFilters() {

    const searchTerm =
        (
            searchInput?.value || ''
        ).toLowerCase();

    filteredJobs =
        allJobs.filter(job => {

            const text = `
                ${job.title || ''}
                ${job.description || ''}
                ${job.company?.display_name || ''}
                ${job.location?.display_name || ''}
            `.toLowerCase();

            return (
                !searchTerm ||
                text.includes(
                    searchTerm
                )
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

    filterChips.forEach(
        chip =>
            chip.classList.remove(
                'active'
            )
    );

    filteredJobs =
        [...allJobs];

    renderJobs(
        filteredJobs
    );
}

/* ==========================================
   DASHBOARD
========================================== */

function updateDashboardStats() {

    totalJobs &&
        (
            totalJobs.textContent =
            allJobs.length
        );

    const todayJobs =
        allJobs.filter(job => {

            const days =
                getPostedDays(
                    job.created
                );

            return days === 0;
        });

    newJobsToday &&
        (
            newJobsToday.textContent =
            todayJobs.length
        );

    const salaries =
        allJobs
            .filter(
                j => j.salary_max
            )
            .map(
                j => j.salary_max
            );

    const average =
        salaries.length
            ? salaries.reduce(
                (a, b) => a + b,
                0
              ) / salaries.length
            : 0;

    avgSalary &&
        (
            avgSalary.textContent =
            average
                ? `$${Math.round(
                    average / 1000
                  )}K`
                : 'N/A'
        );
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

        jobCount &&
            (
                jobCount.textContent =
                '0 jobs found'
            );

        return;
    }

    jobCount &&
        (
            jobCount.textContent =
            `${jobs.length} jobs found`
        );

    jobs.forEach(
        (job, index) => {

            const card =
                createJobCard(job);

            card.style.animation =
                `fadeIn ${
                    150 +
                    index * 25
                }ms ease forwards`;

            jobsContainer.appendChild(
                card
            );
        }
    );
}

/* ==========================================
   JOB CARD
========================================== */

function createJobCard(job) {

    const card =
        document.createElement(
            'div'
        );

    card.className =
        'job-card';

    const postedDate =
        new Date(
            job.created
        );

    const diffDays =
        getPostedDays(
            job.created
        );

    const isNewToday =
        diffDays === 0;

    const postedText =
        postedDate.toLocaleDateString(
            'en-AU',
            {
                day: 'numeric',
                month: 'short'
            }
        );

    const postedTime =
        postedDate.toLocaleTimeString(
            'en-AU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

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
                    ${escapeHtml(
                        job.title
                    )}
                </h3>

                <p class="job-company">
                    ${escapeHtml(
                        job.company
                        ?.display_name ||
                        'Company'
                    )}
                </p>

                <div class="job-time">
                    🕒 Posted
                    ${postedText}
                    at
                    ${postedTime}
                </div>

            </div>

            ${
                isNewToday
                ? `
                    <span class="new-badge">
                        NEW TODAY
                    </span>
                  `
                : ''
            }

        </div>

        <div class="salary-badge">
            ${salary}
        </div>

        <div class="job-meta">
            📍
            ${escapeHtml(
                job.location
                ?.display_name ||
                'Melbourne'
            )}
        </div>

        <div class="job-footer">

            <span class="job-source">
                ${source}
            </span>

            <a
                href="${job.redirect_url}"
                target="_blank"
                rel="noopener noreferrer"
                class="apply-btn"
            >
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

    return Math.floor(
        (
            new Date() -
            new Date(date)
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );
}

function getSourceName(
    url = ''
) {

    const lower =
        url.toLowerCase();

    if (
        lower.includes('seek')
    ) return 'Seek';

    if (
        lower.includes('linkedin')
    ) return 'LinkedIn';

    if (
        lower.includes('indeed')
    ) return 'Indeed';

    if (
        lower.includes('jora')
    ) return 'Jora';

    return 'Job Board';
}

function escapeHtml(
    text = ''
) {

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return String(text)
        .replace(
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

function showErrorState(
    message
) {

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

    if (
        errorMessage
    ) {
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
   LAST UPDATED
========================================== */

function updateTimestamp() {

    const time =
        new Date()
        .toLocaleTimeString(
            'en-AU',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    if (
        lastUpdated
    ) {
        lastUpdated.textContent =
            `Updated ${time}`;
    }
}
```
