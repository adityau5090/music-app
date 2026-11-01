import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { supabaseAdmin } from "../config/supabase-admin.js";

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", req.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      next(error);
      return;
    }

    if (!data) {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}