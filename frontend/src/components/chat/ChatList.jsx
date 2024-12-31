import React from 'react';
import { ListGroup } from 'react-bootstrap';
import './ChatList.css';

const ChatList = ({ boxs, selectedBox, onSelectBox }) => {
    return (
        <ListGroup className="chat-list">
            {boxs.map(box => (
                <ListGroup.Item
                    key={box.MemberID}
                    active={selectedBox?.MemberID === box.MemberID}
                    onClick={() => onSelectBox(box)}
                    className="chat-list-item"
                >
                    <div className="d-flex align-items-center">
                        <div className="chat-avatar">
                            {box.FullName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="chat-info">
                            <div className="chat-name">{box.FullName}</div>
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ChatList; 