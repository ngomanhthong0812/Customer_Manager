const db = require('../config/db');
const bcrypt = require('bcrypt');

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const Member = {
    // Kiểm tra email đã tồn tại
    checkEmailExist: async (id, Email) => {
        const query = 'SELECT * FROM members WHERE Email = ? AND MemberID != ?';
        const [rows] = await db.execute(query, [Email, id]);
        return rows.length > 0;
    },

    // Kiểm tra số điện thoại đã tồn tại
    checkPhoneExist: async (id, Phone) => {
        const query = 'SELECT * FROM members WHERE Phone = ? AND MemberID != ?';
        const [rows] = await db.execute(query, [Phone, id]);
        return rows.length > 0;
    },

    // Lấy tất cả members
    getAll: async (limit, offset, search) => {
        let sql;
        let params;

        if (search) {
            sql = `SELECT * FROM members 
                   WHERE FullName LIKE ? OR Email LIKE ? OR Phone LIKE ?
                   ORDER BY CreatedAt DESC
                   LIMIT ? OFFSET ?`;
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern, limit, offset];
        } else {
            sql = `SELECT * FROM members 
                   ORDER BY CreatedAt DESC
                   LIMIT ? OFFSET ?`;
            params = [limit, offset];
        }

        const [rows] = await db.query(sql, params); // Trả về kết quả truy vấn

        // Lấy tổng số members để tính số trang
        let countSql = 'SELECT COUNT(*) AS total FROM members';
        if (search) {
            countSql += ` WHERE FullName LIKE ? OR Email LIKE ? OR Phone LIKE ?`;
            const searchPattern = `%${search}%`;
            const [[{ total }]] = await db.query(countSql, [searchPattern, searchPattern, searchPattern]);
            const totalPages = Math.ceil(total / limit);
            return {
                members: rows,
                totalMembers: total,
                totalPages: totalPages,
            };
        }

        const [[{ total }]] = await db.query(countSql);
        const totalPages = Math.ceil(total / limit);

        return {
            members: rows,  // Danh sách members
            totalMembers: total,  // Tổng số members
            totalPages: totalPages,  // Số trang
        };
    },

    // Lấy một member theo ID
    getById: async (id) => {
        const sql = 'SELECT * FROM members WHERE MemberID = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Trả về đối tượng member nếu có
    },

    // Lấy ra tất cả member với role
    getByRole: async (role) => {
        const sql = 'SELECT * FROM members WHERE RoleID = ?';
        const [rows] = await db.query(sql, [role]);
        return rows; // Trả về đối tượng member nếu có
    },


    // Thêm một member mới
    create: async (data) => {
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(data.Password, 10);

        const sql = `INSERT INTO members (RoleID, FullName, Email, Phone, Address, Password, Code, IsActive) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [data.RoleID, data.FullName, data.Email, data.Phone, data.Address, hashedPassword, data.Code, data.IsActive]);
        return result; // Trả về kết quả của việc chèn
    },

    // Cập nhật một member
    update: async (id, data) => {
        const sql = `UPDATE members 
                     SET RoleID = ?, FullName = ?, Email = ?, Phone = ?, Address = ?, IsActive = ? 
                     WHERE MemberID = ?`;
        const [result] = await db.query(sql, [data.RoleID, data.FullName, data.Email, data.Phone, data.Address, data.IsActive, id]);
        return result; // Trả về kết quả của việc cập nhật
    },

    // Xóa một member
    delete: async (id) => {
        const sql = 'DELETE FROM members WHERE MemberID = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Trả về kết quả của việc xóa
    },

    getByEmail: async (email) => {
        const sql = 'SELECT * FROM Members WHERE Email = ?';
        const [rows] = await db.query(sql, [email]);
        return rows[0]; // Trả về bản ghi nếu có, nếu không trả về null
    },

    getByPhone: async (phone) => {
        const sql = 'SELECT * FROM Members WHERE Phone = ?';
        const [rows] = await db.query(sql, [phone]);
        return rows[0]; // Trả về bản ghi nếu có, nếu không trả về null
    },

    changePassword: async (memberId, currentPassword, newPassword) => {
        // Query to get the member by ID
        const sql = 'SELECT * FROM members WHERE MemberID = ?';
        const [rows] = await db.query(sql, [memberId]);

        const member = rows[0];  // Only one member should be returned

        if (!member) {
            throw new Error('Member không tồn tại');
        }

        // Compare current password with the stored password
        const isMatch = await bcrypt.compare(currentPassword, member.Password);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không chính xác');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the member's password in the database
        const updateSql = 'UPDATE members SET Password = ? WHERE MemberID = ?';
        const [result] = await db.query(updateSql, [hashedPassword, memberId]);

        if (result.affectedRows === 0) {
            throw new Error('Không thể cập nhật mật khẩu');
        }

        // Return success result
        return {
            success: true,
            message: 'Mật khẩu đã được thay đổi thành công',
        };
    },

    generateResetCode: () => {
        return crypto.randomInt(100000, 999999).toString();
    },

    getEmailTemplate: (resetCode) => {
        const templatePath = path.join(__dirname, '../templates/resetPasswordTemplate.html');
        let template = fs.readFileSync(templatePath, 'utf8');
        template = template.replace('{{RESET_CODE}}', resetCode);
        return template;
    },

    sendResetCode: async (email) => {
        try {
            const resetCode = Member.generateResetCode();

            // Lưu mã xác nhận vào cơ sở dữ liệu
            const sql = 'UPDATE members SET Code = ? WHERE Email = ?';
            const [result] = await db.query(sql, [resetCode, email]);
            if (result.affectedRows === 0) {
                throw new Error('Không thể cập nhật mã xác nhận.');
            }

            // Tạo template email
            const emailTemplate = Member.getEmailTemplate(resetCode);

            // Cấu hình gửi email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Khôi phục mật khẩu - Mã xác nhận',
                html: emailTemplate, // Sử dụng template HTML
            };

            await transporter.sendMail(mailOptions);

            return { success: true, message: 'Mã xác nhận đã được gửi đến email của bạn.' };
        } catch (error) {
            throw error;
        }
    },

    // Xác nhận mã và mật khẩu mới
    confirmResetCode: async (email, resetCode, newPassword) => {
        // Kiểm tra mã xác nhận và email
        const sql = 'SELECT * FROM members WHERE Email = ?';
        const [rows] = await db.query(sql, [email]);
        const member = rows[0];

        if (member.code !== resetCode) {
            throw new Error('Mã xác nhận không chính xác');
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới vào cơ sở dữ liệu
        const updateSql = 'UPDATE members SET Password = ?, Code = NULL WHERE Email = ?';
        const [result] = await db.query(updateSql, [hashedPassword, email]);

        if (result.affectedRows === 0) {
            throw new Error('Không thể cập nhật mật khẩu');
        }

        return {
            success: true,
            message: 'Mật khẩu đã được cập nhật thành công',
        };
    },

    // Cập nhật trạng thái member
    updateStatus: async (id) => {
        console.log(id);

        const sql = 'UPDATE members SET IsActive = NOT IsActive WHERE MemberID = ?';
        const [result] = await db.query(sql, [id]);
        return result;
    },
};

module.exports = Member;
