class ApiError extends Error {
  constructor(statusCode, message, data, dataKey = "data") {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.dataKey = dataKey;
  }

  toResponse() {
    const response = {
      message: this.message,
    };

    if (this.data !== undefined) {
      response[this.dataKey] = this.data;
    }

    return response;
  }
}

export default ApiError;
