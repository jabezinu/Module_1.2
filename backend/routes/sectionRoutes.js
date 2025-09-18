import express from 'express';
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection
} from '../controllers/sectionController.js';

const router = express.Router();

router.post('/', createSection);
router.get('/', getSections);
router.get('/:id', getSectionById);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;