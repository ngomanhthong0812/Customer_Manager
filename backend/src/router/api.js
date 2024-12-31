const express = require('express');

const memberController = require('../controller/memberController');
const interactionController = require('../controller/interactionController');
const feedbackController = require('../controller/feedbackController');
const reportController = require('../controller/reportController');
const logController = require('../controller/logController');
const authController = require('../controller/authController');
const statsController = require('../controller/statsController');
const notificationController = require('../controller/notificationController');

const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

const initAPIRoutes = (app) => {
    // API Member
    router.post('/member/forgot-password', memberController.forgotPassword); // Gửi mail khôi phục mật khẩu
    router.post('/member/reset-password', memberController.confirmPasswordReset); // khôi phục mật khẩu
    router.put("/member/changePassword", authenticateToken, memberController.changePassword); // đổi mật khẩu
    router.put('/member/status/:id', memberController.updateMemberStatus);
    router.get("/member/", authenticateToken, authorizeAdmin, memberController.getAllMembers); // Chỉ admin mới được lấy danh sách members
    router.get("/member/role/:role", authenticateToken, memberController.getMemberByRole);
    router.post("/member/", authenticateToken, authorizeAdmin, memberController.createMember); // Chỉ admin mới được thêm member
    router.delete("/member/:id", authenticateToken, authorizeAdmin, memberController.deleteMember); // Chỉ admin mới được xóa member
    router.get("/member/:id", authenticateToken, memberController.getMemberById);// chi tiết member
    router.put("/member/:id", authenticateToken, memberController.updateMember); // cập nhật member

    //auth
    router.post("/login", authController.loginController); // Đăng nhập và lấy token
    router.post("/register", authController.registerController); // Đăng kí
    router.post("/logout", authController.logout); // Đăng xuất
    router.post("/refreshToken", authController.refreshToken); // refresh token

    //API Interactions
    router.get("/interaction/", authenticateToken, interactionController.getAllInteractions);
    router.post("/interaction/", authenticateToken, interactionController.createInteraction);
    router.delete("/interaction/:id", authenticateToken, interactionController.deleteInteraction);
    router.get("/interaction/:id", authenticateToken, interactionController.getInteractionById);
    router.put("/interaction/:id", authenticateToken, interactionController.updateInteraction);
    router.get("/interaction/member/:memberId/customer/:customerId", authenticateToken, interactionController.getInteractionByMemberIdAndAdminId);

    //API Feedbacks
    router.get("/feedback/", authenticateToken, feedbackController.getAllFeedbacks);
    router.post("/feedback/", authenticateToken, feedbackController.createFeedback);
    router.delete("/feedback/:id", authenticateToken, feedbackController.deleteFeedback);
    router.get("/feedback/:id", authenticateToken, feedbackController.getFeedbackById);
    router.put("/feedback/:id", authenticateToken, feedbackController.updateFeedback);

    //API Reports
    router.get("/report/", authenticateToken, authorizeAdmin, reportController.getAllReports);
    router.post("/report/", authenticateToken, authorizeAdmin, reportController.createReport);
    router.delete("/report/:id", authenticateToken, authorizeAdmin, reportController.deleteReport);
    router.get("/report/:id", authenticateToken, authorizeAdmin, reportController.getReportById);
    router.put("/report/:id", authenticateToken, authorizeAdmin, reportController.updateReport);

    //API Logs
    router.get("/log/", authenticateToken, logController.getAllLogs);
    router.post("/log/", authenticateToken, logController.createLog);
    router.delete("/log/:id", authenticateToken, logController.deleteLog);
    router.get("/log/:id", authenticateToken, logController.getLogById);
    router.put("/log/:id", authenticateToken, logController.updateLog);
    router.get("/log/getLogsByMemberId/:id", authenticateToken, logController.getLogsByMemberId);

    // API Stats (thêm vào phần routes)
    router.get("/admin/member-stats", authenticateToken, authorizeAdmin, statsController.getMemberStats);
    router.get("/admin/interaction-stats", authenticateToken, authorizeAdmin, statsController.getInteractionStats);
    router.get("/admin/feedback-stats", authenticateToken, authorizeAdmin, statsController.getFeedbackStats);
    router.get("/admin/export-stats", authenticateToken, authorizeAdmin, statsController.exportStats);
    router.get("/admin/dashboard-stats", authenticateToken, authorizeAdmin, statsController.getDashboardStats);
    router.get("/admin/member-status-stats", authenticateToken, authorizeAdmin, statsController.getMemberStatusStats);

    // API Notifications
    router.get('/notifications', authenticateToken, notificationController.getAll);
    router.post('/notifications', authenticateToken, authorizeAdmin, notificationController.create);
    router.put('/notifications/read', authenticateToken, notificationController.markAsRead);
    router.get('/notifications/unread', authenticateToken, notificationController.getUnread);

    return app.use("/api/", router);
};

module.exports = initAPIRoutes;
