// Transformation Jobs Data - Melbourne Based
const jobsData = [
    {
        id: 1,
        title: "Workday HCM Consultant",
        company: "Workday",
        salary: 145000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Lead Workday HCM implementations for enterprise clients.",
        tags: ["Workday HCM", "Implementation", "Consulting"],
        featured: true
    },
    {
        id: 2,
        title: "Digital Transformation Manager",
        company: "Cognizant",
        salary: 165000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "1 day ago",
        description: "Drive enterprise digital transformation programs.",
        tags: ["Transformation", "Program Mgmt", "Change Mgmt"],
        featured: true
    },
    {
        id: 3,
        title: "Workday Integration Specialist",
        company: "Deloitte",
        salary: 155000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Design and implement Workday integrations.",
        tags: ["Workday", "Integration", "EIB"],
    },
    {
        id: 4,
        title: "Change Management Lead",
        company: "Accenture",
        salary: 160000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Lead change management for transformation initiatives.",
        tags: ["Change Mgmt", "Stakeholder", "Transformation"],
    },
    {
        id: 5,
        title: "Workday FINS Analyst",
        company: "IBM",
        salary: 135000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Configure and support Workday FINS module.",
        tags: ["Workday FINS", "Finance", "Config"],
    },
    {
        id: 6,
        title: "ERP Transformation Director",
        company: "KPMG",
        salary: 200000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Lead enterprise ERP transformation programs.",
        tags: ["ERP", "Leadership", "Workday"],
    },
    {
        id: 7,
        title: "Payroll Implementation Specialist",
        company: "PwC",
        salary: 140000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Implement Workday Payroll solutions.",
        tags: ["Workday Payroll", "Impl", "Compliance"],
    },
    {
        id: 8,
        title: "Enterprise Architect - Digital",
        company: "Cognizant",
        salary: 180000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Design enterprise digital transformation roadmaps.",
        tags: ["Enterprise Arch", "Digital", "Cloud"],
    },
    {
        id: 9,
        title: "Workday Security Administrator",
        company: "EY",
        salary: 125000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Manage Workday security and access controls.",
        tags: ["Workday Admin", "Security", "Access"],
    },
    {
        id: 10,
        title: "Process Improvement Consultant",
        company: "Capgemini",
        salary: 150000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Analyze and design process improvements.",
        tags: ["Process", "Lean", "Business Analysis"],
    },
    {
        id: 11,
        title: "Workday Reporting Developer",
        company: "Infosys",
        salary: 130000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Develop Workday reports and analytics.",
        tags: ["Workday Report", "Analytics", "Dashboard"],
    },
    {
        id: 12,
        title: "Organizational Change Manager",
        company: "NTT Data",
        salary: 155000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Design organizational change strategies.",
        tags: ["Change Mgmt", "Org Design", "Comms"],
    },
    {
        id: 13,
        title: "Solutions Architect - ERP",
        company: "TCS",
        salary: 170000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Design ERP solutions for clients.",
        tags: ["Solutions Arch", "ERP", "Design"],
    },
    {
        id: 14,
        title: "Business Transformation Consultant",
        company: "DXC",
        salary: 145000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Support business transformation initiatives.",
        tags: ["Transformation", "Operating Model", "Strategy"],
    },
    {
        id: 15,
        title: "Workday Adaptive Planning Analyst",
        company: "Cognizant",
        salary: 135000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Configure Workday Adaptive Planning.",
        tags: ["Adaptive Plan", "Finance", "Budgeting"],
    },
    {
        id: 16,
        title: "Program Manager - Enterprise Transformation",
        company: "Deloitte",
        salary: 175000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Lead enterprise transformation programs.",
        tags: ["Program Mgmt", "Transformation", "Leadership"],
    },
    {
        id: 17,
        title: "Workday Student Manager",
        company: "Accenture",
        salary: 120000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Support Workday Student implementations.",
        tags: ["Workday Student", "Education", "Impl"],
    },
    {
        id: 18,
        title: "Digital Strategy Consultant",
        company: "IBM",
        salary: 160000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Develop digital strategy roadmaps.",
        tags: ["Digital Strategy", "Consulting", "Roadmap"],
    },
    {
        id: 19,
        title: "Workday Community Analyst",
        company: "Workday",
        salary: 130000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Support Workday Community module.",
        tags: ["Workday Community", "Config", "Support"],
    },
    {
        id: 20,
        title: "Data Transformation Specialist",
        company: "KPMG",
        salary: 155000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Lead data transformation initiatives.",
        tags: ["Data Transform", "Analytics", "Strategy"],
    },
    {
        id: 21,
        title: "HCM Transformation Lead",
        company: "PwC",
        salary: 170000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Lead Human Capital Management transformation.",
        tags: ["HCM", "Transformation", "People"],
    },
    {
        id: 22,
        title: "Enterprise Systems Analyst",
        company: "Cognizant",
        salary: 140000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Analyze enterprise systems.",
        tags: ["Systems Analysis", "Enterprise", "Transform"],
    },
    {
        id: 23,
        title: "Workday Recruiting Systems Analyst",
        company: "EY",
        salary: 135000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Configure Workday Recruiting module.",
        tags: ["Workday Recruit", "Talent", "Config"],
    },
    {
        id: 24,
        title: "Operational Transformation Manager",
        company: "Capgemini",
        salary: 160000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Drive operational transformation.",
        tags: ["Operational Transform", "Process", "Efficiency"],
    },
    {
        id: 25,
        title: "Business Analyst - Finance Systems",
        company: "Infosys",
        salary: 125000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Support finance system transformations.",
        tags: ["Business Analysis", "Finance", "FINS"],
    },
    {
        id: 26,
        title: "Cloud Transformation Architect",
        company: "NTT Data",
        salary: 180000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Design cloud transformation strategies.",
        tags: ["Cloud Transform", "Architecture", "Arch"],
    },
    {
        id: 27,
        title: "Supply Chain Transformation Specialist",
        company: "TCS",
        salary: 150000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Lead supply chain transformation.",
        tags: ["Supply Chain", "Transformation", "Procure"],
    },
    {
        id: 28,
        title: "Workday Testing Analyst",
        company: "DXC",
        salary: 120000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Lead QA and testing.",
        tags: ["QA Testing", "Workday", "Compliance"],
    },
    {
        id: 29,
        title: "Governance and Risk Manager",
        company: "Deloitte",
        salary: 165000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Establish governance frameworks.",
        tags: ["Governance", "Risk Mgmt", "Compliance"],
    },
    {
        id: 30,
        title: "Talent Strategy Consultant",
        company: "Accenture",
        salary: 155000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Design talent strategies.",
        tags: ["Talent Strategy", "Org Design", "HR"],
    },
    {
        id: 31,
        title: "Technology Change Manager",
        company: "IBM",
        salary: 145000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Manage change for technology.",
        tags: ["Change Mgmt", "Technology", "Adoption"],
    },
    {
        id: 32,
        title: "Workday Continuity Analyst",
        company: "KPMG",
        salary: 130000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Support Workday Continuity Cloud.",
        tags: ["Continuity", "Workday", "DR"],
    },
    {
        id: 33,
        title: "Business Process Manager",
        company: "PwC",
        salary: 150000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Design and optimize processes.",
        tags: ["Process Mgmt", "Optimization", "Transform"],
    },
    {
        id: 34,
        title: "Digital Innovation Manager",
        company: "Cognizant",
        salary: 165000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Drive digital innovation.",
        tags: ["Digital Innovation", "Technology", "Strategy"],
    },
    {
        id: 35,
        title: "Workday Analytics Developer",
        company: "EY",
        salary: 140000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Develop analytics solutions.",
        tags: ["Analytics", "Workday", "Data Science"],
    },
    {
        id: 36,
        title: "Strategic Project Manager",
        company: "Capgemini",
        salary: 170000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Manage strategic transformation projects.",
        tags: ["Project Mgmt", "Strategy", "Transform"],
    },
    {
        id: 37,
        title: "Workday Staffing Consultant",
        company: "Infosys",
        salary: 125000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Configure Workday Staffing.",
        tags: ["Workday Staff", "Workforce", "Config"],
    },
    {
        id: 38,
        title: "Enterprise Data Architect",
        company: "NTT Data",
        salary: 175000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Design enterprise data architectures.",
        tags: ["Data Arch", "Enterprise", "Strategy"],
    },
    {
        id: 39,
        title: "Transformation Office Director",
        company: "TCS",
        salary: 190000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Lead transformation office.",
        tags: ["Transformation", "Leadership", "PMO"],
    },
    {
        id: 40,
        title: "Customer Success Manager - Workday",
        company: "Workday",
        salary: 135000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Support customer success.",
        tags: ["Customer Success", "Adoption", "Workday"],
    },
    {
        id: 41,
        title: "Compliance and Risk Specialist",
        company: "DXC",
        salary: 145000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Ensure compliance.",
        tags: ["Compliance", "Risk Mgmt", "Regulation"],
    },
    {
        id: 42,
        title: "Integration Architect",
        company: "Deloitte",
        salary: 165000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Design integration solutions.",
        tags: ["Integration Arch", "ERP", "Design"],
    },
    {
        id: 43,
        title: "Organizational Effectiveness Manager",
        company: "Accenture",
        salary: 160000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "3 days ago",
        description: "Drive organizational effectiveness.",
        tags: ["Org Development", "Transform", "Effective"],
    },
    {
        id: 44,
        title: "Workday Certification Trainer",
        company: "IBM",
        salary: 130000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "6 days ago",
        description: "Develop training programs.",
        tags: ["Training", "Workday", "Capability"],
    },
    {
        id: 45,
        title: "Finance Transformation Manager",
        company: "KPMG",
        salary: 170000,
        location: "Melbourne CBD",
        industry: "Finance",
        workType: "Full Time",
        postedDate: "2 days ago",
        description: "Lead finance transformation.",
        tags: ["Finance Transform", "Finance Ops", "Leadership"],
    },
    {
        id: 46,
        title: "Solution Delivery Manager",
        company: "PwC",
        salary: 150000,
        location: "Melbourne CBD",
        industry: "Consulting",
        workType: "Full Time",
        postedDate: "5 days ago",
        description: "Deliver transformation solutions.",
        tags: ["Solution Delivery", "Project Mgmt", "Quality"],
    },
    {
        id: 47,
        title: "Workday HCM Plus Consultant",
        company: "Cognizant",
        salary: 145000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "4 days ago",
        description: "Implement Workday HCM Plus.",
        tags: ["Workday HCM+", "Talent Mgmt", "Learning"],
    },
    {
        id: 48,
        title: "Digital Experience Designer",
        company: "EY",
        salary: 155000,
        location: "Melbourne CBD",
        industry: "Tech",
        workType: "Full Time",
        postedDate: "1 week ago",
        description: "Design digital experiences.",
        tags: ["UX Design", "Digital Exp", "Transform"],
    }
];

// DOM Elements
const jobsTableBody = document.getElementById('jobsTableBody');
const searchInput = document.getElementById('searchInput');
const jobCount = document.getElementById('jobCount');
const totalCount = document.getElementById('totalCount');
const noResults = document.getElementById('noResults');
const industryFilter = document.getElementById('industryFilter');
const salaryFilter = document.getElementById('salaryFilter');
const sortBtns = document.querySelectorAll('.sort-btn');

let filteredJobs = [...jobsData];

// Initialize
renderJobs(filteredJobs);

// Event Listeners
searchInput.addEventListener('input', handleSearch);
industryFilter.addEventListener('change', applyFilters);
salaryFilter.addEventListener('change', applyFilters);
sortBtns.forEach(btn => btn.addEventListener('click', handleSort));

// Search Handler
function handleSearch(e) {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedIndustry = industryFilter.value;
    const selectedSalary = parseInt(salaryFilter.value) || 0;

    filteredJobs = jobsData.filter(job => {
        const searchMatch = 
            job.title.toLowerCase().includes(searchQuery) ||
            job.company.toLowerCase().includes(searchQuery) ||
            job.description.toLowerCase().includes(searchQuery) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchQuery));

        const industryMatch = !selectedIndustry || job.industry === selectedIndustry;
        const salaryMatch = job.salary >= selectedSalary * 1000;

        return searchMatch && industryMatch && salaryMatch;
    });

    renderJobs(filteredJobs);
}

// Sort Handler
function handleSort(e) {
    const sortType = e.target.dataset.sort;
    sortBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    if (sortType === 'recent') {
        filteredJobs.sort((a, b) => jobsData.indexOf(b) - jobsData.indexOf(a));
    } else if (sortType === 'salary-high') {
        filteredJobs.sort((a, b) => b.salary - a.salary);
    }

    renderJobs(filteredJobs);
}

// Render Jobs Table
function renderJobs(jobs) {
    jobCount.textContent = jobs.length;
    totalCount.textContent = jobs.length;

    if (jobs.length === 0) {
        jobsTableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    jobsTableBody.innerHTML = jobs.map(job => `
        <tr>
            <td class="job-title-cell">${job.title}</td>
            <td class="job-company-cell">${job.company}</td>
            <td class="job-salary-cell">${job.salary.toLocaleString('en-AU', {style: 'currency', currency: 'AUD', maximumFractionDigits: 0})}</td>
            <td>${job.industry}</td>
            <td class="job-type-cell">${job.workType}</td>
            <td class="job-tags-cell">
                ${job.tags.slice(0, 2).map(tag => `<span class="job-tag">${tag}</span>`).join('')}
            </td>
            <td>
                <button class="action-btn">View</button>
            </td>
        </tr>
    `).join('');
}
