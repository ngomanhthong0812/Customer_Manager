import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';
import { getByRole } from '../services/memberService';
import socket from '../services/socket';
import { useAuth } from '../contexts/AuthProvider';
import './chat.css';
import { createInteraction } from '../services/interactionService';

const Chat = () => {
    const { user } = useAuth();
    const [boxs, setBoxs] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const data = await getByRole(user?.role === 123 ? 345 : 123);
                setBoxs(data);
            } catch (error) {
                console.error('Error fetching admins:', error);
            }
        };

        if (user) {
            fetchAdmins();
        }
    }, [user]);

    useEffect(() => {
        if (selectedBox && user) {
            // Join room when admin is selected
            socket.emit('join-room', {
                senderId: user.id,
                receiverId: selectedBox.MemberID
            });

            socket.on('receive-message', (message) => {
                setMessages(prev => [...prev, message]);
            });
        }

        return () => {
            socket.off('receive-message');
        };
    }, [selectedBox, user]);

    const handleSendMessage = async (content) => {
        if (selectedBox) {
            const message = {
                senderId: user.id,
                receiverId: selectedBox.MemberID,
                content,
                timestamp: new Date()
            };

            try {
                // Create interaction
                await createInteraction({
                    MemberID: user?.role === 123 ? user.id : selectedBox.MemberID,
                    CustomerID: user?.role === 123 ? selectedBox.MemberID : user.id,
                    Notes: content,
                    InteractionType: 'Email'
                });

                // Send socket message
                socket.emit('send-message', message);
                setMessages(prev => [...prev, message]);
            } catch (error) {
                console.error('Error creating interaction:', error);
            }
        }
    };

    return (
        <Container fluid className="chat-container">
            <Row className="h-100">
                <Col md={4} className="chat-list-container">
                    <ChatList
                        boxs={boxs}
                        selectedBox={selectedBox}
                        onSelectBox={setSelectedBox}
                    />
                </Col>
                <Col md={8} className="chat-box-container">
                    <ChatBox
                        selectedBox={selectedBox}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default Chat; 