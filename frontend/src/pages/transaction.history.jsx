import React, { useEffect, useState } from 'react';
import { Container, Table, Row, Col } from 'react-bootstrap';
import { getLogsByMemberId } from '../services/logService';
import { useAuth } from '../contexts/AuthProvider';
import nProgress from 'nprogress';
import PaginationRounded from '../components/PaginationRounded';

const TransactionHistory = () => {
    const { user } = useAuth();
    const [activityLogs, setActivityLogs] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const limit = 10;

    useEffect(() => {
        const fetch = async () => {
            nProgress.start();
            const result = await getLogsByMemberId(user?.id, page, limit);
            setActivityLogs(result.logs);
            setTotalPages(result.totalPages)
            nProgress.done();
        }
        if (user?.id) {
            fetch();
        }
    }, [user?.id, page])

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={10}>
                    <h2 className="text-center mb-4 mt-4">Lịch sử hoạt động của bạn</h2>
                    <Table striped bordered hover responsive>
                        <thead class="table-dark">
                            <tr>
                                <th>Hoạt động</th>
                                <th>Chi tiết hoạt động</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityLogs?.length > 0 ? (
                                activityLogs?.map((log) => (
                                    <tr key={log.LogID}>
                                        <td>{log.ActionType}</td>
                                        <td>{log.ActionDescription}</td>
                                        <td>{new Date(log.CreatedAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No activity found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <div className='d-flex justify-content-center'>
                <PaginationRounded totalPages={totalPages} page={page} setPage={setPage} />
            </div>
        </Container>
    );
}

export default TransactionHistory;
