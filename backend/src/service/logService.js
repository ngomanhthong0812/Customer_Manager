const db = require('../config/db'); // Kết nối cơ sở dữ liệu

const Log = {
    // Lấy tất cả các log
    getAll: async () => {
        const sql = `
            SELECT 
                l.LogID, 
                l.MemberID, 
                m.FullName AS MemberName, 
                l.ActionType, 
                l.ActionDescription, 
                l.CreatedAt 
            FROM Logs l
            JOIN Members m ON l.MemberID = m.MemberID
            ORDER BY l.CreatedAt DESC`;
        const [rows] = await db.query(sql);
        return rows;
    },

    getByMemberId: async (id, limit, offset) => {
        // Lấy logs của thành viên với phân trang
        const sql = `
        SELECT 
            l.LogID, 
            l.MemberID, 
            m.FullName AS MemberName, 
            l.ActionType, 
            l.ActionDescription, 
            l.CreatedAt 
        FROM Logs l
        JOIN Members m ON l.MemberID = m.MemberID
        WHERE l.MemberID = ? 
        ORDER BY l.CreatedAt DESC
        LIMIT ? 
        OFFSET ?`;

        // Lấy logs với limit và offset
        const [rows] = await db.query(sql, [id, limit, offset]);

        // Lấy tổng số logs của thành viên này để tính số trang
        const countSql = 'SELECT COUNT(*) AS total FROM Logs WHERE MemberID = ?';
        const [[{ total }]] = await db.query(countSql, [id]);

        // Tính toán số trang
        const totalPages = Math.ceil(total / limit);

        return {
            logs: rows,  // Các log của thành viên
            totalLogs: total,  // Tổng số logs
            totalPages: totalPages,  // Số trang
        };
    },


    // Lấy log theo ID
    getById: async (id) => {
        const sql = `
            SELECT 
                l.LogID, 
                l.MemberID, 
                m.FullName AS MemberName, 
                l.ActionType, 
                l.ActionDescription, 
                l.CreatedAt 
            FROM Logs l
            JOIN Members m ON l.MemberID = m.MemberID
            WHERE l.LogID = ?`;
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Trả về log nếu có, nếu không trả về null
    },

    // Thêm log mới
    create: async (data) => {
        const sql = `
            INSERT INTO Logs (MemberID, ActionType, ActionDescription) 
            VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [
            data.MemberID,
            data.ActionType,
            data.ActionDescription,
        ]);
        return result; // Trả về kết quả của việc thêm log
    },

    // Cập nhật log
    update: async (id, data) => {
        const sql = `
        UPDATE Logs 
        SET MemberID = ?, ActionType = ?, ActionDescription = ?
        WHERE LogID = ?`;
        const [result] = await db.query(sql, [
            data.MemberID,
            data.ActionType,
            data.ActionDescription,
            id,
        ]);
        return result; // Trả về kết quả của việc cập nhật
    },


    // Xóa log
    delete: async (id) => {
        const sql = 'DELETE FROM Logs WHERE LogID = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Trả về kết quả của việc xóa
    },

    deleteByMemberId: async (memberId) => {
        const query = 'DELETE FROM logs WHERE MemberID = ?';
        const [result] = await db.query(query, [memberId]);
        return result;
    },
};

module.exports = Log;
