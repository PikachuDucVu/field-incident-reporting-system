import { Hono } from 'hono';
import { createReport, getReports, getReportById, updateReportStatus, getNearbyReports } from '../controllers/pollutionController';
import { authenticate, requireAdmin } from '../middleware/auth';

const pollutionRoutes = new Hono();

// Create report - authenticated users only
pollutionRoutes.post('/', authenticate, createReport);

// Get reports - authenticated (users see their own, admins see all)
pollutionRoutes.get('/', authenticate, getReports);

// Get nearby reports - public access
pollutionRoutes.get('/nearby', getNearbyReports);

// Get specific report
pollutionRoutes.get('/:id', authenticate, getReportById);

// Update report status - admins only
pollutionRoutes.put('/:id/status', authenticate, requireAdmin, updateReportStatus);

export default pollutionRoutes;
