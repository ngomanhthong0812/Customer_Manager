const db = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

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

    // Xuất báo cáo Excel và PDF
    exportStats: async (startDate, endDate, format = 'excel') => {
        // Lấy dữ liệu thống kê
        const memberStats = await statsService.getMemberStats(startDate, endDate);
        const interactionStats = await statsService.getInteractionStats(startDate, endDate);
        const feedbackStats = await statsService.getFeedbackStats(startDate, endDate);

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();

            // Tạo worksheet
            const sheet = workbook.addWorksheet('Thống kê');

            // **PHẦN: Thống kê thành viên**
            sheet.addRow(['Thống kê thành viên']);
            sheet.mergeCells('A1:B1'); // Gộp ô tiêu đề
            sheet.getCell('A1').font = { bold: true, size: 16 }; // Font chữ lớn, in đậm
            sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }; // Căn giữa

            sheet.addRows([
                ['Tổng số khách hàng', memberStats.totalMembers],
                ['Khách hàng đang hoạt động', memberStats.activeMembers],
                ['Khách hàng không hoạt động', memberStats.inactiveMembers],
                ['Khách hàng đầu tiên', memberStats.earliestMember],
                ['Khách hàng mới nhất', memberStats.latestMember],
            ]);

            // Định dạng cột
            sheet.columns = [
                { width: 30 }, // Cột A
                { width: 20 }, // Cột B
                { width: 20 }, // Cột C
                { width: 20 }, // Cột D
                { width: 20 }, // Cột E
            ];

            // **PHẦN: Thống kê tương tác**
            const startRow = sheet.lastRow.number + 2; // Tạo khoảng cách 2 dòng trống
            sheet.addRow(['Thống kê tương tác']);
            sheet.mergeCells(`A${startRow}:H${startRow}`); // Gộp ô tiêu đề
            sheet.getCell(`A${startRow}`).font = { bold: true, size: 16 }; // Font chữ lớn, in đậm
            sheet.getCell(`A${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' }; // Căn giữa

            sheet.addRow(['Tháng', 'Tổng tương tác', 'Tổng phản hồi', 'Số thành viên', 'Số khách hàng']);
            const headerRow = sheet.lastRow;

            // Định dạng header
            headerRow.eachCell(cell => {
                cell.font = { bold: true }; // In đậm
                cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Căn giữa
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } }; // Màu nền vàng
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            // Thêm dữ liệu
            interactionStats.forEach(stat => {
                sheet.addRow([
                    stat.month,
                    stat.totalInteractions,
                    feedbackStats.totalFeedbacks || 0,
                    stat.uniqueMembers,
                    stat.uniqueCustomers,
                ]);
            });

            // Định dạng viền cho các ô dữ liệu
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber > startRow) {
                    row.eachCell(cell => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                }
            });

            return await workbook.xlsx.writeBuffer();
        }
        else if (format === 'pdf') {
            // Tạo document PDF mới với font hỗ trợ tiếng Việt
            const doc = new PDFDocument({
                font: 'Helvetica',
                size: 'A4'
            });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));

            // Thêm thống kê thành viên
            doc.font('Helvetica-Bold').fontSize(16).text('Thong ke thanh vien', { underline: true });
            doc.moveDown();
            doc.font('Helvetica').fontSize(12)
                .text(`Tong so khach hang: ${memberStats.totalMembers}`)
                .text(`Khach hang dang hoat dong: ${memberStats.activeMembers}`)
                .text(`Khach hang khong hoat dong: ${memberStats.inactiveMembers}`)
                .text(`Khach hang dau tien: ${memberStats.earliestMember}`)
                .text(`Khach hang moi nhat: ${memberStats.latestMember}`);

            doc.moveDown();

            // Thêm thống kê tương tác
            doc.font('Helvetica-Bold').fontSize(16).text('Thong ke tuong tac', { underline: true });
            doc.moveDown();

            // Tạo bảng thống kê tương tác
            interactionStats.forEach(stat => {
                doc.font('Helvetica').fontSize(12).text(
                    `Thang ${stat.month}:
                    - Tong tuong tac: ${stat.totalInteractions}
                    - Tong phan hoi: ${feedbackStats.totalFeedbacks || 0}
                    - So thanh vien: ${stat.uniqueMembers}
                    - So khach hang: ${stat.uniqueCustomers}`
                );
                doc.moveDown();
            });

            doc.end();

            return new Promise((resolve) => {
                doc.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });
            });
        }
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