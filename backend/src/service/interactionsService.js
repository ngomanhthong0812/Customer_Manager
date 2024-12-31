const db = require('../config/db'); // Đảm bảo kết nối đúng

const Interaction = {
    // Lấy tất cả Interactions
    getAll: async (limit, offset, search, startDate, endDate, type) => {
        try {
            let sql = `
                SELECT 
                    i.InteractionID,
                    i.MemberID,
                    m1.FullName as MemberName,
                    i.CustomerID,
                    m2.FullName as CustomerName,
                    i.SenderID,
                    m3.FullName as SenderName,
                    i.InteractionType,
                    i.Notes,
                    DATE_FORMAT(i.CreatedAt, '%Y-%m-%d %H:%i:%s') as CreatedAt,
                    DATE_FORMAT(i.UpdatedAt, '%Y-%m-%d %H:%i:%s') as UpdatedAt
                FROM Interactions i
                LEFT JOIN Members m1 ON i.MemberID = m1.MemberID
                LEFT JOIN Members m2 ON i.CustomerID = m2.MemberID
                LEFT JOIN Members m3 ON i.SenderID = m3.MemberID
                WHERE 1=1
            `;

            const params = [];

            // Thêm điều kiện tìm kiếm
            if (search) {
                sql += ` AND (
                    m1.FullName LIKE ? OR 
                    m2.FullName LIKE ? OR
                    i.Notes LIKE ?
                )`;
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern);
            }

            // Thêm điều kiện lọc theo loại tương tác
            if (type) {
                sql += ` AND i.InteractionType = ?`;
                params.push(type);
            }

            // Thêm điều kiện lọc theo ngày
            if (startDate) {
                sql += ` AND DATE(i.CreatedAt) >= ?`;
                params.push(startDate);
            }
            if (endDate) {
                sql += ` AND DATE(i.CreatedAt) <= ?`;
                params.push(endDate);
            }

            // Thêm sắp xếp và phân trang
            sql += ` ORDER BY i.CreatedAt DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            // Thực hiện truy vấn chính
            const [rows] = await db.query(sql, params);

            // Đếm tổng số bản ghi
            let countSql = `
                SELECT COUNT(*) as total 
                FROM Interactions i
                LEFT JOIN Members m ON i.MemberID = m.MemberID
                WHERE 1=1
            `;

            const countParams = [];

            if (search) {
                countSql += ` AND (
                    m.FullName LIKE ? OR 
                    i.Notes LIKE ?
                )`;
                const searchPattern = `%${search}%`;
                countParams.push(searchPattern, searchPattern);
            }

            if (type) {
                countSql += ` AND i.InteractionType = ?`;
                countParams.push(type);
            }

            if (startDate) {
                countSql += ` AND DATE(i.CreatedAt) >= ?`;
                countParams.push(startDate);
            }
            if (endDate) {
                countSql += ` AND DATE(i.CreatedAt) <= ?`;
                countParams.push(endDate);
            }

            const [[{ total }]] = await db.query(countSql, countParams);
            const totalPages = Math.ceil(total / limit);

            return {
                interactions: rows,
                totalInteractions: total,
                totalPages: totalPages
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy một Interaction theo ID
    getById: async (id) => {
        const sql = 'SELECT * FROM Interactions WHERE InteractionID = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Trả về bản ghi nếu có, nếu không trả về null
    },

    getInteractionByMemberIdAndAdminId: async (memberId, customerId) => {
        const sql = 'SELECT * FROM Interactions WHERE MemberID = ? AND CustomerID = ?';
        const [rows] = await db.query(sql, [memberId, customerId]);
        return rows; // Trả về mảng các bản ghi
    },

    // Thêm một Interaction mới
    create: async (data) => {
        console.log(data);

        const sql = `INSERT INTO Interactions (
            MemberID, 
            CustomerID, 
            InteractionType, 
            Notes,
            SenderID
        ) VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            data.MemberID,
            data.CustomerID,
            data.InteractionType,
            data.Notes,
            data.SenderID
        ]);
        return result;
    },

    // Cập nhật một Interaction
    update: async (id, data) => {
        const sql = `UPDATE Interactions 
                     SET Notes = ? 
                     WHERE InteractionID = ?`;
        const [result] = await db.query(sql, [data.Notes, id]);
        return result; // Trả về kết quả của việc cập nhật
    },

    // Xóa một Interaction
    delete: async (id) => {
        const sql = 'DELETE FROM Interactions WHERE InteractionID = ?';
        const [result] = await db.query(sql, [id]);
        return result; // Trả về kết quả của việc xóa
    },

    deleteByMemberId: async (memberId) => {
        const query = 'DELETE FROM Interactions WHERE CustomerID = ? OR MemberID = ?';
        const [result] = await db.query(query, [memberId, memberId]);
        return result;
    },
};

module.exports = Interaction;
