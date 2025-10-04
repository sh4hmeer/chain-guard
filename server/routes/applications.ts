// routes/applications.ts
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Application } from '../models/Application.js';
import { checkJwt, attachUserId, logUserAction } from '../middleware/auth.js';

const router = express.Router();

// Auth + user context + logging
router.use(checkJwt);
router.use(attachUserId);
router.use(logUserAction);

/* ───────────────────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────────────────── */
const validate = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.param, msg: e.msg }))
    });
    return false;
  }
  return true;
};

// Common validators
const applicationValidators = [
  body('name').isString().trim().isLength({ min: 1, max: 120 }).withMessage('name required'),
  body('vendor').isString().trim().isLength({ min: 1, max: 120 }).withMessage('vendor required'),
  body('version').optional().isString().trim().isLength({ max: 120 }),
  body('category').optional().isString().trim().isLength({ max: 120 }),
];

/* ───────────────────────────────────────────────────────────
   Read
   ─────────────────────────────────────────────────────────── */
router.get('/', async (req: Request, res: Response) => {
  try {
    const applications = await Application
      .find({ userId: req.userId })
      .sort({ addedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
});

/* ───────────────────────────────────────────────────────────
   Create (POST /) — single
   ─────────────────────────────────────────────────────────── */
router.post(
  '/',
  applicationValidators,
  async (req: Request, res: Response) => {
    if (!validate(req, res)) return;

    try {
      // enforce one-per-user uniqueness
      const { name, vendor, version, category } = req.body;
      const existing = await Application.findOne({
        userId: req.userId,
        name: name.trim(),
        vendor: vendor.trim(),
        version: (version ?? '').trim(),
      });

      if (existing) {
        return res.status(409).json({
          message: 'Application already exists for this user (name/vendor/version)',
          existingId: existing._id
        });
      }

      const appDoc = new Application({
        userId: req.userId,
        name: name.trim(),
        vendor: vendor.trim(),
        version: version?.trim(),
        category: category?.trim(),
      });

      const saved = await appDoc.save();
      res.status(201).json(saved);
    } catch (error: any) {
      // Handle unique index race
      if (error?.code === 11000) {
        return res.status(409).json({ message: 'Duplicate application', key: error.keyValue });
      }
      res.status(400).json({ message: 'Error creating application', error });
    }
  }
);

/* ───────────────────────────────────────────────────────────
   Create (POST /bulk) — multiple
   ─────────────────────────────────────────────────────────── */
router.post(
  '/bulk',
  body().isArray({ min: 1 }).withMessage('request body must be a non-empty array'),
  body('*.name').isString().trim().isLength({ min: 1, max: 120 }),
  body('*.vendor').isString().trim().isLength({ min: 1, max: 120 }),
  body('*.version').optional().isString().trim().isLength({ max: 120 }),
  body('*.category').optional().isString().trim().isLength({ max: 120 }),
  async (req: Request, res: Response) => {
    if (!validate(req, res)) return;

    const items = (req.body as any[]).map(a => ({
      userId: req.userId,
      name: a.name.trim(),
      vendor: a.vendor.trim(),
      version: a.version?.trim() ?? '',
      category: a.category?.trim(),
    }));

    // Deduplicate within the payload (user+name+vendor+version)
    const seen = new Set<string>();
    const deduped = items.filter(a => {
      const key = `${a.userId}|${a.name}|${a.vendor}|${a.version}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    try {
      // Insert many; skip docs that violate unique index
      const inserted = await Application.insertMany(deduped, { ordered: false });
      res.status(201).json(inserted);
    } catch (error: any) {
      // ordered:false means we may have partial success
      // Collect the successfully inserted documents if available
      const success = error?.result?.result?.nInserted
        ? await Application.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(error.result.result.nInserted)
        : [];

      res.status(207).json({
        message: 'Bulk insert partially succeeded',
        insertedCount: success.length,
        // optional: include errors to surface duplicates etc.
        error: error?.writeErrors?.map((e: any) => ({
          index: e?.index,
          code: e?.code,
          keyValue: e?.keyValue,
          errmsg: e?.errmsg,
        })),
      });
    }
  }
);

/* ───────────────────────────────────────────────────────────
   Update / Delete
   ─────────────────────────────────────────────────────────── */
router.put('/:id',
  // Optional: validate updatable fields
  body('name').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('vendor').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('version').optional().isString().trim().isLength({ max: 120 }),
  body('category').optional().isString().trim().isLength({ max: 120 }),
  async (req: Request, res: Response) => {
    if (!validate(req, res)) return;

    try {
      const update: any = {};
      ['name','vendor','version','category'].forEach(k => {
        if (req.body[k] !== undefined) update[k] = String(req.body[k]).trim();
      });

      const application = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        update,
        { new: true, runValidators: true }
      );

      if (!application) {
        return res.status(404).json({ message: 'Application not found or unauthorized' });
      }
      res.json(application);
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: 'Duplicate after update', key: error.keyValue });
      }
      res.status(400).json({ message: 'Error updating application', error });
    }
  }
);

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application', error });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const result = await Application.deleteMany({ userId: req.userId });
    res.json({ message: 'All your applications deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting applications', error });
  }
});

export default router;
