import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

const InteractionFilter = ({ dateRange, setDateRange, filterType, setFilterType, handleResetFilter }) => {
    return (
        <Row className="mb-3">
            <Col md={2}>
                <Form.Group>
                    <Form.Label>Từ ngày</Form.Label>
                    <Form.Control
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({
                            ...dateRange,
                            startDate: e.target.value
                        })}
                        max={dateRange.endDate}
                    />
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                    <Form.Label>Đến ngày</Form.Label>
                    <Form.Control
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({
                            ...dateRange,
                            endDate: e.target.value
                        })}
                        min={dateRange.startDate}
                    />
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                    <Form.Label>Loại tương tác</Form.Label>
                    <Form.Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="Call">Cuộc gọi</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Cuộc họp</option>
                        <option value="Others">Khác</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleResetFilter}
                        disabled={!dateRange.startDate && !dateRange.endDate && !filterType}
                    >
                        Đặt lại
                    </button>
                </div>
            </Col>
        </Row>
    );
};

export default InteractionFilter;