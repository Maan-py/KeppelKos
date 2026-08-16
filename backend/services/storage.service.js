import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import crypto from "crypto";
import path from "path";

const s3client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.AWS_BUCKET || "keppel-payments";

export const getFileUrlFromNeon = async (fileName) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const url = await getSignedUrl(s3client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Gagal membuat URL:", error);
    throw new Error("Tidak dapat memuat gambar");
  }
};

export const uploadToNeon = async (file) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `payment-${crypto.randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3client.send(command);

    const publicUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${BUCKET_NAME}/${fileName}`;

    return {
      key: fileName,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error Upload to Neon Storage:", error);
    throw new Error("Gagal mengunggah gambar ke server cloud.");
  }
};

export const deleteFromNeon = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    await s3client.send(command);
    console.log(`[Storage] Berhasil menghapus file: ${fileKey}`);
  } catch (error) {
    console.error(`[Storage] Gagal menghapus file ${fileKey}:`, error);
  }
};
