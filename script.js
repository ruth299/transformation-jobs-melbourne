// TRANSFORMATION JOBS MELBOURNE - WORKING VERSION

console.log('Script loaded');

const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

const API_URL =
`https://corsproxy.io/?https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=50&what=ERP OR Transformation OR "Program Manager" OR "Senior Business Analyst" OR "Delivery Lead" OR PMO OR Workday OR SAP OR Oracle OR "Technology Transformation" OR "Project Manager" OR "Business Transformation"&where=Melbourne&content-type=application/json`;

let allJobs = [];
let filteredJobs = [];

const jobsContainer =
    document.getElementById('jobsContainer');

const jobCount =
    document.getElementById('jobCount');

const searchInput =
    document.getElementById('searchInput');

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
    }
);

async function fetchJobs() {

    jobsContainer.innerHTML = `
        <div style="
            text-align:center;
            padding:50px;
            color:#ffd700;
        ">
            <h3>
                Loading Melbourne jobs...
            </h3>
        </div>
    `;

    try {

        console.log('Fetching jobs');

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
            'Jobs found:',
            data.results?.length
        );

        allJobs =
            data.results || [];

        filteredJobs =
            [...allJobs];

        renderJobs(filteredJobs);

    } catch (error) {

        console.error(error);

        jobsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:50px;
                color:#ffd700;
            ">
                <h3>
                    Unable to fetch jobs
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="fetchJobs()"
                    style="
                        background:#ffd700;
                        color:black;
                        border:none;
                        padding:12px 20px;
                        border-radius:8px;
                        cursor:pointer;
                        margin-top:10px;
                    "
                >
                    Retry
                </button>
            </div>
        `;
    }
}

function applyFilters() {

    const searchTerm =
        searchInput?.value
            .toLowerCase() || '';

    filteredJobs =
        allJobs.filter(job => {

            const title =
                job.title
                    ?.toLowerCase() || '';

            const company =
                job.company
                    ?.display_name
                    ?.toLowerCase() || '';

            const description =
                job.description
                    ?.toLowerCase() || '';

            return (
                title.includes(searchTerm) ||
                company.includes(searchTerm) ||
                description.includes(searchTerm)
            );
        });

    renderJobs(filteredJobs);
}

function renderJobs(jobs) {

    jobsContainer.innerHTML = '';

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
            jobCount.textContent = '0';
        }

        return;
    }

    if (jobCount) {
        jobCount.textContent =
            jobs.length;
    }

    jobs.forEach(job => {

        const postedDate =
            new Date(job.created);

        const today =
            new Date();

        const diffDays =
            Math.floor(
                (today - postedDate)
                / (1000 * 60 * 60 * 24)
            );

        const postedText =
            diffDays === 0
                ? 'Today'
                : diffDays === 1
                ? '1 day ago'
                : `${diffDays} days ago`;

        const salary =
            job.salary_min &&
            job.salary_max
                ? `$${Math.round(job.salary_min / 1000)}K - $${Math.round(job.salary_max / 1000)}K`
                : 'Salary not listed';

        const card =
            document.createElement('div');

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
                    ? job.description.substring(0, 220) + '...'
                    : 'No description available'
                }
            </p>

            <div class="job-footer">

                <span>
                    Source:
                    ${job.company?.display_name || 'Adzuna'}
                </span>

                <a
                    href="${job.redirect_url}"
                    target="_blank"
                >
                    <button class="apply-btn">
                        View Job
                    </button>
                </a>

            </div>
        `;

        jobsContainer.appendChild(card);
    });
}
