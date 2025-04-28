// Configuration file for Web Question Assistant
const config = {
  // App information
  appName: "Web Question Assistant",
  
  // Theme configuration
  theme: {
    primaryColor: "#88D498", // Pastel green
    secondaryColor: "#C6DABF", // Light pastel green
    backgroundColor: "#F3F8F2", // Light background
    textColor: "#3A4E48", // Dark green text
    accentColor: "#1A936F" // Darker green accent
  },
  
  // Data source configuration
  dataSource: {
    // Local data file (fallback)
    path: "data/data.csv",
    // Google Sheet data source
    googleSheet: {
      // Spreadsheet ID from the URL
      id: "1uIizPuQ7ILmI8k3P7OGfWOe_MkMTVZWQX165bq3_aJM",
      // URL to fetch the CSV data (using export=csv parameter)
      url: "https://docs.google.com/spreadsheets/d/1uIizPuQ7ILmI8k3P7OGfWOe_MkMTVZWQX165bq3_aJM/export?format=csv&gid=0"
    },
    columns: {
      website: 0,
      question: 1
    }
  }
};

export default config; 