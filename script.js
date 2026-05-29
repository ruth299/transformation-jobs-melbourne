
/* ==========================================
   TRANSFORMATION JOBS MELBOURNE - SCRIPT V2
   ========================================== */

console.log('Dashboard loaded');

// API CONFIG
const APP_ID = '45773940';
const API_KEY = '19373b4fdefafdc7dbe4a625f0910e2d';

// Multiple CORS proxy options for redundancy
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
];

// Try multiple API queries
const API_QUERIES = [
    `https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=200&what=business%20analyst&where=Melbourne&sort_by=date`,
    `https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=200&what=transformation&where=Melbourne&sort_by=date`,
    `https://api.adzuna.com/v1/api/jobs/au/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=200&what=program%20manager&where=Melbourne&sort_by=date`,
];

// STATE
let allJobs = [];
let filteredJobs = [];

// DOM ELEMENTS
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

// PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();

    // Search event listener
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Filter chip event listeners
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            applyFilters();
        });
    });

    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Retry button
    if (retryButton) {
        retryButton.addEventListener('click', fetchJobs);
    }
});

// FETCH JOBS FROM API
async function fetchJobs() {
    showLoadingState();

    try {
        console.log('Fetching jobs from Adzuna API...');
        
        let jobs = [];
        
        // Try each query with different proxies
        for (const query of API_QUERIES) {
            for (const proxy of CORS_PROXIES) {
                try {
                    const url = proxy + encodeURIComponent(query);
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            jobs = [...jobs, ...data.results];
                            console.log(`Fetched ${data.results.length} jobs from query`);
                            break; // Success, move to next query
                        }
                    }
                } catch (e) {
                    console.log(`Failed with proxy: ${proxy.split('/')[2]}`);
                    continue;
                }
            }
        }

        if (jobs.length === 0) {
            throw new Error('No jobs found from any API endpoint');
        }

        // Remove duplicates
        allJobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());
        filteredJobs = [...allJobs];

        console.log(`Total unique jobs: ${allJobs.length}`);

        // Update header stats
        if (totalJobs) {
            totalJobs.textContent = allJobs.length;
        }

        renderJobs(filteredJobs);
        updateTimestamp();
        hideErrorState();

    } catch (error) {
        console.error('Fetch error:', error);
        showErrorState('Unable to load jobs. The job API may be temporarily unavailable. Please try again in a few moments.');
    }
}

// APPLY FILTERS
function applyFilters() {
    const searchTerm = (searchInput?.value || '').toLowerCase();

    const activeFilters = Array.from(
        document.querySelectorAll('.filter-chip.active')
    ).map(btn => ({
        type: btn.dataset.filterType,
        value: btn.dataset.filterValue.toLowerCase()
    }));

    filteredJobs = allJobs.filter(job => {
        // Build searchable text from job fields
        const jobText = `
            ${job.title || ''} 
            ${job.description || ''} 
            ${job.company?.display_name || ''} 
            ${job.location?.display_name || ''}
        `.toLowerCase();

        // Check search term
        const matchesSearch = !searchTerm || jobText.includes(searchTerm);

        // Check active filters
        let matchesFilters = true;
        if (activeFilters.length > 0) {
            matchesFilters = activeFilters.some(filter => {
                switch(filter.type) {
                    case 'keyword':
                        return jobText.includes(filter.value) || 
                               (filter.value === 'transformation lead' && (jobText.includes('transformation') || jobText.includes('lead'))) ||
                               (filter.value === 'business analyst' && (jobText.includes('business') || jobText.includes('analyst') || jobText.includes('ba'))) ||
                               (filter.value === 'program manager' && (jobText.includes('program') || jobText.includes('manager'))) ||
                               (filter.value === 'change manager' && (jobText.includes('change') || jobText.includes('manager')));
                    case 'salary':
                        return job.salary_max >= parseInt(filter.value);
                    case 'location':
                        return jobText.includes(filter.value);
                    case 'arrangement':
                    case 'employment':
                        return jobText.includes(filter.value);
                    default:
                        return true;
                }
            });
        }

        return matchesSearch && matchesFilters;
    });

    renderJobs(filteredJobs);
}

// CLEAR ALL FILTERS
function clearFilters() {
    // Clear search
    if (searchInput) {
        searchInput.value = '';
    }

    // Clear active filter chips
    filterChips.forEach(chip => {
        chip.classList.remove('active');
    });

    // Reapply filters (show all)
    filteredJobs = [...allJobs];
    renderJobs(filteredJobs);
}

// RENDER JOBS
function renderJobs(jobs) {
    jobsContainer.innerHTML = '';
    hideErrorState();
    hideLoadingState();

    if (!jobs.length) {
        showNoResultsState();
        if (jobCount) jobCount.textContent = '0 results';
        return;
    }

    if (jobCount) {
        const count = jobs.length;
        jobCount.textContent = `${count} ${count === 1 ? 'job' : 'jobs'} found`;
    }

    jobs.forEach((job, index) => {
        const card = createJobCard(job);
        card.style.animation = `fadeIn ${200 + (index * 30)}ms ease-out forwards`;
        card.style.opacity = '0';
        jobsContainer.appendChild(card);
    });
}

// CREATE JOB CARD ELEMENT
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

    // Calculate posted days
    const postedDate = new Date(job.created);
    const diffDays = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
    const postedText = diffDays === 0 
        ? 'Today' 
        : diffDays === 1 
        ? 'Yesterday' 
        : `${diffDays}d ago`;

    // Check if NEW (posted today)
    const isNew = diffDays === 0;
    const newBadge = isNew ? '<span class="badge-new">NEW</span>' : '';

    // Format salary
    const salary = job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}K - $${Math.round(job.salary_max / 1000)}K`
        : 'Not listed';

    // Get source
    const source = getSourceName(job.redirect_url);

    card.innerHTML = `
        <div class="job-card-left">
            <h3 class="job-title">${escapeHtml(job.title)} ${newBadge}</h3>
            <p class="job-company">${escapeHtml(job.company?.display_name || 'Company')}</p>
        </div>
        <div class="salary-badge">${salary}</div>
        <div class="job-meta">
            <span class="job-meta-item">
                <i class="ti ti-map-pin"></i>
                <span>${escapeHtml(job.location?.display_name || 'Melbourne')}</span>
            </span>
        </div>
        <div class="posted-badge">${postedText}</div>
        <div class="job-source">${source}</div>
        <a href="${job.redirect_url}" target="_blank" rel="noopener noreferrer" class="apply-btn">
            <i class="ti ti-external-link"></i>
            View
        </a>
    `;

    return card;
}

// GET SOURCE NAME
function getSourceName(url) {
    if (!url) return 'Job Board';

    const u = url.toLowerCase();

    if (u.includes('seek')) return 'Seek';
    if (u.includes('linkedin')) return 'LinkedIn';
    if (u.includes('indeed')) return 'Indeed';
    if (u.includes('jora')) return 'Jora';
    if (u.includes('adzuna')) return 'Adzuna';
    if (u.includes('agencies')) return 'Agencies';

    return 'Job Board';
}

// ESCAPE HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// STATE MANAGEMENT
function showLoadingState() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    jobsContainer.innerHTML = '';
}

function hideLoadingState() {
    loadingState.classList.add('hidden');
}

function showErrorState(message) {
    errorState.classList.remove('hidden');
    loadingState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    jobsContainer.innerHTML = '';

    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message || 'Please check your connection and try again.';
    }
}

function hideErrorState() {
    errorState.classList.add('hidden');
}

function showNoResultsState() {
    noResultsState.classList.remove('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
}

// UPDATE TIMESTAMP
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = `Updated at ${timeString}`;
    }

    const footerTime = document.getElementById('footerTime');
    if (footerTime) {
        footerTime.textContent = timeString;
    }
}
