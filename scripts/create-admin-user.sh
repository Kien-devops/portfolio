#!/bin/bash
set -e

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <user-pool-id> <email> <password>"
    exit 1
fi

USER_POOL_ID=$1
EMAIL=$2
PASSWORD=$3

echo "Creating admin user: $EMAIL in user pool: $USER_POOL_ID..."

# 1. Create User
aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
    --message-action SUPPRESS

# 2. Set password
aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --password "$PASSWORD" \
    --permanent

echo "Admin user $EMAIL created successfully and password set as permanent!"
