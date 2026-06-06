export const errorHandler = (err, req, res, next) => {
  const response =
    typeof err.toResponse === "function"
      ? err.toResponse()
      : { message: err.message || "Internal Server Error" };

  return res.status(err.statusCode || 500).json(response);
};
