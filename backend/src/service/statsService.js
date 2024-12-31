const db = require('../config/db');
const ExcelJS = require('exceljs');

const statsService = {
    // Thống kê members
    getMemberStats: async (startDate, endDate) => {
        let sql = `
            SELECT 
                COUNT(*) as totalMembers,
                SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as activeMembers,
                SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as inactiveMembers,
                DATE_FORMAT(MIN(CreatedAt), '%Y-%m-%d') as earliestMember,
                DATE_FORMAT(MAX(CreatedAt), '%Y-%m-%d') as latestMember
            FROM Members
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            sql += ` AND DATE(CreatedAt) >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND DATE(CreatedAt) <= ?`;
            params.push(endDate);
        }

        const [[result]] = await db.query(sql, params);
        return result;
    },

    // Thống kê tương tác theo tháng
    getInteractionStats: async (startDate, endDate) => {
        let sql = `
            SELECT 
                DATE_FORMAT(CreatedAt, '%Y-%m') as month,
                COUNT(*) as totalInteractions,
                COUNT(DISTINCT MemberID) as uniqueMembers,
                COUNT(DISTINCT CustomerID) as uniqueCustomers,
                COUNT(DISTINCT SenderID) as uniqueSenders,
                SUM(CASE WHEN InteractionType = 'Call' THEN 1 ELSE 0 END) as calls,
                SUM(CASE WHEN InteractionType = 'Email' THEN 1 ELSE 0 END) as emails,
                SUM(CASE WHEN InteractionType = 'Meeting' THEN 1 ELSE 0 END) as meetings,
                SUM(CASE WHEN InteractionType = 'Others' THEN 1 ELSE 0 END) as others
            FROM Interactions
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            sql += ` AND DATE(CreatedAt) >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND DATE(CreatedAt) <= ?`;
            params.push(endDate);
        }

        sql += ` GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
                ORDER BY month DESC`;

        const [results] = await db.query(sql, params);
        return results;
    },

    // Thống kê phản hồi
    getFeedbackStats: async (startDate, endDate) => {
        let sql = `
            SELECT 
                COUNT(*) as totalFeedbacks,
                AVG(Rating) as averageRating,
                COUNT(DISTINCT CustomerID) as uniqueCustomers,
                SUM(CASE WHEN Rating >= 4 THEN 1 ELSE 0 END) as positiveCount,
                SUM(CASE WHEN Rating <= 2 THEN 1 ELSE 0 END) as negativeCount
            FROM Feedbacks
            WHERE 1=1
        `;
        const params = [];

        if (startDate) {
            sql += ` AND DATE(CreatedAt) >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND DATE(CreatedAt) <= ?`;
            params.push(endDate);
        }

        const [[result]] = await db.query(sql, params);
        return result;
    },

    // Xuất báo cáo Excel
    exportStats: async (startDate, endDate) => {
        // Lấy dữ liệu thống kê
        const memberStats = await statsService.getMemberStats(startDate, endDate);
        const interactionStats = await statsService.getInteractionStats(startDate, endDate);

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();

        // Thêm worksheet thống kê members
        const memberSheet = workbook.addWorksheet('Member Statistics');
        memberSheet.addRows([
            ['Thống kê thành viên'],
            ['Tổng số thành viên', memberStats.totalMembers],
            ['Thành viên đang hoạt động', memberStats.activeMembers],
            ['Thành viên không hoạt động', memberStats.inactiveMembers],
            ['Thành viên đầu tiên', memberStats.earliestMember],
            ['Thành viên mới nhất', memberStats.latestMember]
        ]);

        // Thêm worksheet thống kê tương tác
        const interactionSheet = workbook.addWorksheet('Interaction Statistics');
        interactionSheet.addRow(['Tháng', 'Tổng tương tác', 'Số thành viên', 'Số khách hàng', 'Cuộc gọi', 'Email', 'Cuộc họp', 'Khác']);
        interactionStats.forEach(stat => {
            interactionSheet.addRow([
                stat.month,
                stat.totalInteractions,
                stat.uniqueMembers,
                stat.uniqueCustomers,
                stat.calls,
                stat.emails,
                stat.meetings,
                stat.others
            ]);
        });

        // Buffer để trả về
        return await workbook.xlsx.writeBuffer();
    },

    // Thống kê tổng quan cho dashboard
    getDashboardStats: async (startDate, endDate) => {
        const memberStats = await statsService.getMemberStats(startDate, endDate);
        const interactionStats = await statsService.getInteractionStats(startDate, endDate);
        const feedbackStats = await statsService.getFeedbackStats(startDate, endDate);

        return {
            memberStats,
            interactionStats,
            feedbackStats
        };
    },

    // Thống kê trạng thái thành viên
    getMemberStatusStats: async () => {
        const sql = `
            SELECT 
                IsActive,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Members), 2) as percentage
            FROM Members
            GROUP BY IsActive
        `;

        const [results] = await db.query(sql);
        return results;
    }
};

module.exports = statsService; 