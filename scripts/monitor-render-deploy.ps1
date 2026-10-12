param(
    [int]$DurationSeconds = 120,
    [string]$OutFile = 'evidence/lab06/backend-rolling-update.json'
)

$samples = [Collections.Generic.List[object]]::new()
$watch = [Diagnostics.Stopwatch]::StartNew()
while ($watch.Elapsed.TotalSeconds -lt $DurationSeconds) {
    $status = 0
    $version = $null
    try {
        $response = Invoke-WebRequest 'https://mern-backend-235692.onrender.com/api/hello' -TimeoutSec 6
        $status = [int]$response.StatusCode
        $version = ($response.Content | ConvertFrom-Json).version
    } catch {
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    }
    $samples.Add([pscustomobject]@{utc=[DateTimeOffset]::UtcNow.ToString('o'); status=$status; version=$version})
    Start-Sleep -Seconds 1
}
$result = [pscustomobject]@{
    endpoint='https://mern-backend-235692.onrender.com/api/hello'
    samples=$samples.Count
    http200=@($samples | Where-Object status -EQ 200).Count
    failures=@($samples | Where-Object status -NE 200).Count
    observations=$samples
}
$result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutFile -Encoding utf8
Write-Output "Monitor: $($result.http200)/$($result.samples) HTTP 200, $($result.failures) phản hồi lỗi."
