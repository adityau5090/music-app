import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { uploadTrack } from "../services/track-upload.services.js";

export const createTrack: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const files = req.files as
      | {
          audio?: Express.Multer.File[];
          cover?: Express.Multer.File[];
        }
      | undefined;

    const audio = files?.audio?.[0];
    const cover = files?.cover?.[0];

    const { title, artist, album, durationSeconds } = req.body;

    if (!title?.trim() || !audio || !cover) {
      res.status(400).json({
        success: false,
        message: "Title, audio file and cover image are required",
      });
      return;
    }

    if (cover.size > 5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: "Cover image cannot exceed 5 MB",
      });
      return;
    }

    let parsedDuration: number | undefined;

    if (durationSeconds !== undefined && durationSeconds !== "") {
      parsedDuration = Number(durationSeconds);

      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        res.status(400).json({
          success: false,
          message: "Duration must be a positive integer",
        });
        return;
      }
    }

    const track = await uploadTrack({
      title: title.trim(),
      artist: artist?.trim() || undefined,
      album: album?.trim() || undefined,
      durationSeconds: parsedDuration,
      uploadedBy: authReq.user!.id,
      audio,
      cover,
    });

    res.status(201).json({
      success: true,
      message: "Track uploaded successfully",
      track,
    });
  } catch (error) {
    next(error);
  }
};