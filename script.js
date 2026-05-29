```javascript
/* ==========================================
   TRANSFORMATION JOBS MELBOURNE - SCRIPT V3
   Fixed Loading + Dashboard + Filters
========================================== */

console.log('SCRIPT IS RUNNING');

/* ==========================================
   CONFIG
========================================== */

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

/* ==========================================
   STATE
========================================== */

let allJobs = [];
let filteredJobs = [];

/* ==========================================
   DOM ELEMENTS
========================================== */

const jobsContainer =
    document.getElementById(
        'jobsContainer'
    );

const searchInput =
    document.getElementById(
        'searchInput'
    );

const jobCount =
    document.getElementById(
        'jobCount'
    );

const totalJobs =
    document.getElementById(
        'totalJobs'
    );

const newJobsToday =
    document.getElementById(
        'newJobsToday'
    );

const avgSalary =
    document.getElementById(
        'avgSalary'
    );

const lastUpdated =
    document.getElementById(
        'lastUpdated'
    );

const retryButton =
    document.getElementById(
        'retryButton'
    );

const loadingState =
    document.getElementById(
        'loadingState'
    );

const errorState =
    document.getElementById(
        'errorState'
    );

const noResultsState =
    document.getElementById(
        'noResultsState'
    );

/* ==========================================
   INIT
========================================== */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        console.log(
            'Page loaded'
        );

        fetchJobs();

        searchInput?.addEventListener(
            'input',
            applyFilters
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

        const allResults = [];

        for (
            const term of SEARCH_TERMS
        ) {

            const apiUrl =
                `https://api.adzuna.com/v1/api/jobs/au/search/1` +
                `?app_id=${APP_ID}` +
                `&app_key=${API_KEY}` +
                `&results_per_page=30` +
                `&what=${encodeURIComponent(term)}` +
                `&where=Melbourne` +
                `&sort_by=date`;

            // Better CORS proxy
            const proxyUrl =
                `https://api.allorigins.win/raw?url=` +
                encodeURIComponent(
                    apiUrl
                );

            console.log(
                'Loading:',
                term
            );

            try {

                const response =
                    await fetch(
                        proxyUrl
                    );

                if (
                    !response.ok
                ) {

                    console.warn(
                        `Failed: ${term}`
                    );

                    continue;
                }

                const data =
                    await response.json();

                const jobs =
                    data.results || [];

                console.log(
                    `${term}:`,
                    jobs.length
                );

                allResults.push(
                    ...jobs
                );

            } catch (err) {

                console.warn(
                    `Error: ${term}`,
                    err
                );
            }
        }

        // remove duplicates
        const jobsMap =
            new Map();

        allResults.forEach(
            job => {

                if (
                    job.id
                ) {

                    jobsMap.set(
                        job.id,
                        job
                    );
                }
            }
        );

        allJobs =
            Array.from(
                jobsMap.values()
            );

        // newest first
        allJobs.sort(
            (a, b) =>
                new Date(
                    b.created
                ) -
                new Date(
                    a.created
                )
        );

        filteredJobs =
            [...allJobs];

        console.log(
            'TOTAL JOBS:',
            allJobs.length
        );

        updateDashboardStats();

        renderJobs(
            filteredJobs
        );

        updateTimestamp();

        hideLoadingState();

    } catch (error) {

        console.error(
            'BIG ERROR:',
            error
        );

        showErrorState(
            'Unable to load jobs. Please try again.'
        );
    }
}

/* ==========================================
   FILTERS
========================================== */

function applyFilters() {

    const searchTerm =
        (
            searchInput?.value ||
            ''
        ).toLowerCase();

    filteredJobs =
        allJobs.filter(
            job => {

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
            }
        );

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
        allJobs.filter(
            job =>
                getPostedDays(
                    job.created
                ) === 0
        );

    newJobsToday &&
        (
            newJobsToday.textContent =
            todayJobs.length
        );

    const salaries =
        allJobs
            .filter(
                j =>
                    j.salary_max
            )
            .map(
                j =>
                    j.salary_max
            );

    const average =
        salaries.length
            ? salaries.reduce(
                  (
                      a,
                      b
                  ) =>
                      a + b,
                  0
              ) /
              salaries.length
            : 0;

    avgSalary &&
        (
            avgSalary.textContent =
            average
                ? `$${Math.round(
                    average /
                    1000
                  )}K`
                : 'N/A'
        );
}

/* ==========================================
   RENDER JOBS
========================================== */

function renderJobs(
    jobs
) {

    jobsContainer.innerHTML =
        '';

    hideErrorState();

    if (
        !jobs.length
    ) {

        showNoResultsState();

        jobCount &&
            (
                jobCount.textContent =
                '0 jobs found'
            );

        return;
    }

    noResultsState?.classList.add(
        'hidden'
    );

    jobCount &&
        (
            jobCount.textContent =
            `${jobs.length} jobs found`
        );

    jobs.forEach(
        (
            job,
            index
        ) => {

            const card =
                createJobCard(
                    job
                );

            card.style.animation =
                `fadeIn ${
                    120 +
                    index *
                    20
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

function createJobCard(
    job
) {

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
                month:
                    'short'
            }
        );

    const postedTime =
        postedDate.toLocaleTimeString(
            'en-AU',
            {
                hour:
                    '2-digit',
                minute:
                    '2-digit'
            }
        );

    const salary =
        job.salary_min &&
        job.salary_max
            ? `$${Math.round(
                job.salary_min /
                1000
              )}K - $${Math.round(
                job.salary_max /
                1000
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

function getPostedDays(
    date
) {

    return Math.floor(
        (
            new Date() -
            new Date(
                date
            )
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
        lower.includes(
            'seek'
        )
    )
        return 'Seek';

    if (
        lower.includes(
            'linkedin'
        )
    )
        return 'LinkedIn';

    if (
        lower.includes(
            'indeed'
        )
    )
        return 'Indeed';

    if (
        lower.includes(
            'jora'
        )
    )
        return 'Jora';

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

    return String(
        text
    ).replace(
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

/* ==========================================
   TIMESTAMP
========================================== */

function updateTimestamp() {

    const time =
        new Date()
        .toLocaleTimeString(
            'en-AU',
            {
                hour:
                    '2-digit',
                minute:
                    '2-digit'
            }
        );

    if (
        lastUpdated
    ) {

        lastUpdated.textContent =
            time;
    }
}
```
