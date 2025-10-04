import express, { Request, Response } from 'express';
import { Application } from '../models/Application.js';

const router = express.Router();

// Get all applications
router.get('/', async (req: Request, res: Response) => {
  try {
    const applications = await Application.find().sort({ addedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
});

// Get single application by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
});

// Create new application
router.post('/', async (req: Request, res: Response) => {
  try {
    const application = new Application(req.body);
    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ message: 'Error creating application', error });
  }
});

// Bulk create applications
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const applications = await Application.insertMany(req.body);
    res.status(201).json(applications);
  } catch (error) {
    res.status(400).json({ message: 'Error creating applications', error });
  }
});

// Update application
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: 'Error updating application', error });
  }
});

// Delete application
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application', error });
  }
});

// Delete all applications
router.delete('/', async (req: Request, res: Response) => {
  try {
    await Application.deleteMany({});
    res.json({ message: 'All applications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting applications', error });
  }
});

export default router;