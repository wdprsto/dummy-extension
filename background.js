import config from './config.js';

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openExtension",
    title: `Open ${config.appName}`,
    contexts: ["page"]
  });
  
  // Initialize data storage by fetching from Google Sheet
  fetchAndStoreData();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openExtension") {
    // Send message to content script to open popup
    chrome.tabs.sendMessage(tab.id, {
      action: "openPopupMenu"
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
  } else if (message.action === 'fetchGoogleSheetData') {
    fetchAndStoreData()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for the asynchronous response
  }
});

// Function to fetch and store data from Google Sheet
async function fetchAndStoreData() {
  try {
    const response = await fetch(config.dataSource.googleSheet.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    
    // Store in local storage
    chrome.storage.local.set({ csvData, lastFetched: Date.now() });
    
    return csvData;
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    
    // Fallback to local CSV if available
    try {
      const localResponse = await fetch(chrome.runtime.getURL(config.dataSource.path));
      const localCsvData = await localResponse.text();
      chrome.storage.local.set({ csvData: localCsvData, lastFetched: Date.now() });
      return localCsvData;
    } catch (localError) {
      console.error('Error fetching local CSV fallback:', localError);
      throw error; // Re-throw the original error
    }
  }
}

// Check if the website is in our data
function checkWebsite(url, tabId) {
  // Extract domain from URL
  const domain = new URL(url).hostname.replace('www.', '');
  
  // First check in storage
  chrome.storage.local.get(['csvData', 'lastFetched'], (result) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds
    
    // If data is older than 1 hour, refresh it
    if (!result.lastFetched || result.lastFetched < oneHourAgo) {
      fetchAndStoreData()
        .then(csvData => processData(csvData, domain, tabId))
        .catch(() => {
          // If fetch fails, use existing data
          if (result.csvData) {
            processData(result.csvData, domain, tabId);
          }
        });
    } else if (result.csvData) {
      processData(result.csvData, domain, tabId);
    } else {
      // No data in storage, fetch it
      fetchAndStoreData()
        .then(csvData => processData(csvData, domain, tabId))
        .catch(err => console.error('Error fetching data:', err));
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
          // Show the notification badge for listed websites
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