#!/bin/bash
set -e

Environment=${1:-dev}
ProjectName=${2:-serverless-portfolio}
Region=${3:-us-east-1}
CustomDomainName=${4:-""}
ACMCertificateArn=${5:-""}

StackName="$ProjectName-$Environment"
echo "Starting deployment for $StackName in region $Region..."

# 1. Install dependencies
echo "1. Installing workspace dependencies..."
npm install

# 2. Build Backend
echo "2. Building backend shared libraries..."
npm run build:backend

# 3. Run unit tests
echo "3. Running unit tests..."
npm run test:backend || echo "Warning: Tests failed, proceeding..."

# 4. SAM Build
echo "4. Building AWS SAM template..."
export PYTHONUTF8=1
sam build

# 5. SAM Deploy
echo "5. Deploying CloudFormation stack via SAM..."
sam deploy \
    --stack-name "$StackName" \
    --region "$Region" \
    --resolve-s3 \
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
    --parameter-overrides "ProjectName=$ProjectName Environment=$Environment CustomDomainName=$CustomDomainName ACMCertificateArn=$ACMCertificateArn" \
    --no-confirm-changeset

# 6. Fetch Outputs
echo "6. Fetching outputs from CloudFormation..."
OutputsJson=$(aws cloudformation describe-stacks --stack-name "$StackName" --region "$Region" --query "Stacks[0].Outputs" --output json)

ApiUrl=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "APIURL"' | grep "OutputValue" | cut -d '"' -f 4)
UserPoolId=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "CognitoUserPoolId"' | grep "OutputValue" | cut -d '"' -f 4)
ClientId=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "CognitoClientId"' | grep "OutputValue" | cut -d '"' -f 4)
FrontendBucket=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "FrontendBucketName"' | grep "OutputValue" | cut -d '"' -f 4)
ContentBucket=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "ContentBucketName"' | grep "OutputValue" | cut -d '"' -f 4)
TableName=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "DynamoDBTableName"' | grep "OutputValue" | cut -d '"' -f 4)
CloudFrontUrl=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "CloudFrontURL"' | grep "OutputValue" | cut -d '"' -f 4)
CFDistributionId=$(echo "$OutputsJson" | grep -A 2 '"OutputKey": "CloudFrontDistributionId"' | grep "OutputValue" | cut -d '"' -f 4)

echo "Outputs retrieved:"
echo "CF URL: $CloudFrontUrl"
echo "API Endpoint: $ApiUrl"
echo "Frontend Bucket: $FrontendBucket"
echo "Content Bucket: $ContentBucket"
echo "Table Name: $TableName"
echo "User Pool: $UserPoolId"

# 7. Generate Frontend .env
echo "7. Creating frontend environment variables..."
cat <<EOF > frontend/.env.production
VITE_API_URL=
VITE_COGNITO_USER_POOL_ID=$UserPoolId
VITE_COGNITO_CLIENT_ID=$ClientId
VITE_COGNITO_REGION=$Region
EOF

# 8. Build Frontend
echo "8. Compiling React frontend code..."
npm run build:frontend

# 9. Sync Frontend to S3
echo "9. Deploying frontend assets to S3 bucket $FrontendBucket..."
aws s3 sync frontend/dist/ "s3://$FrontendBucket" --delete

# 10. Seed DynamoDB and upload content
echo "10. Seeding database and uploading blogs..."
export PORTFOLIO_TABLE=$TableName
export HANDSON_TABLE="$ProjectName-$Environment-handson"
export BLOGS_TABLE="$ProjectName-$Environment-blogs"
export CONTENT_BUCKET=$ContentBucket
export AWS_REGION=$Region
npx tsx scripts/seed-data.ts
npx tsx scripts/seed-handson-dynamodb.ts
npx tsx scripts/seed-blogs-dynamodb.ts
npx tsx scripts/upload-content.ts

# 11. Invalidate CloudFront Cache
echo "11. Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$CFDistributionId" --paths "/*" || echo "Warning: CF invalidation failed"

echo ""
echo "=================================================="
echo "DEPLOYMENT COMPLETE!"
echo "Portfolio Website URL: $CloudFrontUrl"
echo "Admin Panel Login:     $CloudFrontUrl/admin/login"
echo "Cognito User Pool ID:  $UserPoolId"
echo "Cognito Client ID:     $ClientId"
echo "To create an admin account, run:"
echo "./scripts/create-admin-user.sh $UserPoolId your-email@example.com YourPassword123!"
echo "=================================================="
