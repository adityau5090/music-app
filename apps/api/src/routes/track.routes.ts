import { Router } from "express";

import { listTracks } from "../controllers/track.controller.js";
import { getPlaybackUrl } from "../controllers/playback.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listTracks);

router.get(
  "/:id/playback-url",
  requireAuth,
  getPlaybackUrl,
);

export default router;