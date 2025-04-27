import config from '../config.js';

// DOM Elements
const websiteFoundSection = document.getElementById('website-found');
const websiteNotFoundSection = document.getElementById('website-not-found');
const formSection = document.getElementById('form-section');
const currentWebsiteEl = document.getElementById('current-website');
const currentQuestionEl = document.getElementById('current-question');
const websiteInput = document.getElementById('website-input');
const questionInput = document.getElementById('question-input');
const websiteForm = document.getElementById('website-form');
const editButton = document.getElementById('edit-question');
const deleteButton = document.getElementById('delete-entry');
const addButton = document.getElementById('add-website');
const cancelButton = document.getElementById('cancel-form');

// State variables
let currentWebsite = '';
let isEditing = false;
let websites = [];

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  // Set title from config
  document.getElementById('popup-title').textContent = config.appName;
  
  // Apply theme colors from config
  applyTheme();
  
  // Load data and initialize
  loadData();
  
  // Get current tab info
  getCurrentTab();
  
  // Setup event listeners
  setupEventListeners();
});

// Apply theme colors from config
function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', config.theme.primaryColor);
  root.style.setProperty('--secondary-color', config.theme.secondaryColor);
  root.style.setProperty('--background-color', config.theme.backgroundColor);
  root.style.setProperty('--text-color', config.theme.textColor);
  root.style.setProperty('--accent-color', config.theme.accentColor);
}

// Load website data from CSV
function loadData() {
  fetch(chrome.runtime.getURL(config.dataSource.path))
    .then(response => response.text())
    .then(csv => {
      const lines = csv.split('\n');
      websites = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            websites.push({
              website: parts[config.dataSource.columns.website],
              question: parts[config.dataSource.columns.question]
            });
          }
        }
      }
      
      // Update UI if current website is already known
      if (currentWebsite) {
        updateUIForWebsite(currentWebsite);
      }
    })
    .catch(err => console.error('Error loading data:', err));
}

// Get current tab URL
function getCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      const domain = new URL(url).hostname.replace('www.', '');
      currentWebsite = domain;
      updateUIForWebsite(domain);
    }
  });
}

// Update UI based on whether the website is in our data
function updateUIForWebsite(domain) {
  const websiteData = websites.find(w => w.website === domain);
  
  if (websiteData) {
    // Website found in data
    websiteFoundSection.classList.remove('hidden');
    websiteNotFoundSection.classList.add('hidden');
    formSection.classList.add('hidden');
    
    currentWebsiteEl.textContent = domain;
    currentQuestionEl.textContent = websiteData.question;
  } else {
    // Website not found in data
    websiteFoundSection.classList.add('hidden');
    websiteNotFoundSection.classList.remove('hidden');
    formSection.classList.add('hidden');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Edit button
  editButton.addEventListener('click', () => {
    const websiteData = websites.find(w => w.website === currentWebsite);
    if (websiteData) {
      isEditing = true;
      websiteInput.value = websiteData.website;
      websiteInput.disabled = true; // Don't allow website change during edit
      questionInput.value = websiteData.question;
      
      websiteFoundSection.classList.add('hidden');
      formSection.classList.remove('hidden');
    }
  });
  
  // Delete button
  deleteButton.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete the entry for ${currentWebsite}?`)) {
      deleteWebsite(currentWebsite);
    }
  });
  
  // Add website button
  addButton.addEventListener('click', () => {
    isEditing = false;
    websiteInput.value = currentWebsite;
    websiteInput.disabled = false;
    questionInput.value = '';
    
    websiteNotFoundSection.classList.add('hidden');
    formSection.classList.remove('hidden');
  });
  
  // Cancel button
  cancelButton.addEventListener('click', () => {
    formSection.classList.add('hidden');
    updateUIForWebsite(currentWebsite);
  });
  
  // Form submit
  websiteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const website = websiteInput.value.trim();
    const question = questionInput.value.trim();
    
    if (isEditing) {
      updateWebsite(website, question);
    } else {
      addWebsite(website, question);
    }
  });
}

// Add a new website to the data
function addWebsite(website, question) {
  websites.push({ website, question });
  saveData();
  
  currentWebsite = website;
  updateUIForWebsite(website);
}

// Update an existing website in the data
function updateWebsite(website, question) {
  const index = websites.findIndex(w => w.website === website);
  if (index !== -1) {
    websites[index].question = question;
    saveData();
    updateUIForWebsite(website);
  }
}

// Delete a website from the data
function deleteWebsite(website) {
  const index = websites.findIndex(w => w.website === website);
  if (index !== -1) {
    websites.splice(index, 1);
    saveData();
    updateUIForWebsite(website);
  }
}

// Save data back to CSV
function saveData() {
  let csv = 'website,question\n';
  
  websites.forEach(item => {
    csv += `${item.website},${item.question}\n`;
  });
  
  // Use chrome.storage to save the CSV content
  chrome.storage.local.set({ csvData: csv }, () => {
    // After saving, notify a background script to write to file
    chrome.runtime.sendMessage({ action: 'saveData', data: csv });
  });
} 