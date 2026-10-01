// Allows only the given roles, e.g. role('seller')
export const role = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not allowed to do this' });
  }
  next();
};
