import config from './config.js';

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openExtension",
    title: `Open ${config.appName}`,
    contexts: ["page"]
  });
  
  // Initialize data storage
  chrome.storage.local.get('csvData', (result) => {
    if (!result.csvData) {
      // If no data exists yet, save the initial data from the CSV file
      fetch(chrome.runtime.getURL(config.dataSource.path))
        .then(response => response.text())
        .then(csv => {
          chrome.storage.local.set({ csvData: csv });
        });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openExtension") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: showPopup
    });
  }
});

// Check if the current website is in our data when URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkWebsite(tab.url, tabId);
  }
});

// Listen for messages to save data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveData' && message.data) {
    // Save the updated data
    chrome.storage.local.set({ csvData: message.data });
    
    // Send a success response
    sendResponse({ success: true });
    return true; // Keep the message channel open for the asynchronous response
  }
});

// Function to show the popup
function showPopup() {
  // Create or show the floating popup
  const existingPopup = document.getElementById('web-question-assistant-popup');
  
  if (!existingPopup) {
    const iframe = document.createElement('iframe');
    iframe.id = 'web-question-assistant-popup';
    iframe.src = chrome.runtime.getURL('popup/popup.html');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '300px';
    iframe.style.height = '200px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    document.body.appendChild(iframe);
  } else {
    existingPopup.style.display = 'block';
  }
}

// Check if the website is in our data
function checkWebsite(url, tabId) {
  // Extract domain from URL
  const domain = new URL(url).hostname.replace('www.', '');
  
  // First check in storage
  chrome.storage.local.get('csvData', (result) => {
    if (result.csvData) {
      processData(result.csvData, domain, tabId);
    } else {
      // Fallback to CSV file
      fetch(chrome.runtime.getURL(config.dataSource.path))
        .then(response => response.text())
        .then(csv => {
          processData(csv, domain, tabId);
        })
        .catch(err => console.error('Error reading CSV file:', err));
    }
  });
}

// Process CSV data to find website matches
function processData(csv, domain, tabId) {
  const lines = csv.split('\n');
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const website = parts[config.dataSource.columns.website].trim();
        if (domain === website) {
          const question = parts[config.dataSource.columns.question].trim();
          // Show the popup automatically for listed websites
          chrome.tabs.sendMessage(tabId, {
            action: "showPopup",
            question: question
          });
          break;
        }
      }
    }
  }
} 