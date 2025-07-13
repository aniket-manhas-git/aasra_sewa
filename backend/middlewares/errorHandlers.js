// Global error handler
export const globalErrorHandler = (err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    success: false 
  });
};

// 404 handler - Express 5.x compatible
export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found', success: false });
};

export const setupErrorHandlers = (app) => {
  app.use(globalErrorHandler);
  app.use(notFoundHandler);
  console.log("[DEBUG] Error handlers added");
}; 