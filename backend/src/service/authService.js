const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Kết nối cơ sở dữ liệu

// Đăng nhập
const login = (email, password) => {

    const query = 'SELECT * FROM members WHERE email = ? AND IsActive = 1';

    return db.query(query, [email])
        .then(([results]) => {
            if (results.length === 0) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }
            
            const user = results[0];
            return bcrypt.compare(password, user.Password).then(isMatch => {
                if (!isMatch) {
                    throw new Error('Email hoặc mật khẩu không đúng');
                }

                // Tạo token JWT
                const token = jwt.sign(
                    { id: user.MemberID, role: user.RoleID },
                    process.env.JWT_SECRET || 'default_secret',
                    { expiresIn: '24h' }
                );

                return { token, user };
            });
        });
};

// Đăng ký
const register = (fullname, email, password) => {
    const checkQuery = 'SELECT * FROM members WHERE email = ?';
    const insertQuery = 'INSERT INTO members (Fullname, Email, Password, RoleID) VALUES (?, ?, ?, ?)';

    return db.query(checkQuery, [email])
        .then(([results]) => {
            if (results.length > 0) {
                throw new Error('Email đã tồn tại');
            }

            return bcrypt.hash(password, 10); // Mã hóa mật khẩu
        })
        .then(hashedPassword => {
            return db.query(insertQuery, [fullname, email, hashedPassword, 345]); // Mặc định RoleID là 345  (member)
        })
        .then(([result]) => {
            return {
                id: result.insertId,
                fullname,
                email,
            };
        });
};

const refreshToken = (oldToken) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem token có hợp lệ hay không
        jwt.verify(oldToken, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
            if (err) {
                return reject('Token không hợp lệ hoặc đã hết hạn');
            }

            // Tạo lại token mới từ thông tin đã decode
            const newToken = jwt.sign(
                { id: decoded.id, role: decoded.role },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '7h' }  // Bạn có thể thay đổi thời gian hết hạn ở đây
            );

            resolve(newToken);
        });
    });
};

module.exports = {
    login,
    register,
    refreshToken
};