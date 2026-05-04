export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
