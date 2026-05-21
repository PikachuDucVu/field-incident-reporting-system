import { Context } from 'hono';
import { PollutionReport } from '../models/PollutionReport';
import mongoose from 'mongoose';
import { emitNewReportNotification, emitReportStatusUpdatedNotification } from '../socket';

export async function createReport(c: Context) {
  try {
    const user = c.get('user');
    const { title, description, location, pollutionType, severity, images } = await c.req.json();
    
    const report = new PollutionReport({
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      pollutionType,
      severity,
      reporterId: user._id,
      images
    });
    
    await report.save();
    emitNewReportNotification(report);

    return c.json({
      message: 'Report created successfully',
      report: {
        id: report._id,
        title: report.title,
        description: report.description,
        location: report.location,
        pollutionType: report.pollutionType,
        severity: report.severity,
        status: report.status,
        createdAt: report.createdAt
      }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create report' }, 500);
  }
}

export async function getReports(c: Context) {
  try {
    const user = c.get('user');
    const { status, page = 1, limit = 10 } = c.req.query();
    
    const filter: any = {};
    
    // Users can only see their own reports, admins can see all
    if (user.role !== 'admin') {
      filter.reporterId = user._id;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const reports = await PollutionReport.find(filter)
      .populate('reporterId', 'username email')
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Convert _id to id for frontend compatibility
    const formattedReports = reports.map(report => ({
      id: report._id.toString(),
      title: report.title,
      description: report.description,
      location: report.location,
      pollutionType: report.pollutionType,
      severity: report.severity,
      status: report.status,
      reporterId: report.reporterId,
      adminId: report.adminId,
      adminNotes: report.adminNotes,
      images: report.images,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));
    
    const total = await PollutionReport.countDocuments(filter);
    
    return c.json({
      reports: formattedReports,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalReports: total
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to get reports' }, 500);
  }
}

export async function getReportById(c: Context) {
  try {
    const { id } = c.req.param();
    const user = c.get('user');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: 'Invalid report ID' }, 400);
    }
    
    const report = await PollutionReport.findById(id)
      .populate('reporterId', 'username email')
      .populate('adminId', 'username email');
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }
    
    // Check if user has permission to view this report
    if (user.role !== 'admin' && report.reporterId._id.toString() !== user._id.toString()) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    return c.json({
      report: {
        id: report._id.toString(),
        title: report.title,
        description: report.description,
        location: report.location,
        pollutionType: report.pollutionType,
        severity: report.severity,
        status: report.status,
        reporterId: report.reporterId,
        adminId: report.adminId,
        adminNotes: report.adminNotes,
        images: report.images,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to get report' }, 500);
  }
}

export async function updateReportStatus(c: Context) {
  try {
    const { id } = c.req.param();
    const { status, adminNotes } = await c.req.json();
    const user = c.get('user');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: 'Invalid report ID' }, 400);
    }
    
    // Only admins can update report status
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const report = await PollutionReport.findByIdAndUpdate(
      id,
      { 
        status,
        adminId: user._id,
        adminNotes
      },
      { new: true }
    ).populate('reporterId', 'username email')
     .populate('adminId', 'username email');
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    emitReportStatusUpdatedNotification(report);

    return c.json({
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    return c.json({ error: 'Failed to update report status' }, 500);
  }
}

export async function getNearbyReports(c: Context) {
  try {
    const { latitude, longitude, radius = 5000, status } = c.req.query(); // radius in meters
    
    if (!latitude || !longitude) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }
    
    const filter: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(radius)
        }
      }
    };
    
    // Optional status filter
    if (status) {
      filter.status = status;
    }
    
    const reports = await PollutionReport.find(filter)
      .populate('reporterId', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Convert _id to id for frontend compatibility
    const formattedReports = reports.map(report => ({
      id: report._id.toString(),
      title: report.title,
      description: report.description,
      location: report.location,
      pollutionType: report.pollutionType,
      severity: report.severity,
      status: report.status,
      reporterId: report.reporterId,
      adminId: report.adminId,
      adminNotes: report.adminNotes,
      images: report.images,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }));
    
    return c.json({ reports: formattedReports });
  } catch (error) {
    return c.json({ error: 'Failed to get nearby reports' }, 500);
  }
}
