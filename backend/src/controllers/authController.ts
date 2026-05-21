import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';

export async function register(c: Context) {
  try {
    const { username, email, password, role = 'user' } = await c.req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    return c.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500);
  }
}

export async function login(c: Context) {
  try {
    const { email, password } = await c.req.json();
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
}

export async function getProfile(c: Context) {
  try {
    const user = c.get('user');
    
    return c.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to get profile' }, 500);
  }
}
