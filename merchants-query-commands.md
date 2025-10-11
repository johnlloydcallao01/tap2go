All Successful Query Commands for Merchants in Relationship to Customers

1.Geocoding an Address

$apiKey = "AIzaSyAMJO82LtLjj81N1sfQkQVZLygmF4hggEQ"
$address = "Pagadian City - Zamboanga City Rd, Ipil, Zamboanga Sibugay, Philippines"
$encodedAddress = [System.Uri]::EscapeDataString($address)
$url = "https://maps.googleapis.com/maps/api/geocode/json?address=$encodedAddress&key=$apiKey"
Write-Host "Testing URL: $url"
$response = Invoke-RestMethod -Uri $url -Method Get
Write-Host "Status: $($response.status)"
if ($response.status -eq "OK") {
    Write-Host "✅ API Key is working!"
    Write-Host "Sample coordinates:"
    Write-Host "Latitude: $($response.results[0].geometry.location.lat)"
    Write-Host "Longitude: $($response.results[0].geometry.location.lng)"
} else {
    Write-Host "❌ Error: $($response.error_message)"
} 


2. Customer Address Coordinates

$headers = @{
    'Authorization' = 'users API-Key 1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae'
    'Content-Type' = 'application/json'
}

Write-Host "=== COMPLETE CHAIN: CUSTOMER 3 -> ACTIVE_ADDRESS_ID -> COORDINATES ===" -ForegroundColor Green

# Step 1: Get customer 3 and extract active_address_id
Write-Host "`nStep 1: Query Customer ID 3" -ForegroundColor Yellow
$customer = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/customers/3" -Method GET -Headers $headers
$activeAddressId = $customer.activeAddress.id
Write-Host "Customer ID: $($customer.id)" -ForegroundColor White
Write-Host "Active Address ID: $activeAddressId" -ForegroundColor Cyan

# Step 2: Query addresses table for that active_address_id to get coordinates
Write-Host "`nStep 2: Query Addresses Table for ID $activeAddressId" -ForegroundColor Yellow
$address = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/addresses/$activeAddressId" -Method GET -Headers $headers
Write-Host "Address ID: $($address.id)" -ForegroundColor White
Write-Host "Formatted Address: $($address.formatted_address)" -ForegroundColor White
Write-Host "Latitude: $($address.latitude)" -ForegroundColor Cyan
Write-Host "Longitude: $($address.longitude)" -ForegroundColor Cyan

Write-Host "`n=== FINAL RESULT ===" -ForegroundColor Green
Write-Host "Customer ID 3 -> Active Address ID $activeAddressId -> Coordinates: $($address.latitude), $($address.longitude)" -ForegroundColor White




3. Merchants Query by Location

$lat = 14.6030095; $lng = 120.970585; $limit = 20; $apiKey = "1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae"; $response = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/merchants-by-location?latitude=$lat&longitude=$lng&radius=100000&limit=$limit" -Method Get -Headers @{ "Authorization" = "users API-Key $apiKey"; "Content-Type" = "application/json" }; Write-Host "=== DIVISORIA MALL - MERCHANT DISTANCES ==="; Write-Host "Search Location: $lat, $lng"; Write-Host ""; Write-Host "MERCHANTS FOUND: $($response.data.merchants.Count)"; Write-Host ""; foreach ($merchant in $response.data.merchants) { $maxRadius = [math]::Max($merchant.delivery_radius_meters, $merchant.max_delivery_radius_meters); Write-Host "Business: $($merchant.outletName)"; Write-Host "Distance: $($merchant.distanceMeters) meters ($($merchant.distanceKm) km)"; Write-Host "Status: $($merchant.operationalStatus)"; Write-Host "Merchant's Delivery Radius: $($merchant.delivery_radius_meters) meters ($([math]::Round($merchant.delivery_radius_meters/1000, 1)) km)"; Write-Host "Merchant's Max Delivery Radius: $($merchant.max_delivery_radius_meters) meters ($([math]::Round($merchant.max_delivery_radius_meters/1000, 1)) km)"; Write-Host "Effective Radius Used: $maxRadius meters ($([math]::Round($maxRadius/1000, 1)) km)"; Write-Host "Within Merchant's Delivery Radius: $($merchant.isWithinDeliveryRadius)"; Write-Host "Estimated Delivery Time: $($merchant.estimatedDeliveryTime) minutes"; Write-Host "Address: $($merchant.activeAddress.formatted_address)"; Write-Host "---"; } Write-Host "Performance: $($response.data.performance.queryTimeMs)ms using $($response.data.performance.optimizationUsed)" 






4. COMBINED QUERY
$headers = @{
    'Authorization' = 'users API-Key 1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae'
    'Content-Type' = 'application/json'
}

Write-Host "=== COMPLETE CHAIN: CUSTOMER 3 -> ACTIVE_ADDRESS_ID -> COORDINATES -> NEARBY MERCHANTS ===" -ForegroundColor Green

# Step 1: Get customer 3 and extract active_address_id
Write-Host "`nStep 1: Query Customer ID 3" -ForegroundColor Yellow
$customer = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/customers/3" -Method GET -Headers $headers
$activeAddressId = $customer.activeAddress.id
Write-Host "Customer ID: $($customer.id)" -ForegroundColor White
Write-Host "Active Address ID: $activeAddressId" -ForegroundColor Cyan

# Step 2: Query addresses table for that active_address_id to get coordinates
Write-Host "`nStep 2: Query Addresses Table for ID $activeAddressId" -ForegroundColor Yellow
$address = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/addresses/$activeAddressId" -Method GET -Headers $headers
$lat = $address.latitude
$lng = $address.longitude
Write-Host "Address ID: $($address.id)" -ForegroundColor White
Write-Host "Formatted Address: $($address.formatted_address)" -ForegroundColor White
Write-Host "Latitude: $lat" -ForegroundColor Cyan
Write-Host "Longitude: $lng" -ForegroundColor Cyan

# Step 3: Use the coordinates to find nearby merchants
Write-Host "`nStep 3: Query Merchants Near Customer's Location" -ForegroundColor Yellow
$limit = 20
$response = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/merchants-by-location?latitude=$lat&longitude=$lng&radius=100000&limit=$limit" -Method Get -Headers $headers

Write-Host "`n=== CUSTOMER 3's LOCATION - MERCHANT DISTANCES ===" -ForegroundColor Green
Write-Host "Customer Location: $lat, $lng" -ForegroundColor Cyan
Write-Host "Customer Address: $($address.formatted_address)" -ForegroundColor White
Write-Host ""
Write-Host "MERCHANTS FOUND: $($response.data.merchants.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($merchant in $response.data.merchants) {
    $maxRadius = [math]::Max($merchant.delivery_radius_meters, $merchant.max_delivery_radius_meters)
    Write-Host "Business: $($merchant.outletName)" -ForegroundColor White
    Write-Host "Distance: $($merchant.distanceMeters) meters ($($merchant.distanceKm) km)" -ForegroundColor Cyan
    Write-Host "Status: $($merchant.operationalStatus)" -ForegroundColor White
    Write-Host "Merchant's Delivery Radius: $($merchant.delivery_radius_meters) meters ($([math]::Round($merchant.delivery_radius_meters/1000, 1)) km)" -ForegroundColor White
    Write-Host "Merchant's Max Delivery Radius: $($merchant.max_delivery_radius_meters) meters ($([math]::Round($merchant.max_delivery_radius_meters/1000, 1)) km)" -ForegroundColor White
    Write-Host "Effective Radius Used: $maxRadius meters ($([math]::Round($maxRadius/1000, 1)) km)" -ForegroundColor White
    Write-Host "Within Merchant's Delivery Radius: $($merchant.isWithinDeliveryRadius)" -ForegroundColor $(if($merchant.isWithinDeliveryRadius) {"Green"} else {"Red"})
    Write-Host "Estimated Delivery Time: $($merchant.estimatedDeliveryTime) minutes" -ForegroundColor White
    Write-Host "Address: $($merchant.activeAddress.formatted_address)" -ForegroundColor Gray
    Write-Host "---" -ForegroundColor Gray
}

Write-Host "`nPerformance: $($response.data.performance.queryTimeMs)ms using $($response.data.performance.optimizationUsed)" -ForegroundColor Yellow 