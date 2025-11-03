import createError from "http-errors";
import crypto from "node:crypto";
import CV from "../models/CV.js";
import Payment from "../models/Payment.js";
import Share from "../models/Share.js";
import { renderToPdfBuffer } from "../services/pdf.service.js";

const makeToken = () => crypto.randomBytes(24).toString("hex");

export const createShareLink = async (req, res, next) => {
  try {
    const { cvId, ttlDays = 30 } = req.body;
    const cv = await CV.findOne({ _id: cvId, user: req.user.id });
    if (!cv) throw createError(404, "CV not found");


    const paid = await Payment.exists({ user: req.user.id, cv: cvId, action: "share", status: "succeeded" });
    if (!paid) return next(createError(402, "Payment Required"));

    const token = makeToken();
    const expiresAt = new Date(Date.now() + Number(ttlDays) * 24 * 60 * 60 * 1000);

    const share = await Share.create({ user: req.user.id, cv: cv._id, token, expiresAt });
    const base = `${req.protocol}://${req.get("host")}`;
    res.status(201).json({
      token,
      expiresAt,
      urls: {
        json: `${base}/api/v1/shares/${token}`,
        pdf: `${base}/api/v1/shares/${token}/pdf`
      }
    });
  } catch (e) { next(e); }
};

const findValidShare = async (token) => {
  const share = await Share.findOne({ token });
  if (!share) return null;
  if (share.expiresAt.getTime() < Date.now()) return null;
  return share;
};

export const getSharedCV = async (req, res, next) => {
  try {
    const { token } = req.params;
    const share = await findValidShare(token);
    if (!share) return next(createError(404, "Share link invalid or expired"));
    const cv = await CV.findById(share.cv).lean();
    if (!cv) return next(createError(404, "CV not found"));
    res.json({ cv, expiresAt: share.expiresAt });
  } catch (e) { next(e); }
};

export const getSharedPdf = async (req, res, next) => {
  try {
    const { token } = req.params;
    const share = await findValidShare(token);
    if (!share) return next(createError(404, "Share link invalid or expired"));
    const cv = await CV.findById(share.cv).lean();
    if (!cv) return next(createError(404, "CV not found"));
    const pdf = await renderToPdfBuffer(cv);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="cv-${cv._id}.pdf"`);
    res.send(pdf);
  } catch (e) { next(e); }
};


export const viewSharedHtml = async (req, res, next) => {
  try {
    const { token } = req.params;
    const share = await findValidShare(token);
    if (!share) return next(createError(404, "Share link invalid or expired"));
    const cv = await CV.findById(share.cv).lean();
    if (!cv) return next(createError(404, "CV not found"));

    const skills = (cv.skills || []).map(s => `<span class="chip">${s.name} ${s.level || 0}%</span>`).join("");
    const educ = (cv.education || []).map(e => `<div class="item"><b>${e.degree || ""}</b> — ${e.institution || ""}</div>`).join("");
    const exps  = (cv.experience || []).map(x => `<div class="item"><b>${x.position || ""}</b> @ ${x.organization || ""} — ${x.location || ""}</div>`).join("");
    const projs = (cv.projects || []).map(p => `<div class="item"><b>${p.title || ""}</b> — ${p.description || ""}</div>`).join("");

    const pdfUrl = `${req.protocol}://${req.get("host")}/api/v1/shares/${token}/pdf`;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${cv?.profile?.name || "CV"}</title>
  <style>
    :root { --accent: ${cv?.theme?.colors?.accent || "#2563eb"}; --text:#111827; --muted:#6b7280; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; color: var(--text); background:#f9fafb; }
    .container { max-width: 840px; margin: 24px auto; padding: 16px; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.06); padding: 24px; }
    .header { display:flex; gap:16px; align-items:center; }
    .avatar { width:72px; height:72px; border-radius: 16px; background:#e5e7eb; object-fit:cover; }
    .name { font-size: 24px; font-weight: 700; }
    .muted { color: var(--muted); }
    .section { margin-top: 18px; }
    h2 { font-size: 16px; margin: 0 0 8px; color: var(--accent); text-transform: uppercase; letter-spacing: .08em; }
    .chip { display:inline-block; padding:6px 10px; border:1px solid #e5e7eb; border-radius: 999px; margin: 2px; font-size: 12px; }
    .item { margin: 6px 0; }
    .toolbar { display:flex; gap:12px; margin: 12px 0 0; }
    .btn { appearance: none; border: 1px solid var(--accent); color: white; background: var(--accent); padding: 8px 14px; border-radius: 10px; text-decoration:none; font-weight:600; }
    .btn.outline { background: transparent; color: var(--accent); }
    .footer { text-align:center; color:#9ca3af; font-size:12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        ${cv?.profile?.imageUrl ? `<img class="avatar" src="${cv.profile.imageUrl}" alt="avatar" />` : ""}
        <div>
          <div class="name">${cv?.profile?.name || ""}</div>
          <div class="muted">${cv?.profile?.email || ""} • ${cv?.profile?.phone || ""} • ${cv?.profile?.city || ""}</div>
        </div>
      </div>

      ${cv?.profile?.summary ? `<div class="section"><h2>Summary</h2><div>${cv.profile.summary}</div></div>` : ""}
      ${educ ? `<div class="section"><h2>Education</h2>${educ}</div>` : ""}
      ${exps ? `<div class="section"><h2>Experience</h2>${exps}</div>` : ""}
      ${projs ? `<div class="section"><h2>Projects</h2>${projs}</div>` : ""}
      ${skills ? `<div class="section"><h2>Skills</h2><div>${skills}</div></div>` : ""}

      <div class="toolbar">
        <a class="btn" href="${pdfUrl}" target="_blank" rel="noopener">Open as PDF</a>
        <a class="btn outline" href="${req.protocol}://${req.get("host")}/api/v1/shares/${token}" target="_blank" rel="noopener">View JSON</a>
      </div>
    </div>
    <div class="footer">Shared via CV Builder • Link expires on ${new Date(share.expiresAt).toLocaleString()}</div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) { next(e); }
};
