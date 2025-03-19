import jwt from 'jsonwebtoken';

const SECRET_KEY = 'segreto';

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
};

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Nessun token fornito.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accesso negato. Non hai i permessi.' });
    }
    next();
  };
};
