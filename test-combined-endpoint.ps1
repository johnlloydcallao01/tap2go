# Test the new combined merchant checkout delivery endpoint
Write-Host " Testing new combined endpoint: GET /api/merchant/checkout-delivery" -ForegroundColor Green

$startTime = Get-Date
$uri = "https://cms.tap2goph.com/api/merchant/checkout-delivery?customerId=3"
$headers = @{
    "Authorization" = "users API-Key 6b5b8b5b-8b5b-4b5b-8b5b-8b5b8b5b8b5b"
    "Content-Type" = "application/json"
}

try {
    Write-Host " Making request to: $uri" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host " SUCCESS! Response received in $duration ms" -ForegroundColor Green
    Write-Host " Response Summary:" -ForegroundColor Cyan
    Write-Host "  - Customer ID: $($response.data.customer.id)" -ForegroundColor White
    Write-Host "  - Active Address ID: $($response.data.customer.activeAddressId)" -ForegroundColor White
    Write-Host "  - Coordinates: ($($response.data.address.latitude), $($response.data.address.longitude))" -ForegroundColor White
    Write-Host "  - Merchants Found: $($response.data.merchants.Count)" -ForegroundColor White
    Write-Host "  - Total Count: $($response.data.totalCount)" -ForegroundColor White
    Write-Host "  - Server Response Time: $($response.metadata.performance.responseTime)" -ForegroundColor White
    
    if ($response.data.merchants.Count -gt 0) {
        Write-Host " First Merchant:" -ForegroundColor Magenta
        $firstMerchant = $response.data.merchants[0]
        Write-Host "  - Name: $($firstMerchant.name)" -ForegroundColor White
        Write-Host "  - Distance: $($firstMerchant.distance_km) km" -ForegroundColor White
        Write-Host "  - Delivery Time: $($firstMerchant.estimated_delivery_time_minutes) minutes" -ForegroundColor White
    }
    
    Write-Host "
 ENDPOINT TEST SUCCESSFUL!" -ForegroundColor Green
    
} catch {
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    Write-Host " ERROR after $duration ms:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
