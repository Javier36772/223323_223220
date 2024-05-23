import { Router } from "express";
import * as documentsController from "../controllers/documents.controller.js";
import { httpAuthMiddleware } from "../middlewares/http/auth.middleware.js";

const documentsRouter = Router();

documentsRouter.get('/', httpAuthMiddleware, documentsController.index);
documentsRouter.get('/:id', httpAuthMiddleware, documentsController.show);
documentsRouter.post('/', httpAuthMiddleware, documentsController.createDocument);
documentsRouter.patch('/:id', httpAuthMiddleware, documentsController.updateDocument);
documentsRouter.delete('/:id', httpAuthMiddleware, documentsController.deleteDocument);
documentsRouter.get('/permissions/users', httpAuthMiddleware, documentsController.getDocumentsByUser);
documentsRouter.get('/new/permissions/users/', httpAuthMiddleware, documentsController.refreshDocumentsByUser);
documentsRouter.post('/notifications', httpAuthMiddleware, documentsController.responseNotification);
documentsRouter.post('/notifications/users', httpAuthMiddleware, documentsController.inviteDocumentNotification);
documentsRouter.get('/notifications/users', httpAuthMiddleware, documentsController.getNotifications);

export default documentsRouter;