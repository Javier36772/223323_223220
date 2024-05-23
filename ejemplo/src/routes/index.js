import { Router } from 'express';
import documentsRouter from './documents.routes.js';
import usersRouter from './users.routes.js';
import authRouter from './auth.routes.js';

export const router = Router();
router.use('/auth', authRouter);
router.use('/documents', documentsRouter);
router.use('/users', usersRouter);

