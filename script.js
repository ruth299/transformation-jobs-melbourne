/* ====================================================
   TRANSFORMATION JOBS MELBOURNE - JAVASCRIPT (DEBUG VERSION)
   ==================================================== */

// API CONFIGURATION
const API_CONFIG = {
    appId: '45773940',
    apiKey: '19373b4fdefafdc7dbe4a625f0910e2d',
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/au/search'
};

console.log('Script loaded. API Config:', API_CONFIG);

// State
let allJobs = [];
let filteredJobs = [];
let activeFilters = {
    keyword: [],
    arrangement: [],
    employment: [],
    search: ''
};

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const filterChips = document.querySelectorAll('.filter-chip');
const clearFiltersBtn = document.getElementById('clearFilters');
const jobsContainer = document.getElementById('jobsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const noResultsState = document.getElementById('noResultsState');
const jobCount = document.getElementById('jobCount');
const retryButton = document.getElementById('retryButton');

console.log('DOM elements found:', { loadingState, errorState, jobsContainer });

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Starting fetch');
    fetchJobs();
    setupEventListeners();
});

// FETCH JOBS - WITH DETAILED LOGGING
async function fetchJobs() {
    console.log('=== FETCH JOBS STARTED ===');
    
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    jobsContainer.innerHTML = '';

    try {
        console.log('Building URL parameters...');
        
        const params = new URLSearchParams({
            app_id: API_CONFIG.appId,
            app_key: API_CONFIG.apiKey,
            what: 'transformation',
            where: 'Melbourne',
            results_per_page: 100
        });

        const url = `${API_CONFIG.baseUrl}?${params.toString()}`;
        console.log('Full URL:', url);

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            console.log('Request timeout after 20 seconds');
            controller.abort();
        }, 20000);

        console.log('Sending fetch request...');
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        console.log('Response received:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        console.log('Parsing JSON...');
        const data = await response.json();
        console.log('Data parsed successfully. Results count:', data.results?.length || 0);
        console.log('Full response:', data);

        if (!data.results || data.results.length === 0) {
            console.log('No results in response');
            loadingState.classList.add('hidden');
            noResultsState.classList.remove('hidden');
            jobCount.textContent = 'No jobs found';
            return;
        }

        console.log('Setting allJobs array with', data.results.length, 'jobs');
        allJobs = data.results;
        
        console.log('Filtering jobs...');
        filterJobs();
        
        console.log('Rendering jobs...');
        loadingState.classList.add('hidden');
        renderJobs();
        
        console.log('=== FETCH JOBS COMPLETED SUCCESSFULLY ===');

    } catch (error) {
        console.error('=== ERROR OCCURRED ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        loadingState.classList.add('hidden');
        
        let errorMsg = error.message;
        if (error.name === 'AbortError') {
            errorMsg = 'Request timeout after 20 seconds. API server is too slow.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Network error - could not reach Adzuna API';
        } else if (error.message.includes('401')) {
            errorMsg = 'API Key is invalid or expired';
        } else if (error.message.includes('403')) {
            errorMsg = 'API Key does not have permission';
        }
        
        console.error('Final error message:', errorMsg);
        
        errorMessage.textContent = errorMsg;
        errorState.classList.remove('hidden');
    }
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
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
            toggleFilter(type, value);
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
        retryButton.addEventListener('click', () => {
            console.log('Retry button clicked');
            fetchJobs();
        });
    }
}

// TOGGLE FILTER
function toggleFilter(type, value) {
    const arr = activeFilters[type];
    const idx = arr.indexOf(value);
    if (idx > -1) {
        arr.splice(idx, 1);
    } else {
        arr.push(value);
    }

    filterChips.forEach(chip => {
        if (chip.dataset.filterType === type && chip.dataset.filterValue === value) {
            chip.classList.toggle('active');
        }
    });

    filterJobs();
    renderJobs();
}

// FILTER JOBS
function filterJobs() {
    filteredJobs = allJobs.filter(job => {
        if (activeFilters.search) {
            const search = activeFilters.search;
            if (!(job.title.toLowerCase().includes(search) || job.company.display_name.toLowerCase().includes(search))) {
                return false;
            }
        }

        if (activeFilters.keyword.length > 0) {
            const text = (job.title + ' ' + (job.description || '')).toLowerCase();
            if (!activeFilters.keyword.some(k => text.includes(k.toLowerCase()))) {
                return false;
            }
        }

        if (activeFilters.arrangement.length > 0) {
            const desc = (job.description || '').toLowerCase();
            if (!activeFilters.arrangement.some(a => desc.includes(a.toLowerCase()))) {
                return false;
            }
        }

        if (activeFilters.employment.length > 0) {
            const desc = (job.description || '').toLowerCase();
            if (!activeFilters.employment.some(e => desc.includes(e.toLowerCase()))) {
                return false;
            }
        }

        return true;
    });
}

// RENDER JOBS
function renderJobs() {
    console.log('Rendering', filteredJobs.length, 'jobs');
    jobsContainer.innerHTML = '';

    if (filteredJobs.length === 0) {
        noResultsState.classList.remove('hidden');
        jobCount.textContent = 'No jobs found';
        return;
    }

    noResultsState.classList.add('hidden');
    jobCount.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`;

    filteredJobs.forEach(job => {
        const card = createJobCard(job);
        jobsContainer.appendChild(card);
    });
}

// CREATE JOB CARD
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

    const postedDate = new Date(job.created);
    const days = Math.floor((new Date() - postedDate) / (1000 * 60 * 60 * 24));
    const daysText = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;

    const desc = (job.description || '').toLowerCase();
    const tags = [];
    if (desc.includes('remote')) tags.push('remote');
    if (desc.includes('hybrid')) tags.push('hybrid');
    if (desc.includes('onsite') || desc.includes('on-site')) tags.push('onsite');

    card.innerHTML = `
        <div class="job-header">
            <h3 class="job-title">
                <a href="${job.redirect_url}" target="_blank">${escapeHtml(job.title)}</a>
            </h3>
            <p class="job-company">${escapeHtml(job.company.display_name)}</p>
        </div>
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="ti ti-map-pin"></i>
                <span class="job-meta-text">${escapeHtml(job.location.display_name)}</span>
            </div>
            ${job.salary_min ? `<div class="job-meta-item"><i class="ti ti-currency-dollar"></i><span class="salary">$${formatNum(job.salary_min)} - $${formatNum(job.salary_max)} AUD</span></div>` : ''}
            <div class="job-meta-item"><i class="ti ti-calendar"></i><span class="days-posted">${daysText}</span></div>
        </div>
        ${tags.length > 0 ? `<div class="job-tags">${tags.map(t => `<span class="tag ${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`).join('')}</div>` : ''}
        ${job.description ? `<div class="job-summary"><p class="summary-text">${escapeHtml(job.description.substring(0, 200))}...</p></div>` : ''}
        <div class="job-footer">
            <span class="job-source">Via <a href="${job.redirect_url}" target="_blank">Adzuna</a></span>
            <button class="btn-apply" onclick="window.open('${job.redirect_url}', '_blank')"><i class="ti ti-arrow-up-right"></i> View Job</button>
        </div>
    `;

    return card;
}

// UTILITIES
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNum(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n;
}
