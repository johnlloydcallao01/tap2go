# Proper Merchant Testing Guide

This guide provides the correct PowerShell commands to successfully test the merchant location functionality with proper distance calculations.

# Run Geocoding First
$address = "Daneyah's Place, 1967A, 1008 Luzon Ave, Sampaloc, Manila, 1008 Metro Manila"; $apiKey = "AIzaSyAMJO82LtLjj81N1sfQkQVZLygmF4hggEQ"; $encodedAddress = [System.Web.HttpUtility]::UrlEncode($address); $url = "https://maps.googleapis.com/maps/api/geocode/json?address=$encodedAddress&key=$apiKey&region=ph&language=en"; Write-Host "Geocoding address: $address"; Write-Host "URL: $url"; $response = Invoke-RestMethod -Uri $url -Method Get; Write-Host "Status: $($response.status)"; if ($response.status -eq "OK") { $result = $response.results[0]; Write-Host "Formatted Address: $($result.formatted_address)"; Write-Host "Latitude: $($result.geometry.location.lat)"; Write-Host "Longitude: $($result.geometry.location.lng)"; Write-Host "Place ID: $($result.place_id)"; Write-Host "Location Type: $($result.geometry.location_type)"; } else { Write-Host "Error: $($response.error_message)"; } 

## Prerequisites

- API Key: `1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae`
- CMS Endpoint: `https://cms.tap2goph.com/api/merchants-by-location`
- PowerShell terminal access

## Complete Test Command

Use this PowerShell command to test merchant location functionality with proper distance display:

```powershell
$lat = 14.6030095; $lng = 120.970585; $limit = 20; $apiKey = "1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae"; $response = Invoke-RestMethod -Uri "https://cms.tap2goph.com/api/merchants-by-location?latitude=$lat&longitude=$lng&radius=100000&limit=$limit" -Method Get -Headers @{ "Authorization" = "users API-Key $apiKey"; "Content-Type" = "application/json" }; Write-Host "=== DIVISORIA MALL - MERCHANT DISTANCES ==="; Write-Host "Search Location: $lat, $lng"; Write-Host ""; Write-Host "MERCHANTS FOUND: $($response.data.merchants.Count)"; Write-Host ""; foreach ($merchant in $response.data.merchants) { $maxRadius = [math]::Max($merchant.delivery_radius_meters, $merchant.max_delivery_radius_meters); Write-Host "Business: $($merchant.outletName)"; Write-Host "Distance: $($merchant.distanceMeters) meters ($($merchant.distanceKm) km)"; Write-Host "Status: $($merchant.operationalStatus)"; Write-Host "Merchant's Delivery Radius: $($merchant.delivery_radius_meters) meters ($([math]::Round($merchant.delivery_radius_meters/1000, 1)) km)"; Write-Host "Merchant's Max Delivery Radius: $($merchant.max_delivery_radius_meters) meters ($([math]::Round($merchant.max_delivery_radius_meters/1000, 1)) km)"; Write-Host "Effective Radius Used: $maxRadius meters ($([math]::Round($maxRadius/1000, 1)) km)"; Write-Host "Within Merchant's Delivery Radius: $($merchant.isWithinDeliveryRadius)"; Write-Host "Estimated Delivery Time: $($merchant.estimatedDeliveryTime) minutes"; Write-Host "Address: $($merchant.activeAddress.formatted_address)"; Write-Host "---"; } Write-Host "Performance: $($response.data.performance.queryTimeMs)ms using $($response.data.performance.optimizationUsed)" 
```

## Key Property Names for Distance

**IMPORTANT**: The correct property names for distance values are:
- `distanceMeters` - Distance in meters
- `distanceKm` - Distance in kilometers
- NOT `distance` (this property exists but returns empty values)

## Expected Output Format

```
=== PUREZA, MANILA - MERCHANT DISTANCES ===
Search Location: 14.6015284, 121.00447
Search Radius: 5000 meters

MERCHANTS FOUND: 2

Business: [Business Name]
Distance: 3289 meters (3.289 km)
Status: [Status]
Delivery Radius: 30000 meters
Within Delivery Radius: True
Estimated Delivery Time: 36 minutes
Address: Barangay 660, Ermita, Manila, 1000 Metro Manila, Philippines
---
Performance: 1590ms using google_maps_distance_matrix_api
```

## Testing Different Locations

To test other locations, modify the `$lat` and `$lng` variables:

### Example Locations:

1. **UST Area (Manila)**:
   ```powershell
   $lat = 14.6091; $lng = 121.0223
   ```

2. **Estero de San Miguel, Manila**:
   ```powershell
   $lat = 14.5995; $lng = 120.9842
   ```

3. **Novaliches Proper, Quezon City**:
   ```powershell
   $lat = 14.7608; $lng = 121.0317
   ```

## Geocoding Addresses First

If you need to geocode an address to coordinates first, use this command:

```powershell
$address = "Your Address Here"; $apiKey = "1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae"; $geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=$([System.Web.HttpUtility]::UrlEncode($address))&key=$apiKey"; $geocodeResponse = Invoke-RestMethod -Uri $geocodeUrl -Method Get; if ($geocodeResponse.status -eq "OK") { $location = $geocodeResponse.results[0].geometry.location; Write-Host "Address: $($geocodeResponse.results[0].formatted_address)"; Write-Host "Latitude: $($location.lat)"; Write-Host "Longitude: $($location.lng)"; } else { Write-Host "Geocoding failed: $($geocodeResponse.status)" }
```

## Troubleshooting

### Common Issues:

1. **Empty distance values**: Make sure to use `distanceMeters` and `distanceKm` properties, not `distance`
2. **No merchants found**: Increase the radius parameter or try different coordinates
3. **API errors**: Verify the API key is correct and has proper permissions

### Performance Indicators:

- Query should complete in 1000-2000ms
- Should use `google_maps_distance_matrix_api` for optimization
- Distance calculations should be 100% successful for found merchants

## API Response Structure

The response includes:
- `success`: Boolean indicating if the request was successful
- `data.merchants`: Array of merchant objects with distance information
- `data.performance`: Performance metrics including query time and optimization method
- `metadata`: Request metadata including timestamp and request ID

## Notes

- All distances are calculated using Google Maps Distance Matrix API
- Travel mode is set to `TWO_WHEELER` for delivery optimization
- Merchants must be within the specified radius to appear in results
- Each merchant includes delivery radius and estimated delivery time information