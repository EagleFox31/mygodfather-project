$headers = @{
    'Content-Type' = 'application/json'
}
$body = Get-Content -Raw -Path "test_data_matching_v2.json"
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/matching" -Method Post -Headers $headers -Body $body
$response.Content > "matching_result.txt"
Get-Content "matching_result.txt"
