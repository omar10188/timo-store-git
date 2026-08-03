const checkOwnership = (Model, userField = 'user') => async (req, res, next) => {
  try {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const docUserId = doc[userField]?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (docUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to modify or view this resource',
      });
    }

    req.doc = doc;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkOwnership;
