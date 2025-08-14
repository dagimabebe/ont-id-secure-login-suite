
export default (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: 'Something went wrong' });
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
