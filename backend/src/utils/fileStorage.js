import fs from "fs";
import path from "path";

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function normalizeSlashes(filePath) {
  return filePath.replace(/\\/g, "/");
}

export function getUploadsRoot() {
  return path.resolve("uploads");
}

export function getWorkOrderUploadDir(workOrderId) {
  return path.join(getUploadsRoot(), "work-orders", String(workOrderId));
}

export function buildPublicFileUrl(req, relativeFilePath) {
  const normalized = normalizeSlashes(relativeFilePath);
  return `${req.protocol}://${req.get("host")}/${normalized}`;
}