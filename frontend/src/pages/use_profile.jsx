import React, { useEffect, useState } from 'react';
import { Card, CardContent, Avatar, Typography, Box, Button, Grid, Container } from '@mui/material';
import { styled } from '@mui/system';
import ModalUpdateProfile from '../components/modal_update_profile';
import ModalUpdatePassword from '../components/modal_update_password';
import { getMemberById } from '../services/memberService';
import NProgress from "nprogress";
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthProvider';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CircleIcon from '@mui/icons-material/Circle';

// Styled Components
const ProfileContainer = styled(Container)({
    paddingTop: '40px',
    paddingBottom: '40px',
});

const UserCard = styled(Card)({
    borderRadius: '15px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    background: '#ffffff',
});

const UserAvatar = styled(Avatar)({
    width: 150,
    height: 150,
    margin: '20px auto',
    border: '5px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const InfoItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    '& .MuiSvgIcon-root': {
        marginRight: '12px',
        color: '#666',
    },
});

const ActionButton = styled(Button)({
    borderRadius: '25px',
    padding: '8px 24px',
    textTransform: 'none',
    fontSize: '16px',
});

const UserProfile = () => {
    const navigate = useNavigate();
    const { logoutAuth } = useAuth();
    const [isShowModalUpdatePassword, setIsShowModalUpdatePassword] = useState(false);
    const [isShowModalUpdateProfile, setIsShowModalUpdateProfile] = useState(false);
    const [id, setId] = useState(null);
    const [memberData, setMemberData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setId(user.id)
        }
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            NProgress.start();
            try {
                const data = await getMemberById(id);
                setMemberData(data);
            } catch (err) {
                console.log(err.message || 'Có lỗi xảy ra khi gọi API');
                toast.error('Không thể tải thông tin người dùng');
            } finally {
                NProgress.done();
            }
        };

        fetchData();
    }, [id, isShowModalUpdateProfile]);

    const handleLogout = async () => {
        try {
            NProgress.start();
            await logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.success("Đã đăng xuất")
            logoutAuth();
            navigate('/login');
        } catch (error) {
            console.log(error);
            toast.error('Đăng xuất thất bại');
        } finally {
            NProgress.done();
        }
    };

    return (
        <>
            <ProfileContainer maxWidth="md">
                <UserCard>
                    <Grid container>
                        <Grid item xs={12} md={4} sx={{
                            borderRight: { md: '1px solid #eee' },
                            borderBottom: { xs: '1px solid #eee', md: 'none' },
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <UserAvatar
                                alt={memberData?.FullName}
                                src={'/avata.jpg'}
                            />
                            <Typography variant="h5" sx={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mt: 2
                            }}>
                                {memberData?.FullName}
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 1
                            }}>
                                <CircleIcon sx={{
                                    fontSize: 12,
                                    color: memberData?.IsActive ? '#4CAF50' : '#f44336',
                                    mr: 1
                                }} />
                                <Typography variant="body2" color="textSecondary">
                                    {memberData?.IsActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <CardContent sx={{ padding: '30px' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                                    Thông tin cá nhân
                                </Typography>

                                <InfoItem>
                                    <EmailIcon />
                                    <Typography>
                                        <strong>Email:</strong> {memberData?.Email || 'Chưa cập nhật'}
                                    </Typography>
                                </InfoItem>

                                <InfoItem>
                                    <PhoneIcon />
                                    <Typography>
                                        <strong>Số điện thoại:</strong> {memberData?.Phone || 'Chưa cập nhật'}
                                    </Typography>
                                </InfoItem>

                                <InfoItem>
                                    <LocationOnIcon />
                                    <Typography>
                                        <strong>Địa chỉ:</strong> {memberData?.Address || 'Chưa cập nhật'}
                                    </Typography>
                                </InfoItem>

                                <InfoItem>
                                    <VpnKeyIcon />
                                    <Typography>
                                        <strong>Mật khẩu:</strong>
                                        <Button
                                            color="primary"
                                            onClick={() => setIsShowModalUpdatePassword(true)}
                                            sx={{ ml: 1, textTransform: 'none' }}
                                        >
                                            Thay đổi mật khẩu
                                        </Button>
                                    </Typography>
                                </InfoItem>

                                <Grid container spacing={2} sx={{ mt: 4 }}>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            fullWidth
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => setIsShowModalUpdateProfile(true)}
                                        >
                                            Chỉnh sửa thông tin
                                        </ActionButton>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <ActionButton
                                            fullWidth
                                            variant="contained"
                                            color="error"
                                            onClick={handleLogout}
                                        >
                                            Đăng xuất
                                        </ActionButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Grid>
                    </Grid>
                </UserCard>
            </ProfileContainer>

            <ModalUpdateProfile
                show={isShowModalUpdateProfile}
                setShow={setIsShowModalUpdateProfile}
                data={memberData}
            />
            <ModalUpdatePassword
                show={isShowModalUpdatePassword}
                setShow={setIsShowModalUpdatePassword}
            />
        </>
    );
};

export default UserProfile;
