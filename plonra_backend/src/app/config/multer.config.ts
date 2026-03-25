import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

// upload file to cloudinary using multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,

  params: (req, file) => {
    // extract the extension from file
    const extension = file.originalname.split(".").pop()?.toLocaleLowerCase();

    // file name without extension
    const fileNameWithoutExtension = file.originalname
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    // generate unique file name
    const uniqueName =
      Math.random().toString(36).substring(2) +
      "_" +
      Date.now() +
      "_" +
      fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return {
      folder: `planora/${folder}`,
      public_id: uniqueName,
      resource_type: "auto",
    };
  },
});

const parser = multer({ storage: storage });
