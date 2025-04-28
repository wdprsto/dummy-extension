// Data manager utility for reading and writing CSV data
import config from '../config.js';

/**
 * Read CSV data from storage, Google Sheet or local file
 * @param {string} filePath - Path to the local CSV file (fallback)
 * @returns {Promise<Array>} - Array of data objects
 */
export async function readCsvData() {
  try {
    // First try to read from storage
    const storageData = await readFromStorage();
    if (storageData) {
      return parseCsv(storageData);
    }
    
    // If no storage data, try fetching from Google Sheet
    const googleSheetData = await fetchFromGoogleSheet();
    if (googleSheetData) {
      // Save to storage for future use
      chrome.storage.local.set({ csvData: googleSheetData, lastFetched: Date.now() });
      return parseCsv(googleSheetData);
    }
    
    // If Google Sheet fails, fall back to local file
    const localData = await fetchLocalCsv();
    if (localData) {
      chrome.storage.local.set({ csvData: localData, lastFetched: Date.now() });
      return parseCsv(localData);
    }
    
    throw new Error('Unable to read CSV data from any source');
  } catch (error) {
    console.error('Error reading CSV data:', error);
    return [];
  }
}

/**
 * Read data from Chrome storage
 * @returns {Promise<string|null>} - CSV data string or null
 */
function readFromStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(['csvData', 'lastFetched'], (result) => {
      if (result.csvData) {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000); // 1 hour in milliseconds
        
        // If data is older than 1 hour, consider it stale
        if (result.lastFetched && result.lastFetched > oneHourAgo) {
          resolve(result.csvData);
        } else {
          // Data is stale, return null to trigger a refresh
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Fetch CSV data from Google Sheet
 * @returns {Promise<string|null>} - CSV data string or null
 */
async function fetchFromGoogleSheet() {
  try {
    const response = await fetch(config.dataSource.googleSheet.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheet: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching from Google Sheet:', error);
    return null;
  }
}

/**
 * Fetch CSV data from local file
 * @returns {Promise<string|null>} - CSV data string or null
 */
async function fetchLocalCsv() {
  try {
    const response = await fetch(chrome.runtime.getURL(config.dataSource.path));
    if (!response.ok) {
      throw new Error(`Failed to fetch local CSV: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching local CSV:', error);
    return null;
  }
}

/**
 * Write CSV data to storage (can't directly write to Google Sheet)
 * @param {Array} data - Array of data objects
 * @returns {string} - CSV content
 */
export function writeCsvData(data) {
  const csvContent = generateCsv(data);
  
  // Save to storage
  chrome.storage.local.set({ 
    csvData: csvContent, 
    lastFetched: Date.now(),
    needsSync: true // Flag to indicate changes need to be synced to Google Sheet
  });
  
  return csvContent;
}

/**
 * Parse CSV string into array of objects
 * @param {string} csvText - CSV text
 * @returns {Array} - Array of data objects
 */
function parseCsv(csvText) {
  const lines = csvText.split('\n');
  const result = [];
  
  // Get headers
  const headers = lines[0].split(',');
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      result.push(entry);
    }
  }
  
  return result;
}

/**
 * Generate CSV string from array of objects
 * @param {Array} data - Array of data objects
 * @returns {string} - CSV content
 */
function generateCsv(data) {
  if (!data || data.length === 0) {
    return 'website,question\n';
  }
  
  // Get headers from first item
  const headers = Object.keys(data[0]);
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const values = headers.map(header => item[header] || '');
    csvContent += values.join(',') + '\n';
  });
  
  return csvContent;
} 