// TRANSFORMATION JOBS MELBOURNE - FINAL VERSION
console.log('Script loaded!');

const API_CONFIG = {
    appId: '45773940',
    apiKey: '19373b4fdefafdc7dbe4a625f0910e2d',
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/au/search'
};

let allJobs = [];
let filteredJobs = [];
let activeFilters = { keyword: [], arrangement: [], employment: [], search: '' };

// DOM
const jobsContainer = document.getElementById('jobsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const jobCount = document.getElementById('jobCount');
const searchInput = document.getElementById('searchInput');
const filterChips = document.querySelectorAll('.filter-chip');
const clearFiltersBtn = document.getElementById('clearFilters');
const retryButton = document.getElementById('retryButton');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - fetching jobs');
    fetchJobs();
    setupListeners();
});

async function fetchJobs() {
    console.log('FETCH START');
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    jobsContainer.innerHTML = '';

    try {
        // Simple query - just search for "transformation"
        const url = `https://api.adzuna.com/v1/api/jobs/au/search?app_id=45773940&app_key=19373b4fdefafdc7dbe4a625f0910e2d&what=transformation&where=Melbourne&results_per_page=100`;
        
        console.log('Fetching from Adzuna API...');
        
        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`API Error ${response.status}`);
        }

        const data = await response.json();
        console.log('Jobs found:', data.results?.length || 0);

        if (!data.results || data.results.length === 0) {
            loadingState.classList.add('hidden');
            jobCount.textContent = 'No jobs found';
            return;
        }

        allJobs = data.results;
        filterJobs();
        loadingState.classList.add('hidden');
        renderJobs();
        console.log('SUCCESS - Jobs displayed');

    } catch (error) {
        console.error('ERROR:', error.message);
        loadingState.classList.add('hidden');
        errorMessage.textContent = 'Error: ' + error.message;
        errorState.classList.remove('hidden');
    }
}

function setupListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value.toLowerCase();
            filterJobs();
            renderJobs();
        });
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const type = this.dataset.filterType;
            const value = this.dataset.filterValue;
            const arr = activeFilters[type];
            const idx = arr.indexOf(value);
            if (idx > -1) arr.splice(idx, 1);
            else arr.push(value);
            this.classList.toggle('active');
            filterJobs();
            renderJobs();
        });
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            activeFilters = { keyword: [], arrangement: [], employment: [], search: '' };
            if (searchInput) searchInput.value = '';
            filterChips.forEach(c => c.classList.remove('active'));
            filterJobs();
            renderJobs();
        });
    }

    if (retryButton) {
        retryButton.addEventListener('click', fetchJobs);
    }
}

function filterJobs() {
    filteredJobs = allJobs.filter(job => {
        if (activeFilters.search) {
            const s = activeFilters.search;
            if (!(job.title.toLowerCase().includes(s) || job.company.display_name.toLowerCase().includes(s))) {
                return false;
            }
        }
        return true;
    });
}

function renderJobs() {
    jobsContainer.innerHTML = '';

    if (filteredJobs.length === 0) {
        jobCount.textContent = 'No jobs found';
        return;
    }

    jobCount.textContent = `${filteredJobs.length} jobs found`;

    filteredJobs.forEach(job => {
        const days = Math.floor((new Date() - new Date(job.created)) / (1000 * 60 * 60 * 24));
        const daysText = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;

        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div class="job-header">
                <h3 class="job-title"><a href="${job.redirect_url}" target="_blank">${job.title}</a></h3>
                <p class="job-company">${job.company.display_name}</p>
            </div>
            <div class="job-meta">
                <div class="job-meta-item">
                    <i class="ti ti-map-pin"></i>
                    <span class="job-meta-text">${job.location.display_name}</span>
                </div>
                ${job.salary_min ? `<div class="job-meta-item"><i class="ti ti-currency-dollar"></i><span class="salary">$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} AUD</span></div>` : ''}
                <div class="job-meta-item">
                    <i class="ti ti-calendar"></i>
                    <span class="days-posted">${daysText}</span>
                </div>
            </div>
            ${job.description ? `<div class="job-summary"><p class="summary-text">${job.description.substring(0, 200)}...</p></div>` : ''}
            <div class="job-footer">
                <span class="job-source">Via Adzuna</span>
                <button class="btn-apply" onclick="window.open('${job.redirect_url}', '_blank')"><i class="ti ti-arrow-up-right"></i> View Job</button>
            </div>
        `;
        jobsContainer.appendChild(card);
    });
}
