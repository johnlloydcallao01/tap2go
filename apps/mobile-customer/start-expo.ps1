# PowerShell script to start Expo with proper environment variables
# FIXED: Enable caching for better performance

$env:EXPO_CACHE = "1"
$env:EXPO_BETA = "false"

Write-Host "Starting Expo with CACHING ENABLED for better performance..." -ForegroundColor Green
npx expo start $args
