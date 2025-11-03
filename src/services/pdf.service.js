
import puppeteer from "puppeteer-core"; 

const base = (cv) => ({
  name: cv?.profile?.name || "",
  email: cv?.profile?.email || "",
  phone: cv?.profile?.phone || "",
  city: cv?.profile?.city || "",
  summary: cv?.profile?.summary || "",
  education: Array.isArray(cv?.education) ? cv.education : [],
  experience: Array.isArray(cv?.experience) ? cv.experience : [],
  projects: Array.isArray(cv?.projects) ? cv.projects : [],
  skills: Array.isArray(cv?.skills) ? cv.skills : [],
  colors: cv?.theme?.colors || { primary: "#111827", accent: "#2563eb" },
  font: cv?.theme?.font || "Inter, Arial, Helvetica, sans-serif",
});


const tplClassic = (cv) => {
  const d = base(cv);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: ${d.font}; margin: 24px; color:#111; }
    h1 { margin: 0; font-size: 24px; color:${d.colors.primary} }
    h2 { font-size: 14px; letter-spacing:.08em; color:${d.colors.accent}; text-transform:uppercase; margin: 14px 0 6px; }
    .muted { color:#555; }
    .item{ margin: 5px 0; }
    .chip{ display:inline-block; border:1px solid #ddd; border-radius:999px; padding:3px 8px; margin:2px; font-size:12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(d.name)}</h1>
  <div class="muted">${escapeHtml(d.email)} • ${escapeHtml(d.phone)} • ${escapeHtml(d.city)}</div>

  ${d.summary ? `<h2>Summary</h2><div>${escapeHtml(d.summary)}</div>` : ""}

  ${d.education.length
    ? `<h2>Education</h2>${d.education
        .map(
          (e) =>
            `<div class="item"><b>${escapeHtml(e?.degree || "")}</b> — ${escapeHtml(
              e?.institution || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.experience.length
    ? `<h2>Experience</h2>${d.experience
        .map(
          (x) =>
            `<div class="item"><b>${escapeHtml(x?.position || "")}</b> @ ${escapeHtml(
              x?.organization || ""
            )} — ${escapeHtml(x?.location || "")}</div>`
        )
        .join("")}`
    : ""}

  ${d.projects.length
    ? `<h2>Projects</h2>${d.projects
        .map(
          (p) =>
            `<div class="item"><b>${escapeHtml(p?.title || "")}</b> — ${escapeHtml(
              p?.description || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.skills.length
    ? `<h2>Skills</h2><div>${d.skills
        .map((s) => `<span class="chip">${escapeHtml(s?.name || "")} ${s?.level ?? 0}%</span>`)
        .join("")}</div>`
    : ""}
</body>
</html>`;
};

const tplModern = (cv) => {
  const d = base(cv);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: ${d.font}; margin: 24px; color:#0f172a; }
    .header { border-left: 6px solid ${d.colors.accent}; padding-left: 12px; }
    h1 { margin: 0; font-size: 22px; }
    .muted { color:#475569; }
    h2 { font-size: 13px; color:${d.colors.accent}; margin: 12px 0 6px; text-transform: uppercase; letter-spacing:.08em; }
    .item{ margin: 6px 0; }
    .chip{ background:#f1f5f9; border-radius:8px; padding:4px 8px; margin:2px; font-size:12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(d.name)}</h1>
    <div class="muted">${escapeHtml(d.email)} • ${escapeHtml(d.phone)} • ${escapeHtml(d.city)}</div>
  </div>

  ${d.summary ? `<h2>Summary</h2><div>${escapeHtml(d.summary)}</div>` : ""}

  ${d.education.length
    ? `<h2>Education</h2>${d.education
        .map(
          (e) =>
            `<div class="item"><b>${escapeHtml(e?.degree || "")}</b> — ${escapeHtml(
              e?.institution || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.experience.length
    ? `<h2>Experience</h2>${d.experience
        .map(
          (x) =>
            `<div class="item"><b>${escapeHtml(x?.position || "")}</b> @ ${escapeHtml(
              x?.organization || ""
            )} — ${escapeHtml(x?.location || "")}</div>`
        )
        .join("")}`
    : ""}

  ${d.projects.length
    ? `<h2>Projects</h2>${d.projects
        .map(
          (p) =>
            `<div class="item"><b>${escapeHtml(p?.title || "")}</b> — ${escapeHtml(
              p?.description || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.skills.length
    ? `<h2>Skills</h2><div>${d.skills
        .map((s) => `<span class="chip">${escapeHtml(s?.name || "")} ${s?.level ?? 0}%</span>`)
        .join("")}</div>`
    : ""}
</body>
</html>`;
};

const tplElegant = (cv) => {
  const d = base(cv);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    @page { margin: 18mm; }
    body { font-family: ${d.font}, Georgia, 'Times New Roman', serif; color:#1f2937; margin: 0; }
    h1 { font-family: Georgia, serif; font-size: 26px; margin:0 0 4px; }
    .muted { color:#6b7280; }
    h2 { font-size: 12px; letter-spacing:.12em; text-transform:uppercase; color:${d.colors.primary}; margin: 14px 0 8px; }
    .sep { height:1px; background:#e5e7eb; margin: 8px 0; }
    .item{ margin: 6px 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(d.name)}</h1>
  <div class="muted">${escapeHtml(d.email)} • ${escapeHtml(d.phone)} • ${escapeHtml(d.city)}</div>
  <div class="sep"></div>

  ${d.summary ? `<h2>Profile</h2><div>${escapeHtml(d.summary)}</div>` : ""}

  ${d.education.length
    ? `<h2>Education</h2>${d.education
        .map(
          (e) =>
            `<div class="item"><b>${escapeHtml(e?.degree || "")}</b>, ${escapeHtml(
              e?.institution || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.experience.length
    ? `<h2>Experience</h2>${d.experience
        .map(
          (x) =>
            `<div class="item"><b>${escapeHtml(x?.position || "")}</b> — ${escapeHtml(
              x?.organization || ""
            )}, ${escapeHtml(x?.location || "")}</div>`
        )
        .join("")}`
    : ""}

  ${d.projects.length
    ? `<h2>Projects</h2>${d.projects
        .map(
          (p) =>
            `<div class="item"><b>${escapeHtml(p?.title || "")}</b>: ${escapeHtml(
              p?.description || ""
            )}</div>`
        )
        .join("")}`
    : ""}

  ${d.skills.length
    ? `<h2>Skills</h2><div>${d.skills
        .map((s) => `${escapeHtml(s?.name || "")} (${s?.level ?? 0}%)`)
        .join(" • ")}</div>`
    : ""}
</body>
</html>`;
};

/** choose template */
const htmlTemplate = (cv) => {
  const t = String(cv?.template || "classic").toLowerCase();
  if (t === "modern") return tplModern(cv);
  if (t === "elegant") return tplElegant(cv);
  return tplClassic(cv);
};

/** escape basic HTML entities to avoid malformed markup */
function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Create a real PDF buffer from a CV doc.
 * Robust launch config:
 *  - works on Linux containers (no-sandbox),
 *  - supports custom Chromium path via PUPPETEER_EXECUTABLE_PATH,
 *  - throws on empty buffer (prevents saving invalid PDFs).
 */

export const renderToPdfBuffer = async (cvDoc) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // e.g. /usr/bin/chromium-browser
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlTemplate(cvDoc), { waitUntil: "networkidle0", timeout: 30000 });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
    if (!pdf || !pdf.length) throw new Error("Empty PDF buffer");
    return pdf; // <-- Buffer
  } finally {
    await browser.close().catch(() => {});
  }
};


