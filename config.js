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
    path: "data/data.csv",
    columns: {
      website: 0,
      question: 1
    }
  }
};

export default config; 