export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (e) { next(e); }
};
