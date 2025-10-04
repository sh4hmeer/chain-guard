import express, { Request, Response } from 'express';
import { Application } from '../models/Application.js';
import { checkJwt, attachUserId, logUserAction } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all routes (checkJwt is already applied in server/index.ts)
router.use(checkJwt);
router.use(attachUserId);
router.use(logUserAction);

// Get all applications for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({ addedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
});

// Get single application by ID (with ownership check)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
});

// Create new application for authenticated user
router.post('/', async (req: Request, res: Response) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.userId
    });
    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: 'Error creating application', error });
  }
});

// Bulk create applications for authenticated user
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const applicationsWithUserId = req.body.map((app: any) => ({
      ...app,
      userId: req.userId
    }));
    const applications = await Application.insertMany(applicationsWithUserId);
    res.status(201).json(applications);
  } catch (error) {
    res.status(400).json({ message: 'Error creating applications', error });
  }
});

// Update application (with ownership check)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: 'Error updating application', error });
  }
});

// Delete application (with ownership check)
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

// Delete all applications for authenticated user
router.delete('/', async (req: Request, res: Response) => {
  try {
    const result = await Application.deleteMany({ userId: req.userId });
    res.json({ 
      message: 'All your applications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting applications', error });
  }
});

export default router;