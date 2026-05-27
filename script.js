/* ====================================================
   TRANSFORMATION JOBS MELBOURNE - JAVASCRIPT
   Handles API calls, filtering, and UI rendering
   ==================================================== */

// ---- API CONFIGURATION ----
// Adzuna API credentials for job search
const API_CONFIG = {
    appId: '45773940',
    apiKey: '19373b4fdefafdc7dbe4a625f0910e2d',
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/au/search'
};

// ---- TARGET JOB KEYWORDS ----
// These are the main transformation-related roles we're searching for
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
let allJobs = []; // Store all fetched jobs
let filteredJobs = []; // Store filtered results
let activeFilters = {
    keyword: [],
    arrangement: [],
    employment: [],
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
    // Fetch jobs when page loads
    fetchJobs();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update footer timestamp
    updateTimestamp();
});

// ---- FETCH JOBS FROM ADZUNA API ----
async function fetchJobs() {
    showLoading();
    
    try {
        // Search for transformation jobs - simpler query for faster API response
        // Instead of complex OR query which is slow, we search for "transformation"
        const params = new URLSearchParams({
            app_id: API_CONFIG.appId,
            app_key: API_CONFIG.apiKey,
            what: 'transformation', // Simpler, faster search term
            where: 'Melbourne', // Just Melbourne for faster results
            results_per_page: 100, // Get more results at once
            sort_by: 'date', // Sort by most recent
            sort_direction: 'descending'
        });
        
        const url = `${API_CONFIG.baseUrl}?${params.toString()}`;
        
        console.log('Fetching from:', url);
        const startTime = Date.now();
        
        // Make the API request with 15 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        console.log('Response status:', response.status, 'Time:', responseTime + 'ms');
        
        // Check if request was successful
        if (!response.ok) {
            // If API key is not set, show helpful error
            if (API_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
                throw new Error('Please add your Adzuna API key to the script.js file (API_CONFIG.apiKey)');
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log('API Response:', data);
        
        // Check if we got any results
        if (!data.results || data.results.length === 0) {
            allJobs = [];
            showNoResults();
            return;
        }
        
        // Store the jobs and apply initial filters
        allJobs = data.results;
        filterJobs();
        
        // Show success state
        hideLoading();
        renderJobs();
        
    } catch (error) {
        // Show error message to user
        console.error('Error fetching jobs:', error);
        
        // Better error messages
        if (error.name === 'AbortError') {
            showError('Request took too long. The Adzuna API server is slow right now. Please refresh and try again.');
        } else if (error.message.includes('Failed to fetch')) {
            showError('Network error. Please check your internet connection and try again.');
        } else {
            showError(error.message);
        }
    }
}

// ---- SET UP EVENT LISTENERS ----
function setupEventListeners() {
    // Search input - filter on every keystroke
    searchInput.addEventListener('input', function(e) {
        activeFilters.search = e.target.value.toLowerCase();
        filterJobs();
        renderJobs();
    });
    
    // Filter chips - toggle filters when clicked
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const filterType = this.dataset.filterType;
            const filterValue = this.dataset.filterValue;
            
            // Toggle the filter
            toggleFilter(filterType, filterValue);
        });
    });
    
    // Clear all filters button
    clearFiltersBtn.addEventListener('click', function() {
        // Reset all filters
        activeFilters = {
            keyword: [],
            arrangement: [],
            employment: [],
            search: ''
        };
        
        // Reset search input
        searchInput.value = '';
        
        // Deactivate all chips
        filterChips.forEach(chip => {
            chip.classList.remove('active');
        });
        
        // Re-filter and render
        filterJobs();
        renderJobs();
    });
    
    // Retry button
    retryButton.addEventListener('click', function() {
        fetchJobs();
    });
}

// ---- TOGGLE FILTER ----
function toggleFilter(filterType, filterValue) {
    // Get the current filter array
    const filterArray = activeFilters[filterType];
    
    // Check if value is already in the filter
    const index = filterArray.indexOf(filterValue);
    
    if (index > -1) {
        // Remove if already exists
        filterArray.splice(index, 1);
    } else {
        // Add if doesn't exist
        filterArray.push(filterValue);
    }
    
    // Update the chip UI
    updateChipUI(filterType, filterValue);
    
    // Re-filter and render
    filterJobs();
    renderJobs();
}

// ---- UPDATE CHIP UI ----
function updateChipUI(filterType, filterValue) {
    // Find the chip and toggle active class
    filterChips.forEach(chip => {
        if (chip.dataset.filterType === filterType && chip.dataset.filterValue === filterValue) {
            chip.classList.toggle('active');
        }
    });
}

// ---- FILTER JOBS ----
function filterJobs() {
    filteredJobs = allJobs.filter(job => {
        // Search filter - match against title and company
        if (activeFilters.search) {
            const searchTerm = activeFilters.search;
            const titleMatch = (job.title || '').toLowerCase().includes(searchTerm);
            const companyMatch = (job.company.display_name || '').toLowerCase().includes(searchTerm);
            
            if (!titleMatch && !companyMatch) {
                return false;
            }
        }
        
        // Keyword filter - must match at least one selected keyword
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
        
        // If all filters passed, include the job
        return true;
    });
}

// ---- RENDER JOBS ----
function renderJobs() {
    // Clear the container
    jobsContainer.innerHTML = '';
    
    // Show appropriate state
    if (filteredJobs.length === 0) {
        hideLoading();
        showNoResults();
        jobCount.textContent = 'No jobs found';
        return;
    }
    
    // Hide error and no results states
    hideLoading();
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    
    // Update job count
    jobCount.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`;
    
    // Create and append job cards
    filteredJobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsContainer.appendChild(jobCard);
    });
}

// ---- CREATE JOB CARD ----
function createJobCard(job) {
    // Create the card element
    const card = document.createElement('div');
    card.className = 'job-card';
    
    // Calculate days since posted
    const postedDate = new Date(job.created);
    const today = new Date();
    const daysSincePosted = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));
    const daysText = daysSincePosted === 0 ? 'Today' : daysSincePosted === 1 ? 'Yesterday' : `${daysSincePosted} days ago`;
    
    // Extract work arrangement and employment type tags
    const jobDesc = (job.description || '').toLowerCase();
    const tags = [];
    
    if (jobDesc.includes('remote')) tags.push('remote');
    if (jobDesc.includes('hybrid')) tags.push('hybrid');
    if (jobDesc.includes('onsite') || jobDesc.includes('on-site')) tags.push('onsite');
    
    if (jobDesc.includes('full-time') || jobDesc.includes('full time')) tags.push('full-time');
    if (jobDesc.includes('contract')) tags.push('contract');
    
    // Build the card HTML
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
                Via <a href="${job.redirect_url}" target="_blank" rel="noopener noreferrer">Adzuna</a>
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

// Format salary to readable format
function formatSalary(salary) {
    if (salary >= 1000000) {
        return '$' + (salary / 1000000).toFixed(1) + 'M';
    } else if (salary >= 1000) {
        return '$' + (salary / 1000).toFixed(0) + 'K';
    }
    return '$' + salary;
}

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Capitalize first letter of string
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update timestamp in footer
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-AU');
    footerTime.textContent = `${dateString} at ${timeString}`;
}

// ---- STATE MANAGEMENT FUNCTIONS ----

// Show loading state
function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    jobsContainer.innerHTML = '';
}

// Hide loading state
function hideLoading() {
    loadingState.classList.add('hidden');
}

// Show error state
function showError(message) {
    hideLoading();
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
    jobsContainer.innerHTML = '';
}

// Show no results state
function showNoResults() {
    errorState.classList.add('hidden');
    noResultsState.classList.remove('hidden');
}

// ---- ACCESSIBILITY ----
// Add ARIA labels and roles for better accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Ensure filter buttons are keyboard accessible
    filterChips.forEach(chip => {
        chip.setAttribute('role', 'button');
        chip.setAttribute('tabindex', '0');
        
        // Add keyboard support for Enter and Space
        chip.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});
