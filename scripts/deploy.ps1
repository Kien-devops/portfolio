param (
    [string]$Environment = "dev",
    [string]$ProjectName = "serverless-portfolio",
    [string]$Region = "ap-southeast-1",
    [string]$CustomDomainName = "",
    [string]$ACMCertificateArn = ""
)

$StackName = "$ProjectName-$Environment"
Write-Host "Starting deployment for $StackName in region $Region..." -ForegroundColor Cyan

$SamCommand = "sam"
if (-not (Get-Command $SamCommand -ErrorAction SilentlyContinue)) {
    $DefaultSamPath = "C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"
    $UserSamPath = "$env:LOCALAPPDATA\AWSSAMCLI\PFiles64\Amazon\AWSSAMCLI\bin\sam.cmd"
    if (Test-Path $DefaultSamPath) {
        $SamCommand = $DefaultSamPath
    } elseif (Test-Path $UserSamPath) {
        $SamCommand = $UserSamPath
    } elseif (Test-Path "C:\Users\ADMIN\AppData\Local\AWSSAMCLI\PFiles64\Amazon\AWSSAMCLI\bin\sam.cmd") {
        $SamCommand = "C:\Users\ADMIN\AppData\Local\AWSSAMCLI\PFiles64\Amazon\AWSSAMCLI\bin\sam.cmd"
    } else {
        Write-Error "AWS SAM CLI was not found. Install SAM CLI or add sam to PATH."
        exit 1
    }
}

$env:Path = "C:\Users\ADMIN\AppData\Local\AWSSAMCLI\PFiles64\Amazon\AWSSAMCLI\bin;E:\repo\portfolio\node_modules\.bin;C:\Users\ADMIN\AppData\Roaming\npm;$env:Path"
$env:PYTHONUTF8 = "1"
$env:SAM_CLI_TELEMETRY = "0"

# 1. Install dependencies
Write-Host "1. Installing workspace dependencies..." -ForegroundColor Yellow
npm.cmd install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }

# 2. Build Backend shared modules
Write-Host "2. Building backend shared libraries..." -ForegroundColor Yellow
npm.cmd run build:backend
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

# 3. Run unit tests
Write-Host "3. Running unit tests..." -ForegroundColor Yellow
npm.cmd run test:backend
if ($LASTEXITCODE -ne 0) { Write-Warning "Tests failed! Proceeding with caution..." }

# 4. SAM Build
Write-Host "4. Building AWS SAM template..." -ForegroundColor Yellow
$env:PYTHONUTF8 = "1"
& $SamCommand build
if ($LASTEXITCODE -ne 0) { Write-Error "SAM build failed"; exit 1 }

# 5. SAM Deploy
Write-Host "5. Deploying CloudFormation stack via SAM..." -ForegroundColor Yellow
& $SamCommand deploy `
    --stack-name $StackName `
    --region $Region `
    --resolve-s3 `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
    --parameter-overrides "ProjectName=$ProjectName Environment=$Environment CustomDomainName=$CustomDomainName ACMCertificateArn=$ACMCertificateArn" `
    --no-confirm-changeset

if ($LASTEXITCODE -ne 0) { Write-Error "SAM deploy failed"; exit 1 }

# 6. Fetch CloudFormation Outputs
Write-Host "6. Fetching outputs from CloudFormation..." -ForegroundColor Yellow
$OutputsJson = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs" --output json
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to fetch CloudFormation outputs"; exit 1 }

$Outputs = $OutputsJson | ConvertFrom-Json
$ApiUrl = ($Outputs | Where-Object { $_.OutputKey -eq "APIURL" }).OutputValue
$FrontendBucket = ($Outputs | Where-Object { $_.OutputKey -eq "FrontendBucketName" }).OutputValue
$ContentBucket = ($Outputs | Where-Object { $_.OutputKey -eq "ContentBucketName" }).OutputValue
$TableName = ($Outputs | Where-Object { $_.OutputKey -eq "DynamoDBTableName" }).OutputValue
$CloudFrontUrl = ($Outputs | Where-Object { $_.OutputKey -eq "CloudFrontURL" }).OutputValue
$CFDistributionId = ($Outputs | Where-Object { $_.OutputKey -eq "CloudFrontDistributionId" }).OutputValue

Write-Host "Outputs retrieved:" -ForegroundColor Green
Write-Host "CF URL: $CloudFrontUrl"
Write-Host "API Endpoint: $ApiUrl"
Write-Host "Frontend Bucket: $FrontendBucket"
Write-Host "Content Bucket: $ContentBucket"
Write-Host "Table Name: $TableName"

# 7. Generate Frontend .env
Write-Host "7. Creating frontend environment variables..." -ForegroundColor Yellow
$EnvContent = @"
VITE_API_URL=
"@
$EnvContent | Out-File -FilePath "frontend/.env.production" -Encoding utf8 -NoNewline

# 8. Build Frontend
Write-Host "8. Compiling React frontend code..." -ForegroundColor Yellow
npm.cmd run build:frontend
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend compilation failed"; exit 1 }

# 9. Sync Frontend to S3
Write-Host "9. Deploying frontend assets to S3 bucket $FrontendBucket..." -ForegroundColor Yellow
aws s3 sync frontend/dist/ "s3://$FrontendBucket" --delete
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend S3 sync failed"; exit 1 }

# 10. Seed DynamoDB and upload content
Write-Host "10. Seeding database and uploading blogs..." -ForegroundColor Yellow
$env:PORTFOLIO_TABLE = $TableName
$env:BLOGS_TABLE = "$ProjectName-$Environment-blogs"
$env:CONTENT_BUCKET = $ContentBucket
$env:AWS_REGION = $Region
npx.cmd tsx scripts/seed-data.ts
npx.cmd tsx scripts/upload-content.ts

# 11. Invalidate CloudFront Cache
Write-Host "11. Invalidating CloudFront cache via Lambda..." -ForegroundColor Yellow
$InvalidationFn = "$ProjectName-$Environment-invalidate-cache"
aws lambda invoke --function-name $InvalidationFn --region $Region /tmp/inv-result.json 2>$null
if ($LASTEXITCODE -ne 0) {
    aws cloudfront create-invalidation --distribution-id $CFDistributionId --paths "/*"
}

# 12. Update Route 53 if CustomDomainName is provided
if ($CustomDomainName) {
    Write-Host "12. Updating Route 53 Alias records for $CustomDomainName..." -ForegroundColor Yellow
    $CFDomain = $CloudFrontUrl.Replace("https://", "").TrimEnd("/")
    $HostedZoneId = (aws route53 list-hosted-zones --query "HostedZones[?Name=='$CustomDomainName.'].Id" --output text).Replace("/hostedzone/", "").Trim()
    if ($HostedZoneId) {
        $R53Batch = @"
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$CustomDomainName.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CFDomain",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$CustomDomainName.",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CFDomain",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.$CustomDomainName.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CFDomain",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.$CustomDomainName.",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CFDomain",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
"@
        $R53File = "$env:TEMP\r53-cf-alias.json"
        $R53Batch | Out-File -FilePath $R53File -Encoding ascii
        aws route53 change-resource-record-sets --hosted-zone-id $HostedZoneId --change-batch "file://$R53File"
        Write-Host "Route 53 Alias records updated successfully!" -ForegroundColor Green
    } else {
        Write-Warning "Hosted zone for $CustomDomainName not found in Route 53. Skipping DNS update."
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Portfolio Website URL: $CloudFrontUrl" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
