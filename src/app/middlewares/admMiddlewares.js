import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    const UserLogado = await User.findByPk(decoded.id);

    if (UserLogado.name !== 'Administrador') {
      return res
        .status(400)
        .json({ error: 'Logged in user is not administrator.' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
