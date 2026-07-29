param(
    [string]$SeedFile = (Join-Path $PSScriptRoot 'seed_demo_data.sql')
)

$ErrorActionPreference = 'Stop'

function Import-DotEnvFile {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Database environment file was not found: $Path"
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $separator = $trimmed.IndexOf('=')
        if ($separator -lt 1) { continue }

        $key = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim().Trim('"').Trim("'")
        if ($key -in @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD')) {
            Set-Item -Path "Env:$key" -Value $value
        }
    }
}

$serverRoot = Split-Path -Parent $PSScriptRoot
Import-DotEnvFile -Path (Join-Path $serverRoot '.env')

foreach ($key in 'DB_URL', 'DB_USERNAME', 'DB_PASSWORD') {
    if ([string]::IsNullOrWhiteSpace((Get-Item -Path "Env:$key" -ErrorAction SilentlyContinue).Value)) {
        throw "Missing $key in gnostica-server/.env"
    }
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found. Install PostgreSQL command-line tools or open the SQL file in DBeaver.'
}

if (-not (Test-Path -LiteralPath $SeedFile)) {
    throw "Seed file was not found: $SeedFile"
}

# psql reads credentials from the process environment. They are never printed.
$env:PGPASSWORD = $env:DB_PASSWORD
try {
    & psql --set ON_ERROR_STOP=1 --dbname=$env:DB_URL --username=$env:DB_USERNAME --file=$SeedFile
    if ($LASTEXITCODE -ne 0) { throw "Seed script failed with exit code $LASTEXITCODE" }
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
