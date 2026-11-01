import multer from "multer";

export const uploadTrackFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 2,
  },
});