import express, { Request, Response } from 'express';
import { Vulnerability } from '../models/Vulnerability.js';

const router = express.Router();

// Get all vulnerabilities
router.get('/', async (req: Request, res: Response) => {
  try {
    const vulnerabilities = await Vulnerability.find()
      .populate('affectedApps')
      .sort({ publishedDate: -1 });
    res.json(vulnerabilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vulnerabilities', error });
  }
});

// Get single vulnerability by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const vulnerability = await Vulnerability.findById(req.params.id)
      .populate('affectedApps');
    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }
    res.json(vulnerability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vulnerability', error });
  }
});

// Create new vulnerability
router.post('/', async (req: Request, res: Response) => {
  try {
    const vulnerability = new Vulnerability(req.body);
    const savedVulnerability = await vulnerability.save();
    res.status(201).json(savedVulnerability);
  } catch (error) {
    res.status(400).json({ message: 'Error creating vulnerability', error });
  }
});

// Update vulnerability status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const vulnerability = await Vulnerability.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }
    res.json(vulnerability);
  } catch (error) {
    res.status(400).json({ message: 'Error updating vulnerability status', error });
  }
});

// Delete vulnerability
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const vulnerability = await Vulnerability.findByIdAndDelete(req.params.id);
    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }
    res.json({ message: 'Vulnerability deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vulnerability', error });
  }
});

export default router;