const db = require('../config/db'); // Kết nối cơ sở dữ liệu
const { deleteByMemberId } = require('./logService');

const Report = {
    // Lấy tất cả các báo cáo
    getAll: async () => {
        const sql = `
            SELECT 
                r.ReportID, 
                r.Title, 
                r.Content, 
                r.CreatedBy, 
                r.CreatedAt, 
                r.JSONData, 
                m.FullName AS CreatedByName
            FROM Reports r
            JOIN Members m ON r.CreatedBy = m.MemberID`;
        const [rows] = await db.query(sql);
        return rows;
    },

    // Lấy báo cáo theo ID
    getById: async (id) => {
        const sql = `
            SELECT 
                r.ReportID, 
                r.Title, 
                r.Content, 
                r.CreatedBy, 
                r.CreatedAt, 
                r.JSONData, 
                m.FullName AS CreatedByName
            FROM Reports r
            JOIN Members m ON r.CreatedBy = m.MemberID
            WHERE r.ReportID = ?`;
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Trả về báo cáo nếu tồn tại, nếu không trả về null
    },

    // Tạo mới một báo cáo
    create: async (data) => {
        const sql = `
            INSERT INTO Reports (Title, Content, CreatedBy, CreatedAt, JSONData) 
            VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [
            data.Title,
            data.Content,
            data.CreatedBy,
            data.CreatedAt,
            JSON.stringify(data.JSONData) // Chuyển JSONData thành chuỗi trước khi lưu
        ]);
        return result; // Trả về kết quả của việc thêm
    },

    // Cập nhật báo cáo
    update: async (id, data) => {
        const sql = `
            UPDATE Reports 
            SET Title = ?, Content = ?, JSONData = ? 
            WHERE ReportID = ?`;
        const [result] = await db.query(sql, [
            data.Title,
            data.Content,
            JSON.stringify(data.JSONData), // Cập nhật JSONData dưới dạng chuỗi
            id
        ]);
        return result; // Trả về kết quả của việc cập nhật
    },

    // Xóa báo cáo
    delete: async (id) => {
        const sql = 'DELETE FROM Reports WHERE ReportID = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Trả về kết quả của việc xóa
    },

    // Xóa báo cáo
    deleteByMemberId: async (id) => {
        const sql = 'DELETE FROM Reports WHERE CreatedBy = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Trả về kết quả của việc xóa
    },
};

module.exports = Report;
