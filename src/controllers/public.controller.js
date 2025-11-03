import createError from "http-errors";
import CV from "../models/CV.js";
import { renderToPdfBuffer } from "../services/pdf.service.js";

export const getSharedCV = async (req, res, next) => {
  try {
    const { id } = req.params; // cvId
    const cv = await CV.findById(id).lean();
    if (!cv || !cv.shareUrl) return next(createError(404, "Shared CV not found"));

  
    const { user, ...safe } = cv;
    res.json(safe);
  } catch (e) { next(e); }
};


export const getSharedPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cv = await CV.findById(id).lean();
    if (!cv || !cv.shareUrl) return next(createError(404, "Shared CV not found"));

    const pdf = await renderToPdfBuffer(cv);
    if (!pdf?.length) return next(createError(500, "Failed to render PDF"));

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cv-${id}.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "no-store",
    });
    res.end(pdf);
  } catch (e) { next(e); }
};
