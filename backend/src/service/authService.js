const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Kết nối cơ sở dữ liệu
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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
const register = async (fullname, email, password) => {
    try {
        // Kiểm tra email đã tồn tại
        const [existingUsers] = await db.query(
            'SELECT * FROM Members WHERE Email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            throw new Error('Email đã được sử dụng');
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới
        const [result] = await db.query(
            'INSERT INTO Members (FullName, Email, Password, RoleID) VALUES (?, ?, ?, 345)',
            [fullname, email, hashedPassword]
        );

        // Gửi email chào mừng
        await sendWelcomeEmail(email, fullname);

        return {
            id: result.insertId,
            email,
            fullname
        };
    } catch (error) {
        throw error;
    }
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

const sendWelcomeEmail = async (email, fullname) => {
    try {
        // Đọc template
        const templatePath = path.join(__dirname, '../templates/registerSuccessTemplate.html');
        let template = fs.readFileSync(templatePath, 'utf8');

        // Thay thế các biến trong template
        template = template
            .replace('{{fullname}}', fullname)
            .replace('{{email}}', email)
            .replace('{{loginUrl}}', `${process.env.CLIENT_URL}/login`);

        // Cấu hình email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Gửi email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Chào mừng bạn đến với hệ thống',
            html: template
        });

        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

module.exports = {
    login,
    register,
    refreshToken,
    sendWelcomeEmail
};