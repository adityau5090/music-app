import type { RequestHandler } from "express";
import { z } from "zod";
import { generatePlaybackUrl } from "../services/playback.services.js";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export const getPlaybackUrl: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = paramsSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid track ID",
      });
      return;
    }

    const result = await generatePlaybackUrl(parsed.data.id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Track not found or unavailable",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Playback URL generated successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};