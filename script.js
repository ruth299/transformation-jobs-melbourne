// TRANSFORMATION JOBS MELBOURNE - LIVE VERSION

console.log('Script loaded');

const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

// IMPORTANT: page number "1" added after /search/
const API_URL =
`https://corsproxy.io/?https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=50&what=transformation OR "program manager" OR "business analyst" OR "delivery lead" OR PMO OR "change manager" OR Workday&where=Melbourne&content-type=application/json`;

let allJobs = [];
let filteredJobs = [];

const jobsContainer = document.getElementById('jobsContainer');
const jobCount = document.getElementById('jobCount');
const searchInput = document.getElementById('searchInput');

document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            filteredJobs = allJobs.filter(job =>
                job.title?.toLowerCase().includes(searchTerm) ||
                job.company?.display_name?.toLowerCase().includes(searchTerm) ||
                job.description?.toLowerCase().includes(searchTerm)
            );

            renderJobs(filteredJobs);
        });
    }
});

async function fetchJobs() {
    jobsContainer.innerHTML = `
        <div style="text-align:center;padding:50px;">
            <h3>Loading Melbourne transformation jobs...</h3>
        </div>
    `;

    try {
        console.log('Fetching jobs...');

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API failed: ${response.status}`);
        }

        const data = await response.json();

        console.log('Jobs returned:', data.results?.length);

        allJobs = data.results || [];
        filteredJobs = [...allJobs];

        renderJobs(filteredJobs);

    } catch (error) {
        console.error(error);

        jobsContainer.innerHTML = `
            <div style="text-align:center;padding:50px;color:#ffd700;">
                <h3>Unable to fetch jobs</h3>
                <p>${error.message}</p>
                <button onclick="fetchJobs()" 
                    style="
                        background:#ffd700;
                        color:black;
                        border:none;
                        padding:12px 20px;
                        border-radius:8px;
                        cursor:pointer;
                        margin-top:10px;
                    ">
                    Retry
                </button>
            </div>
        `;
    }
}

function renderJobs(jobs) {
    jobsContainer.innerHTML = '';

    if (!jobs.length) {
        jobsContainer.innerHTML = `
            <div style="text-align:center;padding:50px;">
                No jobs found.
            </div>
        `;

        if (jobCount) {
            jobCount.textContent = '0';
        }

        return;
    }

    if (jobCount) {
        jobCount.textContent = jobs.length;
    }

    jobs.forEach(job => {

        const postedDate = new Date(job.created);
        const today = new Date();

        const diffTime = today - postedDate;
        const diffDays = Math.floor(
            diffTime / (1000 * 60 * 60 * 24)
        );

        const postedText =
            diffDays === 0
                ? 'Today'
                : diffDays === 1
                ? '1 day ago'
                : `${diffDays} days ago`;

        const salary =
            job.salary_min && job.salary_max
                ? `$${Math.round(job.salary_min / 1000)}K - $${Math.round(job.salary_max / 1000)}K`
                : 'Salary not listed';

        const card = document.createElement('div');
        card.className = 'job-card';

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
                <span>📍 ${job.location?.display_name || 'Melbourne'}</span>
                <span>🕒 ${postedText}</span>
            </div>

            <p class="job-description">
                ${job.description
                    ? job.description.substring(0, 220) + '...'
                    : 'No description available'}
            </p>

            <div class="job-footer">
               <span>
    Source: ${
        job.company?.display_name
        || 'Adzuna'
    }
</span>

                <a href="${job.redirect_url}" 
                   target="_blank">

                    <button class="apply-btn">
                        Apply
                    </button>
                </a>
            </div>
        `;

        jobsContainer.appendChild(card);
    });
}
