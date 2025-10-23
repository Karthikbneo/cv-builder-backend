import createError from "http-errors";
import CV from "../models/CV.js";
import { renderToPdfBuffer } from "../services/pdf.service.js";
import Payment from "../models/Payment.js";

export const listMyCVs = async (req, res, next) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const q = { user: req.user.id, ...(cursor ? { _id: { $lt: cursor } } : {}) };
    const items = await CV.find(q).sort({ _id: -1 }).limit(Number(limit) + 1);
    const nextCursor = items.length > limit ? String(items.pop()._id) : null;
    res.json({ items, nextCursor });
  } catch (e) { next(e); }
};

export const createCV = async (req, res, next) => {
  try {
    const doc = await CV.create({ ...req.body, user: req.user.id });
    res.status(201).json(doc);
  } catch (e) { next(e); }
};

export const getCV = async (req, res, next) => {
  try {
    const doc = await CV.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) throw createError(404, "CV not found");
    res.json(doc);
  } catch (e) { next(e); }
};

export const updateCV = async (req, res, next) => {
  try {
    const doc = await CV.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!doc) throw createError(404, "CV not found");
    res.json(doc);
  } catch (e) { next(e); }
};

export const deleteCV = async (req, res, next) => {
  try {
    const doc = await CV.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!doc) throw createError(404, "CV not found");
    res.status(204).send();
  } catch (e) { next(e); }
};


export const downloadPdf = async (req, res, next) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, user: req.user.id });
    if (!cv) return next(createError(404, "CV not found"));

    const paid = await Payment.findOne({
      user: req.user.id, cv: cv._id, action: "download", status: "succeeded"
    }).sort({ createdAt: -1 }).lean();
    if (!paid) return next(createError(402, "Payment Required"));

    const pdfBuffer = await renderToPdfBuffer(cv);
    if (!pdfBuffer || !pdfBuffer.length) throw new Error("Empty PDF buffer");

    // ✅ send as a binary Buffer with explicit length
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv-${cv._id}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    });
    res.end(pdfBuffer);
  } catch (e) {
    console.error("downloadPdf error:", e?.message);
    next(e);
  }
};

