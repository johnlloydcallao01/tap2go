# Simple test for the merchant checkout delivery endpoint
Write-Host "Testing Merchant Checkout Delivery Endpoint" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Test URL
$url = "https://cms.tap2goph.com/api/merchant/checkout-delivery?customerId=3"
$apiKey = "1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae"

Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "API Key: $apiKey" -ForegroundColor Yellow
Write-Host ""

# Test different authentication methods
Write-Host "Testing different authentication methods:" -ForegroundColor Green

# Method 1: Authorization Bearer
Write-Host "1. Testing Authorization: Bearer header..." -ForegroundColor White
try {
    $response1 = Invoke-WebRequest -Uri $url -Method GET -Headers @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "Success with Bearer token!" -ForegroundColor Green
    Write-Host "Status: $($response1.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Failed with Bearer token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Method 2: X-API-Key header
Write-Host "2. Testing X-API-Key header..." -ForegroundColor White
try {
    $response2 = Invoke-WebRequest -Uri $url -Method GET -Headers @{
        "X-API-Key" = $apiKey
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "Success with X-API-Key!" -ForegroundColor Green
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Failed with X-API-Key: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Method 3: API-Key header
Write-Host "3. Testing API-Key header..." -ForegroundColor White
try {
    $response3 = Invoke-WebRequest -Uri $url -Method GET -Headers @{
        "API-Key" = $apiKey
        "Content-Type" = "application/json"
    } -ErrorAction Stop
    Write-Host "Success with API-Key!" -ForegroundColor Green
    Write-Host "Status: $($response3.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Failed with API-Key: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host "Note: 401 errors are expected if the endpoint is not deployed or API key is not properly configured." -ForegroundColor Yellow