@echo off
echo Packaging Web Question Assistant extension...

if exist web-question-assistant.zip (
    del web-question-assistant.zip
)

powershell -Command "Compress-Archive -Path *.js,*.json,*.html,*.md,LICENSE,data,images,popup,styles,utils -DestinationPath web-question-assistant.zip"

echo Package created: web-question-assistant.zip
echo You can now upload this ZIP file to the Chrome Web Store or install it manually. 