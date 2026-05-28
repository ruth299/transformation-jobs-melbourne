/* ====================================================
   TRANSFORMATION JOBS MELBOURNE - JAVASCRIPT (FIXED)
   Handles API calls, filtering, and UI rendering
   ==================================================== */

// ---- API CONFIGURATION ----
const API_CONFIG = {
    appId: '45773940',
    apiKey: '19373b4fdefafdc7dbe4a625f0910e2d',
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/au/search'
};

// ---- TARGET JOB KEYWORDS ----
const TARGET_KEYWORDS = [
    'Transformation Lead',
    'Business Transformation',
    'Program Manager',
    'Senior Business Analyst',
    'Delivery Lead',
    'PMO',
    'Change Manager',
    'Workday Transformation',
    'Business Improvement',
    'Operating Model'
];

// ---- STATE MANAGEMENT ----
let allJobs = [];
let filteredJobs = [];
let activeFilters = {
    keyword: [],
    arrangement: [],
    employment: [],
    salary: [],
    location: [],
    search: ''
};

// ---- DOM ELEMENTS ----
const searchInput = document.getElementById('searchInput');
const filterChips = document.querySelectorAll('.filter-chip');
const clearFiltersBtn = document.getElementById('clearFilters');
const jobsContainer = document.getElementById('jobsContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const noResultsState = document.getElementById('noResultsState');
const jobCount = document.getElementById('jobCount');
const lastUpdated = document.getElementById('lastUpdated');
const retryButton = document.getElementById('retryButton');
const footerTime = document.getElementById('footerTime');

// ---- INITIALIZATION ----
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - Starting fetch');
    fetchJobs();
    setupEventListeners();
    updateTimestamp();
});

// ---- FETCH JOBS FROM ADZUNA API ----
async function fetchJobs() {
    showLoading();
    
    try {
        // Build the URL with proper parameters
        const params = new URLSearchParams({
            app_id: API_CONFIG.appId,
            app_key: API_CONFIG.apiKey,
            what: 'transformation',
            where: 'Melbourne',
            results_per_page: 100,
            sort_by: 'date',
            sort_direction: 'descending'
        });
        
        const url = `${API_CONFIG.baseUrl}?${params.toString()}`;
        console.log('API URL:', url);
        
        // Make the fetch request
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        console.log('Data received:', data);
        
        // Check if results exist
        if (!data || !data.results) {
            console.log('No results in response');
            allJobs = [];
            hideLoading();
            showNoResults();
            jobCount.textContent = 'No jobs found';
            return;
        }
        
        // Check if results array is empty
        if (data.results.length === 0) {
            console.log('Results array is empty');
            allJobs = [];
            hideLoading();
            showNoResults();
            jobCount.textContent = 'No jobs found';
            return;
        }
        
        // Success - store jobs
        console.log(`Successfully received ${data.results.length} jobs`);
        allJobs = data.results;
        
        // Filter and render
        filterJobs();
        hideLoading();
        renderJobs();
        
    } catch (error) {
        console.error('Fetch error:', error);
        hideLoading();
        
        let errorMsg = error.message;
        if (error.name === 'AbortError') {
            errorMsg = 'Request timeout. API server is slow.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Network error. Check internet connection.';
        }
        
        errorMessage.textContent = errorMsg;
        errorState.classList.remove('hidden');
    }
}

// ---- SET UP EVENT LISTENERS ----
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            activeFilters.search = e.target.value.toLowerCase();
            filterJobs();
            renderJobs();
        });
    }
    
    // Filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const filterType = this.dataset.filterType;
            const filterValue = this.dataset.filterValue;
            toggleFilter(filterType, filterValue);
        });
    });
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            activeFilters = {
                keyword: [],
                arrangement: [],
                employment: [],
                salary: [],
                location: [],
                search: ''
            };
            
            searchInput.value = '';
            
            filterChips.forEach(chip => {
                chip.classList.remove('active');
            });
            
            filterJobs();
            renderJobs();
        });
    }
    
    // Retry button
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            fetchJobs();
        });
    }
}

// ---- TOGGLE FILTER ----
function toggleFilter(filterType, filterValue) {
    const filterArray = activeFilters[filterType];
    const index = filterArray.indexOf(filterValue);
    
    if (index > -1) {
        filterArray.splice(index, 1);
    } else {
        filterArray.push(filterValue);
    }
    
    updateChipUI(filterType, filterValue);
    filterJobs();
    renderJobs();
}

// ---- UPDATE CHIP UI ----
function updateChipUI(filterType, filterValue) {
    filterChips.forEach(chip => {
        if (chip.dataset.filterType === filterType && chip.dataset.filterValue === filterValue) {
            chip.classList.toggle('active');
        }
    });
}

// ---- FILTER JOBS ----
function filterJobs() {
    filteredJobs = allJobs.filter(job => {
        // Search filter
        if (activeFilters.search) {
            const searchTerm = activeFilters.search;
            const titleMatch = (job.title || '').toLowerCase().includes(searchTerm);
            const companyMatch = (job.company.display_name || '').toLowerCase().includes(searchTerm);
            
            if (!titleMatch && !companyMatch) {
                return false;
            }
        }
        
        // Keyword filter
        if (activeFilters.keyword.length > 0) {
            const jobTitle = (job.title || '').toLowerCase();
            const jobDesc = (job.description || '').toLowerCase();
            const jobText = jobTitle + ' ' + jobDesc;
            
            const keywordMatch = activeFilters.keyword.some(keyword => 
                jobText.includes(keyword.toLowerCase())
            );
            
            if (!keywordMatch) {
                return false;
            }
        }
        
        // Work arrangement filter
        if (activeFilters.arrangement.length > 0) {
            const jobDesc = (job.description || '').toLowerCase();
            const arrangementMatch = activeFilters.arrangement.some(arrangement => 
                jobDesc.includes(arrangement.toLowerCase())
            );
            
            if (!arrangementMatch) {
                return false;
            }
        }
        
        // Employment type filter
        if (activeFilters.employment.length > 0) {
            const jobDesc = (job.description || '').toLowerCase();
            const employmentMatch = activeFilters.employment.some(employment => 
                jobDesc.includes(employment.toLowerCase())
            );
            
            if (!employmentMatch) {
                return false;
            }
        }
        
        // Salary filter
        if (activeFilters.salary.length > 0) {
            const minSalary = Math.max(...activeFilters.salary.map(s => parseInt(s)));
            
            if (!job.salary_min || job.salary_min < minSalary) {
                return false;
            }
        }
        
        // Location filter
        if (activeFilters.location.length > 0) {
            const jobLocation = (job.location.display_name || '').toLowerCase();
            const locationMatch = activeFilters.location.some(loc => 
                jobLocation.includes(loc.toLowerCase())
            );
            
            if (!locationMatch) {
                return false;
            }
        }
        
        return true;
    });
}

// ---- RENDER JOBS ----
function renderJobs() {
    jobsContainer.innerHTML = '';
    
    if (filteredJobs.length === 0) {
        hideLoading();
        showNoResults();
        jobCount.textContent = 'No jobs found';
        return;
    }
    
    hideLoading();
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    
    jobCount.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`;
    
    filteredJobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsContainer.appendChild(jobCard);
    });
}

// ---- CREATE JOB CARD ----
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const postedDate = new Date(job.created);
    const today = new Date();
    const daysSincePosted = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));
    const daysText = daysSincePosted === 0 ? 'Today' : daysSincePosted === 1 ? 'Yesterday' : `${daysSincePosted} days ago`;
    
    const jobDesc = (job.description || '').toLowerCase();
    const tags = [];
    
    if (jobDesc.includes('remote')) tags.push('remote');
    if (jobDesc.includes('hybrid')) tags.push('hybrid');
    if (jobDesc.includes('onsite') || jobDesc.includes('on-site')) tags.push('onsite');
    if (jobDesc.includes('full-time') || jobDesc.includes('full time')) tags.push('full-time');
    if (jobDesc.includes('contract')) tags.push('contract');
    
    card.innerHTML = `
        <div class="job-header">
            <h3 class="job-title">
                <a href="${job.redirect_url}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(job.title)}
                </a>
            </h3>
            <p class="job-company">${escapeHtml(job.company.display_name)}</p>
        </div>
        
        <div class="job-meta">
            <div class="job-meta-item">
                <i class="ti ti-map-pin"></i>
                <span class="job-meta-text">${escapeHtml(job.location.display_name)}</span>
            </div>
            
            ${job.salary_min && job.salary_max ? `
                <div class="job-meta-item">
                    <i class="ti ti-currency-dollar"></i>
                    <span class="salary">
                        $${formatSalary(job.salary_min)} - $${formatSalary(job.salary_max)} AUD
                    </span>
                </div>
            ` : ''}
            
            <div class="job-meta-item">
                <i class="ti ti-calendar"></i>
                <span class="days-posted">${daysText}</span>
            </div>
        </div>
        
        ${tags.length > 0 ? `
            <div class="job-tags">
                ${tags.map(tag => `<span class="tag ${tag}">${capitalizeFirst(tag)}</span>`).join('')}
            </div>
        ` : ''}
        
        ${job.description ? `
            <div class="job-summary">
                <p class="summary-text">${escapeHtml(job.description.substring(0, 200))}...</p>
            </div>
        ` : ''}
        
        <div class="job-footer">
            <span class="job-source">
                📍 ${getSourceName(job.redirect_url)}
            </span>
            <button class="btn-apply" onclick="window.open('${job.redirect_url}', '_blank')">
                <i class="ti ti-arrow-up-right"></i>
                View Job
            </button>
        </div>
    `;
    
    return card;
}

// ---- UTILITY FUNCTIONS ----

function formatSalary(salary) {
    if (salary >= 1000000) {
        return '$' + (salary / 1000000).toFixed(1) + 'M';
    } else if (salary >= 1000) {
        return '$' + (salary / 1000).toFixed(0) + 'K';
    }
    return '$' + salary;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSourceName(url) {
    if (!url) return 'Unknown Source';
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('seek.com.au')) return 'Seek';
    if (urlLower.includes('linkedin.com')) return 'LinkedIn';
    if (urlLower.includes('indeed.com')) return 'Indeed';
    if (urlLower.includes('jora.com')) return 'Jora';
    if (urlLower.includes('mycareer.com.au')) return 'MyCareer';
    if (urlLower.includes('realestate.com.au')) return 'Real Estate';
    if (urlLower.includes('careerone.com.au')) return 'CareerOne';
    if (urlLower.includes('jobserve.com')) return 'Jobserve';
    if (urlLower.includes('adzuna.com')) return 'Adzuna';
    
    return 'Job Board';
}

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-AU');
    if (footerTime) {
        footerTime.textContent = `${dateString} at ${timeString}`;
    }
}

// ---- STATE MANAGEMENT FUNCTIONS ----

function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    jobsContainer.innerHTML = '';
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
    jobsContainer.innerHTML = '';
}

function showNoResults() {
    errorState.classList.add('hidden');
    noResultsState.classList.remove('hidden');
}

// ---- ACCESSIBILITY ----
document.addEventListener('DOMContentLoaded', function() {
    filterChips.forEach(chip => {
        chip.setAttribute('role', 'button');
        chip.setAttribute('tabindex', '0');
        
        chip.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});
