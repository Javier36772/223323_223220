import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { httpAuthMiddleware } from "../middlewares/http/auth.middleware.js"; 

const usersRouter = Router();

usersRouter.get('/', httpAuthMiddleware, usersController.index);
usersRouter.get('/:id', httpAuthMiddleware, usersController.show);
usersRouter.post('/', usersController.createUser);

export default usersRouter;