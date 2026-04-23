import multer from "multer";
import path from "path";
import AppError from "../utils/appError.js";
import { ensureDir, getWorkOrderUploadDir } from "../utils/fileStorage.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const { workOrderId } = req.params;

      if (!workOrderId || Number.isNaN(Number(workOrderId))) {
        return cb(new Error("workOrderId inválido en la ruta."));
      }

      const uploadDir = getWorkOrderUploadDir(workOrderId);
      ensureDir(uploadDir);

      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName || "archivo"}-${uniqueSuffix}${ext.toLowerCase()}`);
  },
});

function fileFilter(req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Tipo de archivo no permitido. Solo se aceptan imágenes, videos MP4/MOV y PDF.",
        400
      )
    );
  }

  cb(null, true);
}

export const uploadWorkOrderMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
}).single("file");