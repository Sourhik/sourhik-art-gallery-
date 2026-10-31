import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ req, admin, action, targetType, targetId, details }) => {
  try {
    const adminUser = admin || req?.user;
    await ActivityLog.create({
      adminId: adminUser?._id,
      adminName: adminUser?.name || 'System Admin',
      adminEmail: adminUser?.email || 'admin@photoframe.com',
      action,
      targetType,
      targetId: targetId ? targetId.toString() : '',
      details: details || '',
      ipAddress: req?.ip || req?.connection?.remoteAddress || '127.0.0.1',
      userAgent: req?.headers ? req.headers['user-agent'] : ''
    });
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
};
