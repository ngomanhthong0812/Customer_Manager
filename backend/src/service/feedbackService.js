const db = require('../config/db'); // Ensure correct DB connection

const Feedback = {
    // Lấy tất cả Feedbacks
    getAll: async (page, limit, search, rating) => {
        let sql = 'SELECT * FROM Feedbacks';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('Content LIKE ?');
            params.push(`%${search}%`);
        }

        if (rating) {
            conditions.push('Rating = ?');
            params.push(rating);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Add pagination
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);

        // Count total records
        let countSql = 'SELECT COUNT(*) as total FROM Feedbacks';
        if (conditions.length > 0) {
            countSql += ' WHERE ' + conditions.join(' AND ');
        }
        const [[{ total }]] = await db.query(countSql, params.slice(0, -2));
        const totalPages = Math.ceil(total / limit);

        return {
            feedbacks: rows,
            totalFeedbacks: total,
            totalPages: totalPages
        };
    },

    // Lấy một Feedback theo ID
    getById: async (id) => {
        const sql = 'SELECT * FROM Feedbacks WHERE FeedbackID = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Return the record if exists, otherwise null
    },

    // Thêm một Feedback mới
    create: async (data) => {
        const sql = `INSERT INTO Feedbacks (CustomerID, Content, Rating) 
                     VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [data.CustomerID, data.Content, data.Rating]);
        return result; // Return the result of the insert
    },

    // Cập nhật một Feedback
    update: async (id, data) => {
        const sql = `UPDATE Feedbacks 
                     SET Content = ?
                     WHERE FeedbackID = ?`;
        const [result] = await db.query(sql, [data.Content, id]);
        return result; // Return the result of the update
    },

    // Xóa một Feedback
    delete: async (id) => {
        const sql = 'DELETE FROM Feedbacks WHERE FeedbackID = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Return the result of the delete
    },

    deleteByMemberId: async (memberId) => {
        const query = 'DELETE FROM Feedbacks WHERE CustomerID = ?';
        const [result] = await db.query(query, [memberId]);
        return result;
    },
};

module.exports = Feedback;
