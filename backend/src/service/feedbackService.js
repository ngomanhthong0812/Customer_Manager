const db = require('../config/db'); // Ensure correct DB connection

const Feedback = {
    // Lấy tất cả Feedbacks
    getAll: async (page, limit, search, rating) => {
        try {
            let sql = `
                SELECT 
                    f.FeedbackID,
                    f.CustomerID,
                    m.FullName as CustomerName,
                    f.Content,
                    f.Rating,
                    f.ReviewImage,
                    DATE_FORMAT(f.CreatedAt, '%Y-%m-%d %H:%i:%s') as CreatedAt,
                    DATE_FORMAT(f.UpdatedAt, '%Y-%m-%d %H:%i:%s') as UpdatedAt
                FROM Feedbacks f
                LEFT JOIN Members m ON f.CustomerID = m.MemberID
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                sql += ` AND (m.FullName LIKE ? OR f.Content LIKE ?)`;
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern);
            }

            if (rating) {
                sql += ` AND f.Rating = ?`;
                params.push(rating);
            }

            // Đếm tổng số bản ghi
            const [[{ total }]] = await db.query(
                `SELECT COUNT(*) as total FROM Feedbacks f 
                LEFT JOIN Members m ON f.CustomerID = m.MemberID 
                WHERE 1=1` +
                (search ? ` AND (m.FullName LIKE ? OR f.Content LIKE ?)` : '') +
                (rating ? ` AND f.Rating = ?` : ''),
                params
            );

            // Thêm phân trang
            sql += ` ORDER BY f.CreatedAt DESC LIMIT ? OFFSET ?`;
            params.push(limit, (page - 1) * limit);

            const [rows] = await db.query(sql, params);

            const totalPages = Math.ceil(total / limit);

            return {
                feedbacks: rows,
                totalFeedbacks: total,
                totalPages: totalPages
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy một Feedback theo ID
    getById: async (id) => {
        const sql = 'SELECT * FROM Feedbacks WHERE FeedbackID = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    // Thêm một Feedback mới
    create: async (data) => {
        const sql = `INSERT INTO Feedbacks (
            CustomerID, 
            Content, 
            Rating,
            ReviewImage
        ) VALUES (?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            data.CustomerID,
            data.Content,
            data.Rating,
            data.ReviewImage || null
        ]);
        return result;
    },

    // Cập nhật một Feedback
    update: async (id, data) => {
        const sql = `UPDATE Feedbacks 
                     SET Content = ?,
                         Rating = ?,
                         ReviewImage = ?,
                         UpdatedAt = CURRENT_TIMESTAMP
                     WHERE FeedbackID = ?`;
        const [result] = await db.query(sql, [
            data.Content,
            data.Rating,
            data.ReviewImage || null,
            id
        ]);
        return result;
    },

    // Xóa một Feedback
    delete: async (id) => {
        const sql = 'DELETE FROM Feedbacks WHERE FeedbackID = ?';
        const [result] = await db.query(sql, [id]);
        return result;
    },

    deleteByMemberId: async (memberId) => {
        const query = 'DELETE FROM Feedbacks WHERE CustomerID = ?';
        const [result] = await db.query(query, [memberId]);
        return result;
    }
};

module.exports = Feedback;
