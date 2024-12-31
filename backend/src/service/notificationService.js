const db = require('../config/db');

const notificationService = {
    // Lấy danh sách thông báo
    getAll: async (type) => {
        try {
            let sql = `
                SELECT 
                    n.NotificationID,
                    n.SenderID,
                    m.FullName as SenderName,
                    n.Title,
                    n.Content,
                    n.Type,
                    DATE_FORMAT(n.CreatedAt, '%Y-%m-%d %H:%i:%s') as CreatedAt
                FROM notifications n
                LEFT JOIN members m ON n.SenderID = m.MemberID
                WHERE 1=1
            `;

            const params = [];

            if (type === 'MEMBER') {
                sql += ` AND (n.Type = 'MEMBER' OR n.Type = 'ALL')`;
            } else if (type === 'ADMIN') {
                sql += ` AND (n.Type = 'ADMIN' OR n.Type = 'ALL')`;
            } else if (type === 'ALL') {
                sql += ` AND (n.Type = 'ADMIN' OR n.Type = 'MEMBER' OR n.Type = 'ALL')`;
            } else if (type) {
                sql += ` AND n.Type = ?`;
                params.push(type);
            }

            sql += ` ORDER BY n.CreatedAt DESC`;

            const [notifications] = await db.query(sql, params);

            return notifications;
        } catch (error) {
            throw error;
        }
    },

    // Tạo thông báo mới
    create: async (data) => {
        try {
            const sql = `
                INSERT INTO notifications 
                (SenderID, Title, Content, Type) 
                VALUES (?, ?, ?, ?)
            `;

            const [result] = await db.query(sql, [
                data.SenderID,
                data.Title,
                data.Content,
                data.Type
            ]);

            // Thêm vào bảng notification_readers cho các member phù hợp
            if (data.Type === 'ADMIN') {
                await db.query(`
                    INSERT INTO notification_readers (NotificationID, MemberID)
                    SELECT ?, m.MemberID
                    FROM members m
                    INNER JOIN roles r ON m.RoleID = r.RoleID
                    WHERE r.RoleName = 'Admin'
                `, [result.insertId]);
            } else if (data.Type === 'MEMBER') {
                await db.query(`
                    INSERT INTO notification_readers (NotificationID, MemberID)
                    SELECT ?, MemberID
                    FROM members
                    WHERE IsActive = 1
                `, [result.insertId]);
            } else if (data.Type === 'ALL') {
                await db.query(`
                    INSERT INTO notification_readers (NotificationID, MemberID)
                    SELECT ?, MemberID
                    FROM members
                    WHERE IsActive = 1
                `, [result.insertId]);
            }

            // Gửi thông báo qua socket


            return result;
        } catch (error) {
            throw error;
        }
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (memberId) => {
        console.log(memberId);

        try {
            const sql = `
                UPDATE notification_readers 
                SET IsRead = 1, ReadAt = CURRENT_TIMESTAMP
                WHERE MemberID = ?
            `;

            const [result] = await db.query(sql, [memberId]);
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Lấy thông báo chưa đọc của một member
    getUnreadByMember: async (memberId) => {
        try {
            const sql = `
                SELECT 
                    n.*,
                    m.FullName as SenderName,
                    nr.IsRead,
                    nr.ReadAt
                FROM notifications n
                INNER JOIN notification_readers nr ON n.NotificationID = nr.NotificationID
                LEFT JOIN members m ON n.SenderID = m.MemberID
                WHERE nr.MemberID = ? AND nr.IsRead = 0
                ORDER BY n.CreatedAt DESC
            `;

            const [notifications] = await db.query(sql, [memberId]);
            return notifications;
        } catch (error) {
            throw error;
        }
    },

    deleteNotificationByMemberId: async (memberId) => {
        // Delete from notification_readers first due to foreign key constraint
        const deleteReadersQuery = 'DELETE FROM notification_readers WHERE MemberID = ?';
        await db.query(deleteReadersQuery, [memberId]);

        // Then delete from notifications
        const deleteNotificationsQuery = 'DELETE FROM notifications WHERE SenderID = ?';
        const [result] = await db.query(deleteNotificationsQuery, [memberId]);

        return result;
    },

};

module.exports = notificationService; 