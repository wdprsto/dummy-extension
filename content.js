// Content script for handling the floating popup and interactions

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showPopup") {
    createFloatingPopup(message.question);
    sendResponse({ success: true });
  } else if (message.action === "hidePopup") {
    const popup = document.getElementById('web-question-assistant-container');
    if (popup) {
      popup.remove();
      sendResponse({ success: true });
    }
  }
  return true; // Keep the message channel open for async response
});

// Function to create the floating popup
function createFloatingPopup(question) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('web-question-assistant-container');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'web-question-assistant-container';
  
  // Set position and style (styles will be defined in content.css)
  container.className = 'web-question-popup';
  
  // Add question text
  const questionElement = document.createElement('div');
  questionElement.className = 'web-question-text';
  questionElement.textContent = question || "No question available for this website";
  container.appendChild(questionElement);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'web-question-close';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    container.remove();
  });
  container.appendChild(closeButton);
  
  // Add to page
  document.body.appendChild(container);
} 