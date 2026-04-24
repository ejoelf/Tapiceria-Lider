import asyncHandler from "../../utils/asyncHandler.js";
import { getPublicSiteSettings } from "./service.js";

export const getPublicWebsiteSettings = asyncHandler(async (req, res) => {
  const data = await getPublicSiteSettings();

  res.status(200).json({
    ok: true,
    data,
  });
});