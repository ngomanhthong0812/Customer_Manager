const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token
    if (!token) return res.status(401).send('Access Denied: No Token Provided');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user; // Gắn thông tin người dùng vào request
        next();
    });
};

// Middleware phân quyền admin
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 123) {
        return res.status(403).send('Access Denied: Admins Only');
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeAdmin,
};
