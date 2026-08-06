# AWS Serverless Portfolio Website

A complete, high-performance, and cost-optimized developer portfolio website built using React, Vite, Tailwind CSS, TypeScript, and a 100% serverless backend on AWS (Lambda, API Gateway, DynamoDB, Cognito, S3, and CloudFront).

---

## 1. Architecture & Request Flow

This project follows the **AWS Well-Architected Framework** for serverless workloads. All S3 buckets are private, and content delivery is fully mediated by CloudFront with Origin Access Control (OAC).

```
                        [ Visitor / Admin Browser ]
                                     │
                                     ▼
                        [ Amazon CloudFront CDN ]
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │ /                       │ /content/*              │ /api/*
           ▼                         ▼                         ▼
   [ S3 Frontend ]           [ S3 Content ]            [ API Gateway ]
   - index.html              - blogs/index.json        (HTTP API)
   - JS/CSS bundles          - blogs/{slug}.json               │
   - Static assets           - images/blogs/*                  ▼
                             - images/projects/*       [ AWS Lambda ]
                             - images/profile/*                │
                                                               ├──────────────┐
                                                               ▼              ▼
                                                         [ DynamoDB ]    [ S3 Content ]
                                                         - Profile       - Blog CRUDs
                                                         - Skills
                                                         - Experience
                                                         - Education
                                                         - Contacts
```

### Path Behaviors
1. **Default Cache Behavior (`*`)**: Points to the **Frontend S3 Bucket** containing compiled React code.
2. **Static Content Behavior (`/content/*`)**: Points to the **Content S3 Bucket**. It associates a viewer-request **CloudFront Function** to strip the `/content` prefix, allowing objects (e.g. `blogs/index.json`, WebP images) to be stored at the root of the S3 bucket.
3. **API Behavior (`/api/*`)**: Points to **Amazon API Gateway HTTP API**. Cache is disabled, and headers (such as `Authorization`) are forwarded to enable Cognito JWT authentication.

---

## 2. Technical Stack

* **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS v4, React Router 6, Lucide React, and Marked (Markdown parser).
* **Backend**: Node.js 20, TypeScript, AWS SDK for JavaScript v3, AWS Lambda, API Gateway HTTP API, DynamoDB Document Client.
* **Infrastructure**: AWS SAM (Serverless Application Model), CloudFormation, Cognito User Pools.
* **Automation**: PowerShell & Bash deployment, Cognito provisioning, and database seeding scripts.

---

## 3. Directory Layout

```
portfolio/
├── frontend/                     # React Single Page App (Vite + TS + Tailwind v4)
│   ├── src/
│   │   ├── components/           # ThemeToggle, Header, Footer
│   │   ├── layouts/              # Main Layout, Protected Admin Layout
│   │   ├── pages/                # Home, BlogDetail, AdminLogin, AdminDashboard
│   │   ├── services/             # API client, Cognito Authentication client
│   │   ├── types/                # Shared TypeScript structures
│   │   └── App.tsx               # Client router setup
│   └── package.json
├── backend/                      # Lambda Handlers (TypeScript)
│   ├── functions/
│   │   ├── portfolio-read/       # Public GET endpoints (profile, projects, skills, etc.)
│   │   ├── portfolio-admin/      # Admin CRUD endpoints (secured by Cognito)
│   │   ├── contact/              # Public contact form submission & Admin inbox management
│   │   └── blog-admin/           # Admin S3 blog CRUD (writes JSON and updates index.json)
│   ├── shared/                   # Shared DB client, S3 client, responses, validations
│   └── package.json
├── content/                      # Source of truth for local mock content & S3 seeding
│   ├── blogs/                    # Markdown blog posts (.json)
│   └── images/                   # Profile, project, and blog pictures
├── scripts/                      # Deployment and admin utility scripts
│   ├── seed-data.ts              # Seeds DynamoDB tables
│   ├── upload-content.ts         # Generates mock assets and uploads to S3 Content
│   ├── deploy.ps1 / deploy.sh    # Coordinates build, SAM deploy, S3 upload, and invalidations
│   └── create-admin-user.ps1     # Creates Cognito Admin User via AWS CLI
└── template.yaml                 # AWS SAM infrastructure definition
```

---

## 4. Local Development Setup

To run this repository locally, follow these steps:

### Prerequisites
1. **Node.js**: Install Node.js LTS (v20+ recommended).
2. **AWS CLI**: Install the [AWS CLI](https://aws.amazon.com/cli/) and run `aws configure` to set up credentials (only required if deploying to AWS).
3. **AWS SAM CLI**: Install the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) (only required if building/deploying infrastructure).

### Step 1: Install Dependencies
Install dependencies at the root workspace:
```bash
npm install
```

### Step 2: Seed Mock Assets Locally
Generate local placeholder images and mock blogs for the frontend to read offline (this mirrors assets to `frontend/public/content/`):
```bash
npx tsx scripts/upload-content.ts
```

### Step 3: Run Frontend
Start the local Vite development server:
```bash
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Login to Local Admin Panel
When running locally without Cognito configured, the frontend detects this and runs in **Local Mock Mode**. 
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and use the credentials:
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

---

## 5. Running Tests

Run the backend unit tests (covers validation rules, honeypot spam checks, and response formatting):
```bash
npm run test:backend
```

---

## 6. Deploying to AWS

We provide complete automated scripts to package, build, and deploy the entire solution.

### Automated Deployment (Windows PowerShell)
Run the script from the root workspace:
```powershell
.\scripts\deploy.ps1 -Environment dev -Region us-east-1
```

### Automated Deployment (Bash/Linux/macOS)
Run the bash script:
```bash
chmod +x ./scripts/deploy.sh ./scripts/create-admin-user.sh
./scripts/deploy.sh dev us-east-1
```

### What the Script Does:
1. Installs workspace dependencies.
2. Compiles backend TypeScript shared utilities.
3. Runs unit tests.
4. Invokes `sam build` to compile TypeScript Lambdas using `esbuild`.
5. Deploys SAM template to AWS CloudFormation, creating the DynamoDB Table, Cognito User Pool, private S3 Buckets, API Gateway, Lambdas, and CloudFront.
6. Retrieves Stack Outputs (endpoints, bucket names, etc.).
7. Generates `frontend/.env.production` containing Cognito Client IDs and AWS regions.
8. Builds the production-ready React frontend bundle.
9. Syncs the compiled React assets to the private Frontend S3 bucket.
10. Seeds DynamoDB with standard profile details, projects, and skills.
11. Generates 1x1 placeholder WebP files and uploads them along with the blog files to the Content S3 bucket, then rebuilds `blogs/index.json`.
12. Creates a CloudFront invalidation for `/*` to refresh assets instantly.

---

## 7. Creating an Admin User in Cognito

Since public registration is disabled, admin accounts must be created using the AWS CLI or our helper script.

### Using PowerShell:
```powershell
.\scripts\create-admin-user.ps1 -UserPoolId <UserPoolId> -Email your-email@example.com -Password YourPassword123!
```

### Using Bash:
```bash
./scripts/create-admin-user.sh <UserPoolId> your-email@example.com YourPassword123!
```

Once created, go to your CloudFront URL followed by `/admin/login`, log in with your email and password, and manage your portfolio!

---

## 8. Custom Domain Configuration (Optional)

To configure your own domain name (e.g. `yourname.com`):

1. **Request SSL Certificate**: Request a public certificate in Route 53 or ACM in the **us-east-1** region (required for CloudFront).
2. **Add Custom Domain to CloudFront**: 
   In `template.yaml`, under `CloudFrontDistribution` -> `DistributionConfig`, add:
   ```yaml
   Aliases:
     - yourname.com
   ViewerCertificate:
     AcmCertificateArn: arn:aws:acm:us-east-1:xxxx:certificate/xxxx
     SslSupportMethod: sni-only
   ```
3. **Add CNAME/A Record**: In Route 53, create an `A` record pointing to the CloudFront distribution domain name.

---

## 9. Cleanup & Resource Deletion

To completely delete the deployed resources from AWS:

1. **Empty S3 Buckets**: 
   CloudFormation will fail to delete S3 buckets if they contain objects. Empty them first via the AWS Console or using AWS CLI:
   ```bash
   aws s3 rm s3://<FrontendBucketName> --recursive
   aws s3 rm s3://<ContentBucketName> --recursive
   ```
2. **Delete CloudFormation Stack**:
   Run SAM delete at the root workspace:
   ```bash
   sam delete
   ```
   Or delete via AWS CLI:
   ```bash
   aws cloudformation delete-stack --stack-name serverless-portfolio-dev
   ```

---

## 10. Cost Estimation

Because we are using 100% AWS Serverless components, the running costs are extremely low. Under normal usage (< 1,000 visitors per month), the cost is **$0.00** (fully covered by the AWS Free Tier).

| Service | Pricing Dimension | Free Tier | Expected cost (Low Traffic) |
|---|---|---|---|
| **S3** | Storage & GET/PUT | 5 GB standard storage, 20k GET, 2k PUT | $0.00 / month |
| **Lambda** | Request & Duration | 1 million free requests per month | $0.00 / month |
| **API Gateway** | HTTP APIs requests | 1 million free requests per month | $0.00 / month |
| **DynamoDB** | Write/Read capacity | 25 GB storage, 25 WCU / 25 RCU | $0.00 / month |
| **Cognito** | Monthly Active Users | 50,000 free MAUs | $0.00 / month |
| **CloudFront** | Data Transfer | 1 TB free egress per month | $0.00 / month |

---

## 11. Security Considerations

* **Private S3 Buckets**: Static assets are private and protected with AWS Origin Access Control (OAC), blocking direct anonymous S3 access.
* **IAM Least Privilege**: Lambda execution roles have specific prefix limitations. `BlogAdminFunction` only has access to `blogs/*` and `images/*` keys.
* **Honeypot Filter**: The contact form features a hidden `website` input. Spambots filling this input are silently filtered without database write operations.
* **API Protection**: Admin REST paths are protected by API Gateway HTTP JWT Authorizers validating signatures directly against the Cognito User Pool.
