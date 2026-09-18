import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import {
  CodePipelineClient,
  PutJobSuccessResultCommand,
  PutJobFailureResultCommand,
} from "@aws-sdk/client-codepipeline";

const cloudFrontClient = new CloudFrontClient({});
const codePipelineClient = new CodePipelineClient({});

export interface InvalidationEvent {
  distributionId?: string;
  paths?: string[];
  "CodePipeline.job"?: {
    id: string;
    data?: {
      actionConfiguration?: {
        configuration?: {
          UserParameters?: string;
        };
      };
    };
  };
}

export async function handler(event: InvalidationEvent | any): Promise<any> {
  console.log("Received cache invalidation event:", JSON.stringify(event, null, 2));

  const isCodePipeline = Boolean(event && event["CodePipeline.job"]);
  const jobId = event?.["CodePipeline.job"]?.id;

  try {
    // 1. Determine Distribution ID
    let distributionId =
      event?.distributionId || process.env.DISTRIBUTION_ID;

    // 2. Determine Paths to Invalidate
    let paths: string[] = ["/*"];

    if (isCodePipeline && event["CodePipeline.job"]?.data?.actionConfiguration?.configuration?.UserParameters) {
      const rawParams = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;
      try {
        const parsed = JSON.parse(rawParams);
        if (parsed.paths && Array.isArray(parsed.paths)) {
          paths = parsed.paths;
        } else if (typeof parsed === "string") {
          paths = [parsed];
        }
        if (parsed.distributionId) {
          distributionId = parsed.distributionId;
        }
      } catch {
        // Fallback: treat UserParameters as comma-separated paths or single path
        if (rawParams.includes(",")) {
          paths = rawParams.split(",").map((p: string) => p.trim());
        } else if (rawParams.trim()) {
          paths = [rawParams.trim()];
        }
      }
    } else if (event?.paths && Array.isArray(event.paths) && event.paths.length > 0) {
      paths = event.paths;
    }

    if (!distributionId) {
      throw new Error("Missing DISTRIBUTION_ID in environment or event parameters.");
    }

    console.log(`Creating invalidation for distribution ${distributionId} with paths:`, paths);

    const callerReference = `lambda-invalidation-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: callerReference,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    });

    const response = await cloudFrontClient.send(command);
    const invalidationId = response.Invalidation?.Id;

    console.log(`Invalidation successfully created with ID: ${invalidationId}`);

    // If invoked by CodePipeline, report job success
    if (isCodePipeline && jobId) {
      await codePipelineClient.send(
        new PutJobSuccessResultCommand({
          jobId,
          outputVariables: {
            InvalidationId: invalidationId || "",
          },
        })
      );
    }

    return {
      statusCode: 200,
      success: true,
      invalidationId,
      distributionId,
      paths,
      callerReference,
    };
  } catch (error: any) {
    console.error("Error creating CloudFront invalidation:", error);

    // If invoked by CodePipeline, report job failure
    if (isCodePipeline && jobId) {
      await codePipelineClient.send(
        new PutJobFailureResultCommand({
          jobId,
          failureDetails: {
            type: "JobFailed",
            message: error.message || "Failed to create CloudFront invalidation",
          },
        })
      );
    }

    throw error;
  }
}
