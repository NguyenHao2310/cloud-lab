param(
    [ValidatePattern('^[a-z0-9][a-z0-9_-]+$')]
    [string]$DockerHubNamespace = 'haonguyen2310',
    [ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9_.-]*$')]
    [string]$Version = '2.0'
)

$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    foreach ($service in @('backend', 'frontend')) {
        $context = if ($service -eq 'backend') { './mern-demo/server' } else { './mern-demo/client' }
        $repository = "$DockerHubNamespace/mern-$service"
        docker build --platform linux/amd64 --provenance=false --sbom=false -t "${repository}:$Version" $context
        if ($LASTEXITCODE -ne 0) { throw "Build $service thất bại" }
        docker tag "${repository}:$Version" "${repository}:latest"
        docker push "${repository}:$Version"
        if ($LASTEXITCODE -ne 0) { throw "Push $service phiên bản $Version thất bại" }
        docker push "${repository}:latest"
        if ($LASTEXITCODE -ne 0) { throw "Push $service latest thất bại" }
    }
    Write-Output 'Docker Hub đã nhận image. Kiểm tra Deploy Hook trong Render Events và /health trước khi chốt phiên bản.'
} finally {
    Pop-Location
}
