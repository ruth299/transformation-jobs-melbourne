// TRANSFORMATION JOBS MELBOURNE DASHBOARD

console.log('Dashboard loaded');

// API CONFIG
const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

const API_URL =
`https://corsproxy.io/?https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=50&what=ERP OR Transformation OR "Program Manager" OR "Senior Business Analyst" OR "Delivery Lead" OR PMO OR Workday OR SAP OR Oracle OR "Technology Transformation" OR "Project Manager" OR "Business Transformation"&where=Melbourne&content-type=application/json`;


// DATA
let allJobs = [];
let filteredJobs = [];


// DOM ELEMENTS
const jobsContainer =
    document.getElementById(
        'jobsContainer'
    );

const jobCount =
    document.getElementById(
        'jobCount'
    );

const newJobsCount =
    document.getElementById(
        'newJobsCount'
    );

const avgSalary =
    document.getElementById(
        'avgSalary'
    );

const searchInput =
    document.getElementById(
        'searchInput'
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

        // FILTER BUTTONS
        document
        .querySelectorAll(
            '.filter-chip'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    button.classList.toggle(
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
            color:#38bdf8;
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
                `API Error:
                ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            'Jobs found:',
            data.results?.length
        );

        allJobs =
            data.results || [];

        filteredJobs =
            [...allJobs];

        renderJobs(
            filteredJobs
        );

        updateDashboardStats();

    } catch (error) {

        console.error(error);

        jobsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:50px;
                color:#ef4444;
            ">
                <h3>
                    Unable to load jobs
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="fetchJobs()"
                    style="
                        background:#38bdf8;
                        border:none;
                        padding:12px 20px;
                        border-radius:10px;
                        cursor:pointer;
                        margin-top:12px;
                    "
                >
                    Retry
                </button>
            </div>
        `;
    }
}


// FILTERING
function applyFilters() {

    const searchTerm =
        searchInput?.value
            .toLowerCase()
            || '';

    const activeFilters =
        Array.from(
            document.querySelectorAll(
                '.filter-chip.active'
            )
        ).map(btn =>
            btn.dataset.filter
        );

    filteredJobs =
        allJobs.filter(job => {

            const text = `
                ${job.title}
                ${job.description}
                ${job.company?.display_name}
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

    updateDashboardStats();
}


// DASHBOARD STATS
function updateDashboardStats() {

    // TOTAL JOBS
    if (jobCount) {

        jobCount.textContent =
            filteredJobs.length;
    }

    // NEW TODAY
    const newJobs =
        filteredJobs.filter(
            job => {

            const posted =
                new Date(
                    job.created
                );

            const diffDays =
                Math.floor(
                    (
                        new Date()
                        - posted
                    )
                    /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

            return diffDays <= 1;
        });

    if (newJobsCount) {

        newJobsCount.textContent =
            newJobs.length;
    }

    // AVG SALARY
    const salaries =
        filteredJobs
        .filter(job =>
            job.salary_min
        )
        .map(job =>
            job.salary_min
        );

    if (
        salaries.length > 0
    ) {

        const avg =
            salaries.reduce(
                (a, b) => a + b,
                0
            ) / salaries.length;

        avgSalary.textContent =
            `$${Math.round(
                avg / 1000
            )}K`;

    } else {

        avgSalary.textContent =
            'N/A';
    }
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

        return;
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
            ? '1 day ago'
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
            <div class="
                job-card-header
            ">

                <div>

                    <h3 class="
                        job-title
                    ">
                        ${job.title}
                    </h3>

                    <p class="
                        job-company
                    ">
                        ${job.company
                        ?.display_name
                        || 'Company'}
                    </p>

                </div>

                <div class="
                    job-salary
                ">
                    ${salary}
                </div>

            </div>

            <div class="
                job-info
            ">

                <span>
                    📍
                    ${job.location
                    ?.display_name
                    || 'Melbourne'}
                </span>

                <span>
                    🕒
                    ${postedText}
                </span>

            </div>

            <p class="
                job-description
            ">
                ${
                    job.description
                    ? job.description
                    .substring(
                        0,
                        220
                    )
                    + '...'
                    : 'No description'
                }
            </p>

            <div class="
                job-footer
            ">

                <span>
                    Source:
                    ${job.company
                    ?.display_name
                    || 'Adzuna'}
                </span>

                <a
                    href="${
                        job.redirect_url
                    }"
                    target="_blank"
                >
                    <button class="
                        apply-btn
                    ">
                        View Job
                    </button>
                </a>

            </div>
        `;

        jobsContainer
        .appendChild(card);
    });
}
