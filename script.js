/* ==========================================
   TRANSFORMATION JOBS MELBOURNE - FIXED
   ========================================== */

console.log('App loaded');

// API CONFIG
const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

// FIXED URL FOR GITHUB PAGES
const API_URL =
`https://corsproxy.io/?https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=100&what=technology&where=Melbourne&sort_by=date&content-type=application/json`;


// STATE
let allJobs = [];
let filteredJobs = [];


// DOM
const jobsContainer =
    document.getElementById(
        'jobsContainer'
    );

const searchInput =
    document.getElementById(
        'searchInput'
    );

const filterChips =
    document.querySelectorAll(
        '.filter-chip'
    );

const jobCount =
    document.getElementById(
        'jobCount'
    );


// PAGE LOAD
document.addEventListener(
    'DOMContentLoaded',
    () => {

        fetchJobs();

        // SEARCH
        if (searchInput) {

            searchInput.addEventListener(
                'input',
                applyFilters
            );
        }

        // FILTER CHIPS
        filterChips.forEach(
            chip => {

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
    }
);


// FETCH JOBS
async function fetchJobs() {

    jobsContainer.innerHTML = `
        <div style="
            text-align:center;
            padding:50px;
        ">
            <h3>
                Loading Melbourne jobs...
            </h3>
        </div>
    `;

    try {

        console.log(
            'Fetching jobs'
        );

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                `API Error ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            data
        );

        allJobs =
            data.results || [];

        filteredJobs =
            [...allJobs];

        renderJobs(
            filteredJobs
        );

    } catch (error) {

        console.error(
            error
        );

        jobsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:50px;
                color:red;
            ">
                <h3>
                    Unable to load jobs
                </h3>

                <p>
                    ${error.message}
                </p>
            </div>
        `;
    }
}


// FILTERING
function applyFilters() {

    const searchTerm =
        searchInput?.value
        ?.toLowerCase()
        || '';

    const activeFilters =
        Array.from(
            document.querySelectorAll(
                '.filter-chip.active'
            )
        )
        .map(btn =>
            btn.dataset.filter
            ?.toLowerCase()
        );

    filteredJobs =
        allJobs.filter(job => {

            const text = `
                ${job.title || ''}
                ${job.description || ''}
                ${job.company?.display_name || ''}
            `.toLowerCase();

            const matchesSearch =
                !searchTerm ||
                text.includes(
                    searchTerm
                );

            const matchesFilter =
                activeFilters.length === 0 ||

                activeFilters.some(
                    filter =>
                    text.includes(
                        filter
                    )
                );

            return (
                matchesSearch &&
                matchesFilter
            );
        });

    renderJobs(
        filteredJobs
    );
}


// RENDER JOBS
function renderJobs(jobs) {

    jobsContainer.innerHTML =
        '';

    if (!jobs.length) {

        jobsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:50px;
            ">
                No jobs found
            </div>
        `;

        if (jobCount) {
            jobCount.textContent = 0;
        }

        return;
    }

    if (jobCount) {
        jobCount.textContent =
            jobs.length;
    }

    jobs.forEach(job => {

        const postedDate =
            new Date(
                job.created
            );

        const diffDays =
            Math.floor(
                (
                    new Date()
                    - postedDate
                )
                /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

        const postedText =
            diffDays === 0
            ? 'Today'
            : diffDays === 1
            ? 'Yesterday'
            : `${diffDays}
               days ago`;

        const salary =
            job.salary_min &&
            job.salary_max

            ? `$${Math.round(
                job.salary_min
                / 1000
            )}K - $${Math.round(
                job.salary_max
                / 1000
            )}K`

            : 'Salary not listed';

        const card =
            document.createElement(
                'div'
            );

        card.className =
            'job-card';

        card.innerHTML = `
            <div class="job-card-header">

                <div>

                    <h3 class="job-title">
                        ${job.title}
                    </h3>

                    <p class="job-company">
                        ${job.company?.display_name || 'Company'}
                    </p>

                </div>

                <div class="job-salary">
                    ${salary}
                </div>

            </div>

            <div class="job-info">

                <span>
                    📍
                    ${job.location?.display_name || 'Melbourne'}
                </span>

                <span>
                    🕒
                    ${postedText}
                </span>

            </div>

            <p class="job-description">
                ${
                    job.description
                    ? job.description.substring(
                        0,
                        220
                    ) + '...'
                    : 'No description'
                }
            </p>

            <div class="job-footer">

                <span>
                    Source:
                    ${getSourceName(
                        job.redirect_url
                    )}
                </span>

                <a
                    href="${
                        job.redirect_url
                    }"
                    target="_blank"
                >
                    <button class="apply-btn">
                        View Job
                    </button>
                </a>

            </div>
        `;

        jobsContainer
        .appendChild(card);
    });
}


// SOURCE DETECTION
function getSourceName(
    url
) {

    if (!url)
        return 'Job Board';

    const u =
        url.toLowerCase();

    if (
        u.includes(
            'seek'
        )
    ) return 'Seek';

    if (
        u.includes(
            'linkedin'
        )
    ) return 'LinkedIn';

    if (
        u.includes(
            'indeed'
        )
    ) return 'Indeed';

    if (
        u.includes(
            'jora'
        )
    ) return 'Jora';

    return 'Job Board';
}
