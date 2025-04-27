// Data manager utility for reading and writing CSV data

export async function readCsvData(filePath) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath));
    const csvText = await response.text();
    return parseCsv(csvText);
  } catch (error) {
    console.error('Error reading CSV data:', error);
    return [];
  }
}

export function writeCsvData(data, filePath) {
  const csvContent = generateCsv(data);
  // This part is tricky in Chrome extensions
  // We'll use chrome.storage to save the data for now
  // In a real extension, you might need a background script with filesystem access
  // or store in chrome.storage and sync with a server
  chrome.storage.local.set({ csvData: csvContent });
  return csvContent;
}

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