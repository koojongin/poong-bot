import { Router } from 'express';
import { Dictionary } from '../../models/Dictionary';

const router = Router();
router.get('/', async (req, res) => {
  const dictionarys = await Dictionary.find({}).limit(100).sort({ createdAt: -1 });
  res.send({ dictionarys });
});

router.get('/about', (req, res) => {
  res.send('About birds');
});

export const dictionaryRouter = router;
