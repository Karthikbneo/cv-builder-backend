import createError from "http-errors";
export const notFound = (req, res, next) => next(createError(404, "Route not found"));
export const errorHandler = (err, req, res, next) => { 
  const status = err.status || err.statusCode || 500;
  const body = { message: err.message || "Internal Server Error", ...(err.errors ? { errors: err.errors } : {}) };
  if (status >= 500) console.error(err);
  res.status(status).json(body);
};
