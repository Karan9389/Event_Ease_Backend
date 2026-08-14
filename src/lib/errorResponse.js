function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function errorResponse(res, publicMessage = 'Internal server error', err = null, status = 500) {
  const payload = { message: publicMessage };
  if (!isProduction() && err) {
    payload.error = err.message || String(err);
  }
  return res.status(status).json(payload);
}

module.exports = errorResponse;
