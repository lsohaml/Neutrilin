function notFound(req, res) {
  res.status(404).json({ error: `No route found for ${req.method} ${req.path}` });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Something went wrong.' });
}

module.exports = { notFound, errorHandler };
