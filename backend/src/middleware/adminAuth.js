import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const adminAuth = (allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR']) => {
  return async (req, res, next) => {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ success: false, message: 'Admin access required. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_photogallery_2026_modern');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Admin user not found' });
      }

      if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        return res.status(403).json({ success: false, message: 'Admin account has been restricted' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Your role is ${user.role}.`
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials or token expired', error: error.message });
    }
  };
};
