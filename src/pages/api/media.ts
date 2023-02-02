import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";

import { s3Client } from "../../lib/s3Client";

import { env } from "../../env/server.mjs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const fileExtension = (req.query.fileType as string).split("/")[1] as string;

  const Key = `${randomUUID()}.${fileExtension}`;

  const s3Params = {
    Bucket: env.BUCKET_NAME,
    Key,
    Expires: 60,
    ContentType: `image/${fileExtension}`,
  };

  const uploadUrl = s3Client.getSignedUrl("putObject", s3Params);

  console.log("uploadUrl", uploadUrl);

  res.status(200).json({
    uploadUrl,
    key: Key,
  });
}
