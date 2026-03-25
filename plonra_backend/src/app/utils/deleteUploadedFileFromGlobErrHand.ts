import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFileFromGlobalErrHand = async (req: Request) => {
  try {
    const filesToDelete: string[] = [];

    // for single file
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    }
    // for array files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        filesToDelete.push(file.path);
      });
    }
    // for object files
    if (
      typeof req.files === "object" &&
      req.files &&
      !Array.isArray(req.files)
    ) {
      // [ [{path : "rfrf"}] , [{}, {}]]
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            filesToDelete.push(file.path);
          });
        }
      });
    }

    // delete all files from cloudinary
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => deleteFileFromCloudinary(url)),
      );

      console.log(
        `\nDeleted ${filesToDelete.length} uploaded file(s) from Cloudinary due to an error during request processing.\n`,
      );
    }
  } catch (error) {
    console.log("Error deleting uploaded files:", error);
  }
};
