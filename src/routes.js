import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';

import authMiddlewares from './app/middlewares/auth';
import admMiddlewares from './app/middlewares/admMiddlewares';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.post('/students', StudentController.store);

// routes.use(authMiddlewares); só irá funcionar o "use", para as rotas abaixo dele, acima não irá. É uma outra maneira de fazer.

routes.put('/users', authMiddlewares, UserController.update);
routes.put(
  '/students',
  authMiddlewares,
  admMiddlewares,
  StudentController.update
);

export default routes;
