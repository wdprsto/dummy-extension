@echo off
echo Packaging Web Question Assistant extension...

if exist web-question-assistant.zip (
    del web-question-assistant.zip
)

powershell -Command "Compress-Archive -Path *.js,*.json,*.html,*.md,LICENSE,data,images,popup,styles,utils -DestinationPath web-question-assistant.zip"

echo Package created: web-question-assistant.zip
echo You can now upload this ZIP file to the Chrome Web Store or install it manually.
echo.
echo To install:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable Developer mode using the toggle in the top right
echo 3. Click "Load unpacked" and select the folder with all extension files
echo 4. Or drag and drop the web-question-assistant.zip file onto the extensions page 