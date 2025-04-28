// Content script for handling the floating popup and interactions

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showPopup") {
    createNotificationBadge(message.question);
    sendResponse({ success: true });
  } else if (message.action === "hidePopup") {
    removeAllExtensionElements();
    sendResponse({ success: true });
  } else if (message.action === "showQuestion") {
    createFloatingPopup(message.question);
    sendResponse({ success: true });
  } else if (message.action === "openPopupMenu") {
    openExtensionMenu();
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Function to open extension menu
function openExtensionMenu() {
  // This function will show the complete popup menu with all CRUD options
  // Get the current website domain
  const domain = window.location.hostname.replace('www.', '');
  
  // Load the stored data to check if this website has a question
  chrome.storage.local.get('csvData', (result) => {
    if (result.csvData) {
      const lines = result.csvData.split('\n');
      let foundQuestion = null;
      
      // Look for the current domain in the data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[0].trim() === domain) {
            foundQuestion = parts[1].trim();
            break;
          }
        }
      }
      
      if (foundQuestion) {
        // If website has a question, show the popup with edit options
        createFloatingPopup(foundQuestion, true);
      } else {
        // If no question found, show the add form
        showQuestionForm(domain);
      }
    } else {
      // No data, show the add form
      showQuestionForm(domain);
    }
  });
}

// Function to create a notification badge
function createNotificationBadge(question) {
  // Remove existing elements if any
  removeAllExtensionElements();
  
  // Create container
  const container = document.createElement('div');
  container.id = 'web-question-assistant-badge';
  container.className = 'web-question-badge';
  
  // Add icon
  const icon = document.createElement('div');
  icon.className = 'web-question-icon';
  icon.innerHTML = '?';
  container.appendChild(icon);
  
  // Add text
  const text = document.createElement('div');
  text.className = 'web-question-badge-text';
  text.textContent = 'Question available';
  container.appendChild(text);
  
  // Add event listener to show the question when clicked
  container.addEventListener('click', () => {
    createFloatingPopup(question);
    container.remove();
  });
  
  // Add to page
  document.body.appendChild(container);
}

// Function to create the floating popup
function createFloatingPopup(question, showEditControls = false) {
  // Remove existing elements if any
  removeAllExtensionElements();
  
  // Create container
  const container = document.createElement('div');
  container.id = 'web-question-assistant-container';
  container.className = 'web-question-popup';
  
  // Add header with controls
  const header = document.createElement('div');
  header.className = 'web-question-header';
  
  // Add title
  const title = document.createElement('div');
  title.className = 'web-question-title';
  title.textContent = 'Web Question Assistant';
  header.appendChild(title);
  
  // Add controls
  const controls = document.createElement('div');
  controls.className = 'web-question-controls';
  
  // Add edit button if edit controls requested
  if (showEditControls) {
    const editButton = document.createElement('button');
    editButton.className = 'web-question-edit';
    editButton.textContent = '✎';
    editButton.title = 'Edit';
    editButton.addEventListener('click', () => {
      const domain = window.location.hostname.replace('www.', '');
      showQuestionForm(domain, question);
    });
    controls.appendChild(editButton);
  }
  
  // Add minimize button
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'web-question-minimize';
  minimizeButton.textContent = '−';
  minimizeButton.title = 'Minimize';
  minimizeButton.addEventListener('click', () => {
    container.remove();
    createNotificationBadge(question);
  });
  controls.appendChild(minimizeButton);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'web-question-close';
  closeButton.textContent = '×';
  closeButton.title = 'Close';
  closeButton.addEventListener('click', () => {
    removeAllExtensionElements();
  });
  controls.appendChild(closeButton);
  
  header.appendChild(controls);
  container.appendChild(header);
  
  // Add question content
  const content = document.createElement('div');
  content.className = 'web-question-content';
  
  // Add question text
  const questionElement = document.createElement('div');
  questionElement.className = 'web-question-text';
  questionElement.textContent = question || "No question available for this website";
  content.appendChild(questionElement);
  
  // Add edit button at the bottom if not already showing edit controls
  if (!showEditControls) {
    const editContainer = document.createElement('div');
    editContainer.className = 'web-question-edit-container';
    
    const editLink = document.createElement('button');
    editLink.className = 'web-question-edit-link';
    editLink.textContent = 'Edit Question';
    editLink.addEventListener('click', () => {
      const domain = window.location.hostname.replace('www.', '');
      showQuestionForm(domain, question);
    });
    
    editContainer.appendChild(editLink);
    content.appendChild(editContainer);
  }
  
  container.appendChild(content);
  
  // Add to page
  document.body.appendChild(container);
}

// Function to show the question form
function showQuestionForm(domain, existingQuestion = '') {
  // Remove existing elements if any
  removeAllExtensionElements();
  
  // Create container
  const container = document.createElement('div');
  container.id = 'web-question-assistant-container';
  container.className = 'web-question-popup';
  
  // Add header with controls
  const header = document.createElement('div');
  header.className = 'web-question-header';
  
  // Add title
  const title = document.createElement('div');
  title.className = 'web-question-title';
  title.textContent = existingQuestion ? 'Edit Question' : 'Add Question';
  header.appendChild(title);
  
  // Add close button
  const controls = document.createElement('div');
  controls.className = 'web-question-controls';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'web-question-close';
  closeButton.textContent = '×';
  closeButton.title = 'Close';
  closeButton.addEventListener('click', () => {
    removeAllExtensionElements();
  });
  controls.appendChild(closeButton);
  
  header.appendChild(controls);
  container.appendChild(header);
  
  // Add form content
  const content = document.createElement('div');
  content.className = 'web-question-form-content';
  
  // Create form
  const form = document.createElement('form');
  form.className = 'web-question-form';
  
  // Website field
  const websiteGroup = document.createElement('div');
  websiteGroup.className = 'form-group';
  
  const websiteLabel = document.createElement('label');
  websiteLabel.textContent = 'Website:';
  websiteLabel.setAttribute('for', 'website-input');
  websiteGroup.appendChild(websiteLabel);
  
  const websiteInput = document.createElement('input');
  websiteInput.type = 'text';
  websiteInput.id = 'website-input';
  websiteInput.value = domain;
  websiteInput.disabled = !!existingQuestion; // Disable if editing existing question
  websiteInput.required = true;
  websiteGroup.appendChild(websiteInput);
  
  // Question field
  const questionGroup = document.createElement('div');
  questionGroup.className = 'form-group';
  
  const questionLabel = document.createElement('label');
  questionLabel.textContent = 'Question:';
  questionLabel.setAttribute('for', 'question-input');
  questionGroup.appendChild(questionLabel);
  
  const questionInput = document.createElement('input');
  questionInput.type = 'text';
  questionInput.id = 'question-input';
  questionInput.value = existingQuestion;
  questionInput.required = true;
  questionGroup.appendChild(questionInput);
  
  // Buttons
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';
  
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'web-question-form-button primary';
  saveButton.textContent = 'Save';
  buttonGroup.appendChild(saveButton);
  
  // Add delete button if editing
  if (existingQuestion) {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'web-question-form-button danger';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the question for ${domain}?`)) {
        deleteWebsiteQuestion(domain);
      }
    });
    buttonGroup.appendChild(deleteButton);
  }
  
  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'web-question-form-button';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    // If editing, go back to question display
    if (existingQuestion) {
      createFloatingPopup(existingQuestion, true);
    } else {
      removeAllExtensionElements();
    }
  });
  buttonGroup.appendChild(cancelButton);
  
  // Add all form elements
  form.appendChild(websiteGroup);
  form.appendChild(questionGroup);
  form.appendChild(buttonGroup);
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const website = websiteInput.value.trim();
    const question = questionInput.value.trim();
    
    if (existingQuestion) {
      updateWebsiteQuestion(website, question);
    } else {
      addWebsiteQuestion(website, question);
    }
  });
  
  content.appendChild(form);
  container.appendChild(content);
  
  // Add to page
  document.body.appendChild(container);
}

// Helper function to remove all extension elements
function removeAllExtensionElements() {
  const popup = document.getElementById('web-question-assistant-container');
  if (popup) popup.remove();
  
  const badge = document.getElementById('web-question-assistant-badge');
  if (badge) badge.remove();
}

// Helper function to add a new website question
function addWebsiteQuestion(website, question) {
  // Get existing data
  chrome.storage.local.get('csvData', (result) => {
    let csvData;
    
    if (result.csvData) {
      // Add new entry to existing data
      // Check if website already exists
      const lines = result.csvData.split('\n');
      let websiteExists = false;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[0].trim() === website) {
            websiteExists = true;
            lines[i] = `${website},${question}`;
            break;
          }
        }
      }
      
      if (!websiteExists) {
        lines.push(`${website},${question}`);
      }
      
      csvData = lines.join('\n');
    } else {
      // Create new data
      csvData = `website,question\n${website},${question}`;
    }
    
    // Save data
    saveData(csvData, question);
  });
}

// Helper function to update an existing website question
function updateWebsiteQuestion(website, question) {
  // Get existing data
  chrome.storage.local.get('csvData', (result) => {
    if (result.csvData) {
      const lines = result.csvData.split('\n');
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[0].trim() === website) {
            lines[i] = `${website},${question}`;
            break;
          }
        }
      }
      
      const csvData = lines.join('\n');
      saveData(csvData, question);
    }
  });
}

// Helper function to delete a website question
function deleteWebsiteQuestion(website) {
  // Get existing data
  chrome.storage.local.get('csvData', (result) => {
    if (result.csvData) {
      const lines = result.csvData.split('\n');
      const newLines = lines.filter(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return true; // Keep empty lines
        
        const parts = trimmedLine.split(',');
        if (parts.length < 2) return true; // Keep invalid lines
        
        return parts[0].trim() !== website; // Filter out the website to delete
      });
      
      const csvData = newLines.join('\n');
      saveData(csvData);
    }
  });
}

// Helper function to save data
function saveData(csvData, question = null) {
  chrome.storage.local.set({ 
    csvData, 
    lastFetched: Date.now(),
    needsSync: true
  }, () => {
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'saveData',
      data: csvData
    });
    
    // Show success message
    showFeedbackMessage('Changes saved locally. To sync with Google Sheet, please manually update the sheet.');
    
    // Show the updated question if provided
    if (question) {
      setTimeout(() => {
        createFloatingPopup(question, true);
      }, 1500);
    } else {
      setTimeout(removeAllExtensionElements, 1500);
    }
  });
}

// Helper function to show feedback message
function showFeedbackMessage(message) {
  // Remove any existing feedback
  const existingFeedback = document.getElementById('web-question-feedback');
  if (existingFeedback) existingFeedback.remove();
  
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.id = 'web-question-feedback';
  feedback.className = 'web-question-feedback';
  feedback.textContent = message;
  
  // Add to page
  document.body.appendChild(feedback);
  
  // Remove after 5 seconds
  setTimeout(() => {
    feedback.remove();
  }, 5000);
} 