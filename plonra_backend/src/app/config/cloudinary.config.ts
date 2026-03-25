import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../middleware/appError";
import status from "http-status";

// cloudianry configuration
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_KEY_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_SEC,
});

// upload file manually to cloudinary
export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(status.NOT_FOUND, "Buffer or file name is required");
  }

  // extract file extension
  const extension = fileName.split(".").pop()?.toLocaleLowerCase();

  // file name without extension
  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

  // generate unique file name
  const uniqueFileName =
    Math.random().toString(36).substring(2) +
    "_" +
    Date.now() +
    "_" +
    fileNameWithoutExtension;

  // determine folder based on file type
  const folder = extension === "pdf" ? "pdfs" : "images";

  // upload to cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `planora/${folder}`,
        public_id: `planora/${folder}/${uniqueFileName}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(
            new AppError(
              status.INTERNAL_SERVER_ERROR,
              "Failed to upload file to Cloudinary",
            ),
          );
        } else {
          return resolve(result as UploadApiResponse);
        }
      },
    );
    uploadStream.end(buffer);
  });
};

// delete file from cloudinary
export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);

    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
  } catch (error) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to delete file from Cloudinary",
    );
  }
};

export const cloudinaryUpload = cloudinary;
