import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrdersController from './app/controllers/HelpOrdersController';

import authMiddlewares from './app/middlewares/auth';
import admMiddlewares from './app/middlewares/admMiddlewares';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.post('/students', StudentController.store);

// routes.use(authMiddlewares); só irá funcionar o "use", para as rotas abaixo dele, acima não irá. É uma outra maneira de fazer.

routes.put('/users', authMiddlewares, UserController.update);
routes.put(
  '/students/:id',
  authMiddlewares,
  admMiddlewares,
  StudentController.update
);

// /////////////////// Rotas para checkin /////////////////////////
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

// ////////////////////// Rotas para Help Orders ///////////////////
routes.get('/help-orders/sem-resposta', HelpOrdersController.index);
routes.post('/students/:student_id/help-orders', HelpOrdersController.store);
routes.get('/students/:student_id/help-orders', HelpOrdersController.show);
routes.put('/help-orders/:id/answer', HelpOrdersController.update);

routes.use(admMiddlewares);
// ///////////////////// Rotas para o plano ///////////////////////
routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

// ///////////////////// Rotas para a matricula ////////////////////
routes.get('/enrollment', EnrollmentController.index);
routes.post('/enrollment', EnrollmentController.store);
routes.put('/enrollment/:id', EnrollmentController.update);
routes.delete('/enrollment/:id', EnrollmentController.delete);

export default routes;
