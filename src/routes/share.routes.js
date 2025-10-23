import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import CV from '../models/CV.js';
import Payment from '../models/Payment.js';
import env from '../config/env.js';

const r = Router();

// Create a share link (only if there's a succeeded share payment)
r.post('/', requireAuth, async (req, res, next) => {
  try {
    const { cvId } = req.body;
    // verify ownership
    const cv = await CV.findOne({ _id: cvId, user: req.user.id });
    if (!cv) return res.status(404).json({ message: 'CV not found' });

    // verify succeeded payment for 'share'
    const paid = await Payment.findOne({
      user: req.user.id,
      cv: cvId,
      action: 'share',
      status: 'succeeded'
    }).sort({ createdAt: -1 });

    if (!paid) return res.status(402).json({ message: 'Payment required' });

    // generate or reuse link
    const shareUrl = `${env.FRONTEND_ORIGIN}/view/${cvId}`;
    if (cv.shareUrl !== shareUrl) {
      cv.shareUrl = shareUrl;
      await cv.save();
    }

    res.json({ shareUrl });
  } catch (e) { next(e); }
});

// Optional: get current share link
r.get('/:cvId', requireAuth, async (req, res, next) => {
  try {
    const cv = await CV.findOne({ _id: req.params.cvId, user: req.user.id }).lean();
    if (!cv) return res.status(404).json({ message: 'CV not found' });
    res.json({ shareUrl: cv.shareUrl || null });
  } catch (e) { next(e); }
});

export default r;
