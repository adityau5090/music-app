import type { RequestHandler } from "express";

import { supabase } from "../config/supabase.js";

export const getHealth: RequestHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Melody API is running 🎵",
    timestamp: new Date().toISOString(),
  });
};

export const getDatabaseHealth: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    const { error } = await supabase
      .from("tracks")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Supabase database connection successful",
    });
  } catch (error) {
    next(error);
  }
};