import { Router } from "express";
import { listTracks } from "../controllers/track.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listTracks);

export default router;