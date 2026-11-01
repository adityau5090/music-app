import type { RequestHandler } from "express";
import { z } from "zod";
import { getTracks } from "../services/track.service.js";

const tracksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(100).optional(),
});

export const listTracks: RequestHandler = async (req, res, next) => {
  try {
    const parsed = tracksQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: z.treeifyError(parsed.error),
      });
      return;
    }

    const result = await getTracks(parsed.data);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};