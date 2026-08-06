# AWS Serverless Portfolio Website

A complete, high-performance, and cost-optimized developer portfolio website built using React, Vite, TypeScript, and a 100% serverless backend on AWS (Lambda, API Gateway, DynamoDB, Cognito, S3, and CloudFront).

**Live Demo**: [https://www.kiendev.site](https://www.kiendev.site)

---

## 1. Architecture & Request Flow

This project follows the **AWS Well-Architected Framework** for serverless workloads. All S3 buckets are private, and content delivery is fully mediated by CloudFront with Origin Access Control (OAC).

```
                        [ Visitor / Admin Browser ]
                                     │
                                     ▼
                        [ Amazon CloudFront CDN ]
                          (www.kiendev.site / kiendev.site)
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
2. **Static Content Behavior (`/content/*`)**: Points to the **Content S3 Bucket**. Associates a viewer-request **CloudFront Function** to strip the `/content` prefix.
3. **API Behavior (`/api/*`)**: Points to **Amazon API Gateway HTTP API**. Cache is disabled, and headers (such as `Authorization`) are forwarded for Cognito JWT authentication.

---

## 2. Technical Stack

* **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS v4, React Router 6, Lucide React, Marked (Markdown parser).
* **Backend**: Node.js 20, TypeScript, AWS SDK v3, AWS Lambda, API Gateway HTTP API, DynamoDB Document Client.
* **Infrastructure**: AWS SAM (Serverless Application Model), CloudFormation, Cognito User Pools, ACM (SSL/TLS), CloudFront OAC.
* **Automation**: PowerShell & Bash deployment scripts, Cognito provisioning, database seeding.
* **Optimization**: On-demand Lambda concurrency, DynamoDB PAY_PER_REQUEST billing, 5-minute EventBridge warm-start schedule.

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
│   ├── blogs/                    # Blog posts (.json)
│   └── images/                   # Profile, project, and blog pictures
├── scripts/                      # Deployment and admin utility scripts
│   ├── seed-data.ts              # Seeds DynamoDB tables
│   ├── upload-content.ts         # Generates mock assets and uploads to S3 Content bucket
│   ├── deploy.ps1                # Windows: build, SAM deploy, S3 upload, cache invalidation
│   ├── deploy.sh                 # Linux/macOS: same as above
│   └── create-admin-user.ps1     # Creates Cognito Admin User via AWS CLI
└── template.yaml                 # AWS SAM infrastructure definition (IaC)
```

---

## 4. Local Development Setup

### Prerequisites
1. **Node.js**: Install Node.js LTS (v20+ recommended).
2. **AWS CLI**: Install the [AWS CLI](https://aws.amazon.com/cli/) and run `aws configure` (only required for AWS deployment).
3. **AWS SAM CLI**: Install the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) (only required for infrastructure deployment).

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed Mock Assets Locally
Generate local placeholder images and mock blogs (mirrors assets to `frontend/public/content/`):
```bash
npx tsx scripts/upload-content.ts
```

### Step 3: Run Frontend
```bash
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Local Admin Panel
When running locally without Cognito configured, the frontend runs in **Local Mock Mode**.
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login):
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

---

## 5. Running Tests

```bash
npm run test:backend
```

Covers validation rules, honeypot spam checks, and response formatting.

---

## 6. Deploying to AWS

### Basic Deployment (Windows PowerShell)
```powershell
.\scripts\deploy.ps1 -Environment dev -Region ap-southeast-1
```

### Basic Deployment (Bash/Linux/macOS)
```bash
chmod +x ./scripts/deploy.sh
./scripts/deploy.sh dev serverless-portfolio ap-southeast-1
```

### Deployment with Custom Domain
If you have a custom domain with an ACM certificate in `us-east-1`, pass them as parameters:

```powershell
# Windows
.\scripts\deploy.ps1 `
  -Environment dev `
  -Region ap-southeast-1 `
  -CustomDomainName yourdomain.com `
  -ACMCertificateArn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
```

```bash
# Linux/macOS
./scripts/deploy.sh dev serverless-portfolio ap-southeast-1 yourdomain.com \
  arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
```

### What the Script Does
1. Installs workspace dependencies.
2. Compiles backend TypeScript shared utilities.
3. Runs unit tests.
4. Invokes `sam build` to compile TypeScript Lambdas using `esbuild`.
5. Deploys SAM template to AWS CloudFormation (DynamoDB, Cognito, S3, API Gateway, Lambdas, CloudFront).
6. Retrieves Stack Outputs (endpoints, bucket names, etc.).
7. Generates `frontend/.env.production` with Cognito Client IDs and AWS regions.
8. Builds the production-ready React frontend bundle.
9. Syncs compiled React assets to the private Frontend S3 bucket.
10. Seeds DynamoDB with profile details, projects, and skills.
11. Generates placeholder WebP files, uploads blogs to Content S3, and rebuilds `blogs/index.json`.
12. Creates a CloudFront invalidation for `/*` to refresh assets instantly.

---

## 7. Custom Domain Setup (Full Guide)

To use your own domain (e.g. `yourname.com`) with HTTPS:

### Step 1: Request SSL Certificate via ACM
```bash
aws acm request-certificate \
  --domain-name yourname.com \
  --subject-alternative-names www.yourname.com \
  --validation-method DNS \
  --region us-east-1
```

### Step 2: Add DNS Validation Records
ACM will provide two CNAME records. Add them to your DNS provider (Cloudflare, Route 53, etc.) with **Proxy/CDN disabled (DNS Only)**.

### Step 3: Wait for Certificate to be Issued
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID \
  --region us-east-1 \
  --query "Certificate.Status"
# Should return "ISSUED"
```

### Step 4: Deploy with Custom Domain
```powershell
.\scripts\deploy.ps1 `
  -Environment dev `
  -Region ap-southeast-1 `
  -CustomDomainName yourname.com `
  -ACMCertificateArn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID
```

### Step 5: Add CNAME Record for www
In your DNS provider, add:
| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `www` | `<your-cloudfront-id>.cloudfront.net` | Proxied ✅ |

---

## 8. Creating an Admin User in Cognito

Since public registration is disabled, admin accounts must be created via AWS CLI:

```powershell
# Windows
.\scripts\create-admin-user.ps1 -UserPoolId <UserPoolId> -Email your-email@example.com -Password YourPassword123!
```

```bash
# Linux/macOS
./scripts/create-admin-user.sh <UserPoolId> your-email@example.com YourPassword123!
```

Then log in at `https://your-cloudfront-url/admin/login`.

---

## 9. Cleanup & Resource Deletion

```bash
# 1. Empty S3 Buckets first
aws s3 rm s3://<FrontendBucketName> --recursive
aws s3 rm s3://<ContentBucketName> --recursive

# 2. Delete CloudFormation Stack
aws cloudformation delete-stack --stack-name serverless-portfolio-dev
```

---

## 10. Cost Estimation

Under normal usage (< 1,000 visitors/month), costs are **$0.00** (covered by the AWS Free Tier).

| Service | Pricing Dimension | Free Tier | Expected Cost |
|---|---|---|---|
| **S3** | Storage & GET/PUT | 5 GB, 20k GET, 2k PUT | $0.00 / month |
| **Lambda** | Requests & Duration | 1M requests/month | $0.00 / month |
| **API Gateway** | HTTP API requests | 1M requests/month | $0.00 / month |
| **DynamoDB** | PAY_PER_REQUEST | 25 GB storage | $0.00 / month |
| **Cognito** | Monthly Active Users | 50,000 free MAUs | $0.00 / month |
| **CloudFront** | Data Transfer | 1 TB free egress/month | $0.00 / month |
| **ACM** | SSL Certificates | Always free | $0.00 / month |

---

## 11. Security Considerations

* **Private S3 Buckets**: Static assets are private and protected with AWS Origin Access Control (OAC).
* **IAM Least Privilege**: Lambda execution roles have specific prefix limitations (e.g. `BlogAdminFunction` only accesses `blogs/*` and `images/*`).
* **Honeypot Filter**: The contact form includes a hidden `website` input to silently reject spambots.
* **API Protection**: Admin REST paths are protected by API Gateway HTTP JWT Authorizers validating against the Cognito User Pool.
* **HTTPS Enforced**: CloudFront redirects all HTTP traffic to HTTPS with TLS 1.2+ minimum.
* **Warm Start**: A 5-minute EventBridge schedule pings the read Lambda to avoid cold starts, improving user experience without paying for provisioned concurrency.
