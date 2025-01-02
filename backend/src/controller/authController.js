const authService = require('../service/authService');
const logService = require('../service/logService');

// Đăng ký
const registerController = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const user = await authService.register(fullname, email, password);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công.',
            user,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Đăng ký thất bại',
            error: error.message
        });
    }
};

// Đăng nhập
const loginController = (req, res) => {
    const { email, password } = req.body;

    authService.login(email, password)
        .then(({ token, user }) => {
            // Ghi lại log đăng nhập thành công
            const logData = {
                MemberID: user.MemberID,  // Ghi ID thành viên vào log
                ActionType: 'Login',
                ActionDescription: `Đăng nhập thành công với email: ${email}`,
            };
            logService.create(logData);  // Ghi log

            res.status(200).json({
                message: 'Đăng nhập thành công',
                token,
                user: {
                    id: user.MemberID,
                    email: user.Email,
                    role: user.RoleID,
                },
            });
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
            });
        });
};
// Đăng xuất (xóa token trên client)
const logout = (req, res) => {
    res.json({ message: 'Đã đăng xuất' });
};

const refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Không có token được gửi đến' });
    }

    try {
        const newToken = await authService.refreshToken(token);  // Gọi hàm refreshToken từ service
        res.json({ newToken });  // Trả về token mới
    } catch (error) {
        res.status(401).json({ message: error });
    }
};


module.exports = { loginController, registerController, logout, refreshToken };
