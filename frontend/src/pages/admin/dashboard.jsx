import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import { getMemberStats, getInteractionStats, getFeedbackStats, exportStats } from '../../services/adminService';
import NProgress from 'nprogress';
import { toast } from 'react-toastify';

// Đăng ký components cho Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Set default date range to last 30 days
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    });

    // Add date validation
    const handleDateChange = (field, value) => {
        const newRange = { ...dateRange, [field]: value };

        // Validate date range
        if (newRange.startDate && newRange.endDate) {
            if (new Date(newRange.startDate) > new Date(newRange.endDate)) {
                toast.error('Ngày bắt đầu không thể sau ngày kết thúc');
                return;
            }
        }

        setDateRange(newRange);
    };

    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        totalInteractions: 0,
        averageFeedbackRating: 0
    });

    // Tách state cho các biểu đồ
    const [chartData, setChartData] = useState({
        interactionData: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Số lượng tương tác',
                data: Array(12).fill(0),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            }]
        },
        memberStatusData: {
            labels: ['Đang hoạt động', 'Không hoạt động'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#f44336'],
            }]
        },
    });

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            NProgress.start();

            const [memberStats, interactionStats, feedbackStats] = await Promise.all([
                getMemberStats(dateRange.startDate, dateRange.endDate),
                getInteractionStats(dateRange.startDate, dateRange.endDate),
                getFeedbackStats(dateRange.startDate, dateRange.endDate)
            ]);

            console.log('Stats fetched:', {
                memberStats,
                interactionStats,
                feedbackStats
            });

            // Cập nhật thống kê tổng quan
            setStats({
                totalMembers: memberStats.data.totalMembers || 0,
                activeMembers: memberStats.data.activeMembers || 0,
                inactiveMembers: memberStats.data.inactiveMembers || 0,
                totalInteractions: interactionStats.data[0]?.totalInteractions || 0,
                averageFeedbackRating: parseFloat(feedbackStats.data.averageRating) || 0
            });

            // Cập nhật biểu đồ tương tác theo tháng
            const monthlyData = Array(12).fill(0);
            if (interactionStats.data && Array.isArray(interactionStats.data)) {
                interactionStats.data.forEach(stat => {
                    // Xử lý chuỗi tháng dạng "2024-12"
                    const monthStr = stat.month.split('-')[1];
                    const monthIndex = parseInt(monthStr) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyData[monthIndex] = stat.totalInteractions;
                    }
                });
            }

            // Cập nhật biểu đồ trạng thái thành viên
            const memberStatusData = [
                memberStats.data.activeMembers || 0,
                memberStats.data.inactiveMembers || 0
            ];

            setChartData({
                interactionData: {
                    ...chartData.interactionData,
                    datasets: [{
                        ...chartData.interactionData.datasets[0],
                        data: monthlyData
                    }]
                },
                memberStatusData: {
                    ...chartData.memberStatusData,
                    datasets: [{
                        ...chartData.memberStatusData.datasets[0],
                        data: memberStatusData
                    }]
                },
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setIsLoading(false);
            NProgress.done();
        }
    };

    // Add export functionality
    const handleExport = async () => {
        try {
            setIsLoading(true);
            NProgress.start();

            const response = await exportStats(dateRange.startDate, dateRange.endDate);

            // Tạo blob từ response data
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Tạo URL cho blob
            const url = window.URL.createObjectURL(blob);

            // Tạo link tạm thời để download
            const a = document.createElement('a');
            a.href = url;
            a.download = `thong-ke-${dateRange.startDate}-den-${dateRange.endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Lỗi khi xuất báo cáo');
        } finally {
            setIsLoading(false);
            NProgress.done();
        }
    };

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    // Thêm styles cho các component
    const cardStyle = {
        height: '140px', // Giảm chiều cao của card
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const chartCardStyle = {
        height: '400px' // Giảm chiều cao của card chứa biểu đồ
    };

    const buttonStyle = {
        whiteSpace: 'nowrap', // Ngăn chữ xuống dòng
        minWidth: '120px' // Đảm bảo nút đủ rộng
    };

    return (
        <Container fluid className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Thống kê tổng quan</h2>
                <div className="d-flex gap-3">
                    <Form.Control
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        disabled={isLoading}
                        style={{ width: '160px' }}
                    />
                    <Form.Control
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        disabled={isLoading}
                        style={{ width: '160px' }}
                    />
                    <Button
                        variant="success"
                        onClick={handleExport}
                        disabled={isLoading}
                        style={buttonStyle}
                    >
                        {isLoading ? 'Đang tải...' : 'Xuất báo cáo'}
                    </Button>
                </div>
            </div>

            <Row>
                <Col md={3}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={cardStyle}>
                            <Card.Title style={{ fontSize: '1rem', marginBottom: '8px' }}>
                                Tổng số thành viên
                            </Card.Title>
                            <Card.Text className="h2 mb-0">
                                {stats.totalMembers}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={cardStyle}>
                            <Card.Title style={{ fontSize: '1rem', marginBottom: '8px' }}>
                                Tổng số tương tác
                            </Card.Title>
                            <Card.Text className="h2 mb-0">
                                {stats.totalInteractions}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={cardStyle}>
                            <Card.Title style={{ fontSize: '1rem', marginBottom: '8px' }}>
                                Điểm đánh giá trung bình
                            </Card.Title>
                            <Card.Text className="h2 mb-0">
                                {typeof stats.averageFeedbackRating === 'number'
                                    ? `${stats.averageFeedbackRating.toFixed(1)}⭐`
                                    : '0.0⭐'
                                }
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={cardStyle}>
                            <Card.Title style={{ fontSize: '1rem', marginBottom: '8px' }}>
                                Tài khoản đang hoạt động
                            </Card.Title>
                            <Card.Text className="h2 mb-0">
                                {stats.activeMembers}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={chartCardStyle}>
                            <Card.Title style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                                Biểu đồ tương tác theo thời gian
                            </Card.Title>
                            <div style={{ height: 'calc(100% - 40px)' }}>
                                <Line
                                    data={chartData.interactionData}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body style={chartCardStyle}>
                            <Card.Title style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                                Trạng thái thành viên
                            </Card.Title>
                            <div style={{ height: 'calc(100% - 40px)' }}>
                                <Pie
                                    data={chartData.memberStatusData}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;