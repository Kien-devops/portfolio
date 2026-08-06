param (
    [Parameter(Mandatory=$true)]
    [string]$UserPoolId,
    [Parameter(Mandatory=$true)]
    [string]$Email,
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "Creating admin user: $Email in user pool: $UserPoolId..." -ForegroundColor Cyan

# 1. Admin Create User
aws cognito-idp admin-create-user `
    --user-pool-id $UserPoolId `
    --username $Email `
    --user-attributes Name=email,Value=$Email Name=email_verified,Value=true `
    --message-action SUPPRESS

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create Cognito user."
    exit $LASTEXITCODE
}

# 2. Set permanent password
aws cognito-idp admin-set-user-password `
    --user-pool-id $UserPoolId `
    --username $Email `
    --password $Password `
    --permanent

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set Cognito user password."
    exit $LASTEXITCODE
}

Write-Host "Admin user $Email created successfully and password set as permanent!" -ForegroundColor Green
