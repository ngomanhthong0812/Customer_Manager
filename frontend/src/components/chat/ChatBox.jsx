import React, { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { BsSend } from 'react-icons/bs';
import './ChatBox.css';
import { useAuth } from '../../contexts/AuthProvider';
import { getInteractionByMemberIdAndAdminId } from '../../services/interactionService';

const ChatBox = ({ selectedBox, messages, onSendMessage }) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, chatMessages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedBox) {
                try {
                    let data;
                    if (user?.role === 123) {
                        data = await getInteractionByMemberIdAndAdminId(user.id, selectedBox.MemberID);
                    } else {
                        data = await getInteractionByMemberIdAndAdminId(selectedBox.MemberID, user.id);
                    }
                    console.log(data);

                    setChatMessages(data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [selectedBox, user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!selectedBox) {
        return (
            <div className="chat-box-empty">
                <div className="text-center text-muted">
                    <h5>Chọn một người để bắt đầu trò chuyện</h5>
                </div>
            </div>
        );
    }

    const allMessages = [...(chatMessages || []), ...(messages || [])];

    return (
        <div className="chat-box">
            <div className="chat-header">
                <div className="chat-avatar">
                    {selectedBox.FullName?.charAt(0).toUpperCase()}
                </div>
                <div className="chat-info">
                    <div className="chat-name">{selectedBox.FullName}</div>
                </div>
            </div>

            <div className="chat-messages">
                {allMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.senderId === selectedBox.MemberID || msg.SenderID === selectedBox.MemberID ? 'received' : 'sent'}`}
                    >
                        <div className="message-content">
                            {msg.content || msg.Notes}
                        </div>
                        <div className="message-time">
                            {new Date(msg.CreatedAt || msg.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <Form onSubmit={handleSubmit} className="chat-input">
                <Form.Control
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                />
                <Button type="submit" variant="primary">
                    <BsSend />
                </Button>
            </Form>
        </div>
    );
};

export default ChatBox; 