// Custom error handler middleware
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        // Provide stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// 404 Not Found middleware
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
