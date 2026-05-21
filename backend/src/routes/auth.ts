import { Hono } from 'hono';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const authRoutes = new Hono();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/profile', authenticate, getProfile);

export default authRoutes;
