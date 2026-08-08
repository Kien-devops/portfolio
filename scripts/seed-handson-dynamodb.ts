import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const handsonDir = path.join(rootDir, "content", "handson");

const region = process.env.AWS_REGION || "ap-southeast-1";
const handsonTableName = process.env.HANDSON_TABLE || "serverless-portfolio-dev-handson";
const portfolioTableName = process.env.PORTFOLIO_TABLE || "serverless-portfolio-dev-data";

console.log(`Seeding Hands-on lab metadata into DynamoDB tables:`);
console.log(`- HandsonTable: ${handsonTableName}`);
console.log(`- PortfolioDataTable: ${portfolioTableName}`);
console.log(`- AWS Region: ${region}`);

const rawClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

async function seedHandsonToDynamoDB() {
  const files = fs.readdirSync(handsonDir);
  let seededCount = 0;

  for (const filename of files) {
    if (filename === "index.json" || !filename.endsWith(".md")) continue;

    const filePath = path.join(handsonDir, filename);
    const cleanSlug = filename.replace(/\.md$/, "").trim();
    const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const lines = content.split("\n");

    // Status check
    const isDone = filename.includes("✔️");
    const isPause = filename.includes("⏸️");
    const statusTag = isDone ? "Done" : isPause ? "In Progress" : "Lab";

    // Extract title
    let title = cleanSlug;
    const titleLine = lines.find((l) => l.trim().startsWith("# "));
    if (titleLine) {
      title = titleLine
        .replace(/^#\s*/, "")
        .replace(/^[🛠️📌🚀🎯]\s*/, "")
        .trim();
    }

    // Extract summary
    let rawSummaryText = "";
    const overviewIdx = lines.findIndex(
      (l) => l.includes("1. Tổng quan") || l.includes("Scenario") || l.includes("Kiến thức")
    );
    if (overviewIdx !== -1) {
      rawSummaryText = lines.slice(overviewIdx + 1, overviewIdx + 8).join(" ");
    } else {
      rawSummaryText = lines.slice(1, 12).join(" ");
    }

    const summary =
      rawSummaryText
        .replace(/<[^>]*>/g, "")
        .replace(/[#*`>-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160) + "...";

    // Detect category
    let category = "AWS DevOps";
    if (content.match(/Amazon S3|S3 Bucket/i)) category = "AWS S3";
    else if (content.match(/Lambda|Serverless/i)) category = "AWS Lambda";
    else if (content.match(/DynamoDB/i)) category = "AWS DynamoDB";
    else if (content.match(/CloudFront/i)) category = "AWS CloudFront";
    else if (content.match(/ECS|Fargate|Docker/i)) category = "Containers";
    else if (content.match(/VPC|Subnet|NAT Gateway/i)) category = "Networking";
    else if (content.match(/IAM|Cognito|KMS|Security|Macie/i)) category = "Security & IAM";
    else if (content.match(/API Gateway/i)) category = "API Gateway";

    const tags = ["AWS", "DVA-C02", category, statusTag];

    const handsonItem = {
      slug: cleanSlug,
      title,
      summary,
      category,
      difficulty: isDone ? "Intermediate" : "Advanced",
      estimatedTime: "~20 min",
      tags,
      published: true,
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 30)).toISOString(),
      updatedAt: new Date().toISOString(),
      prerequisites: [
        "Tài khoản AWS (Free Tier)",
        "Kiến thức đề thi AWS Certified Developer Associate (DVA-C02)",
      ],
    };

    // 1. Put into dedicated HandsonTable
    try {
      await docClient.send(
        new PutCommand({
          TableName: handsonTableName,
          Item: handsonItem,
        })
      );
    } catch (err: any) {
      console.warn(`Could not seed to HandsonTable (${handsonTableName}): ${err.message}`);
    }

    // 2. Put into Single Table PortfolioDataTable
    try {
      await docClient.send(
        new PutCommand({
          TableName: portfolioTableName,
          Item: {
            PK: "HANDSON",
            SK: `HANDSON#${cleanSlug}`,
            ...handsonItem,
          },
        })
      );
    } catch (err: any) {
      console.warn(`Could not seed to PortfolioDataTable (${portfolioTableName}): ${err.message}`);
    }

    seededCount++;
  }

  console.log(`✅ Successfully seeded ${seededCount} lab metadata items to AWS DynamoDB!`);
}

seedHandsonToDynamoDB().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
