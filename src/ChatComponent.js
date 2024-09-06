import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const ChatComponent = ({ senderId, senderContentTypeId, receiverId, receiverContentTypeId }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);  // Add connected state
    const chatEndRef = useRef(null);

    useEffect(() => {
        const roomName = `${senderContentTypeId}/${senderId}/${receiverContentTypeId}/${receiverId}`;
        const wsUrl = `ws://127.0.0.1:8000/ws/messages/${roomName}/`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            setSocket(ws);
            setConnected(true);  // Set connected state to true
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            } else if (data.error) {
                console.error(`Error: ${data.error}`);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setConnected(false);  // Set connected state to false
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error: ${error}`);
            setConnected(false);  // Set connected state to false
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [senderId, senderContentTypeId, receiverId, receiverContentTypeId]);

    const sendMessage = () => {
        if (connected && socket && messageText.trim()) {  // Check if connected before sending
            const messageData = {
                content_type: 'text',  // Modify as needed for images, files, audio
                text: messageText,
                sender_id: senderId,
                sender_content_type: senderContentTypeId,
                receiver_id: receiverId,
                receiver_content_type: receiverContentTypeId,
            };
            socket.send(JSON.stringify(messageData));
            setMessageText('');
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-history">
                {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <p><strong>{message.sender_content_type} {message.sender_id}:</strong> {message.text}</p>
                        {message.image && <img src={message.image} alt="Sent content" />}
                        {message.file && <a href={message.file} download>Download file</a>}
                        {message.audio && <audio controls src={message.audio}></audio>}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!connected}  // Disable input until connected
                />
                <button onClick={sendMessage} disabled={!connected}>Send</button>
            </div>
        </div>
    );
};

export default ChatComponent;
