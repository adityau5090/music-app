import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { uploadTrackFiles } from "../config/multer.js";
import { createTrack } from "../controllers/admin-track.controller.js";

const router = Router();

router.post(
  "/tracks",
  requireAuth,
  requireAdmin,
  uploadTrackFiles.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  createTrack,
);

export default router;