import S3 from "aws-sdk/clients/s3";
import { env } from "../env/server.mjs";

export const s3Client = new S3({
  apiVersion: "2006-03-01",
  region: env.REGION,
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.ACCESS_KEY_SECRET,
  signatureVersion: "v4",
});
