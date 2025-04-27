# Web Question Assistant Chrome Extension

A Chrome extension that displays custom questions based on the websites you visit. The extension uses a pastel green theme and offers a clean, non-intrusive interface.

## Features

- Automatically detects if the current website is in your predefined list
- Shows a floating question popup for websites in your list
- Right-click context menu to access the extension on any website
- Add, edit, and delete website-question pairs
- Customizable appearance through the config file

## Tech Stack

- Vanilla JavaScript
- Chrome Extension API
- CSS3 for styling
- CSV for data storage

## Modifying Data

The extension gets its data from the `data/data.csv` file. This file has a simple structure:

```
website,question
google.com,What are you?
youtube.com,How are you doing?
facebook.com,Are you okay?
```

You can modify this file directly to add or change website-question pairs. The format is:

- First column: Website domain (without "www." or "https://")
- Second column: The question you want to display

Alternatively, you can use the extension's UI to manage the data:
1. Right-click on any webpage and select "Open Web Question Assistant"
2. Use the interface to add, edit, or delete entries

## Configuration

You can customize the extension by editing the `config.js` file:

- Change the extension name
- Modify the color theme
- Update the data source path

## Installation Instructions

### Generating Extension Icons

The extension includes an icon generator tool:

1. Open the `icon-generator.html` file in your browser
2. Click "Generate Icons" to create simple green question mark icons
3. Click "Download Icons" to save the PNG files
4. Place the downloaded icon files in the `images` folder

### Installing the Extension in Chrome

1. Download or clone this repository to your computer
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" button that appears
5. Browse to the folder containing this extension and select it
6. The extension should now be installed and visible in your Chrome toolbar

### Creating a Packed Extension (.crx file)

If you want to distribute your extension:

1. After making any desired customizations, go to `chrome://extensions/`
2. Make sure Developer mode is enabled (toggle in top right)
3. Click the "Pack extension" button
4. In the "Extension root directory" field, browse to your extension folder
5. (Optional) If you've packaged this extension before, you can provide the private key file
6. Click "Pack Extension"
7. Chrome will create two files:
   - `.crx` file: The packaged extension
   - `.pem` file: The private key (if you didn't specify one)
8. Store the `.pem` file securely if you plan to update your extension later

### Installing from a Packed Extension

To install the packed `.crx` file:

1. In Chrome, go to `chrome://extensions/`
2. Enable Developer mode
3. Drag and drop the `.crx` file onto the extensions page
4. Click "Add extension" when prompted

### Publishing to Chrome Web Store

For wider distribution:

1. Create a developer account at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Compress your extension folder into a ZIP file
3. Go to the dashboard and click "New Item"
4. Upload the ZIP file
5. Fill in all required store listing information
6. Pay the one-time developer registration fee (if you haven't already)
7. Submit for review

## Quick Packaging Guide

For your convenience, this project includes two methods to package the extension:

### Using the Batch File (Windows)

1. Double-click the `package.bat` file
2. A ZIP file named `web-question-assistant.zip` will be created in the same directory
3. This ZIP file can be used for manual installation or Chrome Web Store submission

### Using npm (Cross-platform)

If you have Node.js installed:

1. Run `npm run package` in the project directory
2. This will create a ZIP file excluding unnecessary development files

## Troubleshooting

- If the extension isn't working, check the console for errors by right-clicking the extension icon and selecting "Inspect popup"
- Make sure your data.csv file is properly formatted with no trailing commas
- Verify that the permissions in manifest.json match the functionality you need

## License

This project is licensed under the MIT License - see the LICENSE file for details. 