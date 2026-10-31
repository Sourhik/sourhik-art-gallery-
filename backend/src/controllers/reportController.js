import Report from '../models/Report.js';
import Photo from '../models/Photo.js';
import Story from '../models/Story.js';
import MemoryBox from '../models/MemoryBox.js';
import Puzzle from '../models/Puzzle.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc Create a new report (User reporting content)
// @route POST /api/reports
export const createReport = async (req, res) => {
  try {
    const { itemType, itemId, itemTitle, itemPreview, reason, details } = req.body;

    if (!itemType || !itemId || !reason) {
      return res.status(400).json({ success: false, message: 'Item type, Item ID, and Reason are required' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reporter: {
        name: req.user.name,
        email: req.user.email
      },
      itemType: itemType.toUpperCase(),
      itemId: itemId.toString(),
      itemTitle: itemTitle || 'Flagged Item',
      itemPreview: itemPreview || '',
      reason,
      details: details || '',
      status: 'PENDING'
    });

    // Increment report counter on target item if applicable
    try {
      if (itemType === 'PHOTO') await Photo.findByIdAndUpdate(itemId, { $inc: { reportCount: 1 } });
      if (itemType === 'STORY') await Story.findByIdAndUpdate(itemId, { $inc: { reportCount: 1 } });
      if (itemType === 'MEMORY_BOX') await MemoryBox.findByIdAndUpdate(itemId, { $inc: { reportCount: 1 } });
      if (itemType === 'PUZZLE') await Puzzle.findByIdAndUpdate(itemId, { $inc: { reportCount: 1 } });
    } catch {
      // Ignore if item not found
    }

    res.status(201).json({ success: true, message: 'Report submitted for review. Thank you.', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all reports (Admin)
// @route GET /api/reports
export const getReports = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (type && type !== 'ALL') {
      query.itemType = type.toUpperCase();
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { itemTitle: { $regex: s, $options: 'i' } },
        { reason: { $regex: s, $options: 'i' } },
        { details: { $regex: s, $options: 'i' } },
        { 'reporter.name': { $regex: s, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update report status and execute moderation actions (Admin)
// @route PUT /api/reports/:id
export const updateReportAction = async (req, res) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    if (actionTaken) report.actionTaken = actionTaken;
    report.resolvedBy = req.user.name;
    report.resolvedAt = new Date();

    // Execute moderation action if requested
    if (actionTaken === 'CONTENT_REMOVED') {
      const { itemType, itemId } = report;
      if (itemType === 'PHOTO') await Photo.findByIdAndDelete(itemId);
      if (itemType === 'STORY') await Story.findByIdAndDelete(itemId);
      if (itemType === 'MEMORY_BOX') await MemoryBox.findByIdAndDelete(itemId);
      if (itemType === 'PUZZLE') await Puzzle.findByIdAndDelete(itemId);
    } else if (actionTaken === 'USER_SUSPENDED') {
      if (report.itemType === 'USER') {
        await User.findByIdAndUpdate(report.itemId, { status: 'SUSPENDED' });
      }
    }

    await report.save();

    await logActivity({
      req,
      action: `REPORT_${actionTaken || status}`,
      targetType: 'REPORT',
      targetId: report._id,
      details: `Report for ${report.itemType} (${report.itemTitle}) updated to ${status} with action: ${actionTaken || 'None'}`
    });

    res.json({ success: true, message: 'Report updated successfully', report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Report record
// @route DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
