import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBox1 = ({ senderId, senderType, receiverId, receiverType }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const [inputImage, setInputImage] = useState(null);
  const [inputAudio, setInputAudio] = useState(null);
  const [contentType, setContentType] = useState('text');
  const webSocket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const roomUrl = `ws://127.0.0.1:8000/ws/messages/${senderType}/${senderId}/${receiverType}/${receiverId}/`;
    webSocket.current = new WebSocket(roomUrl);

    webSocket.current.onopen = () => {
      console.log('WebSocket connection established');
      // Fetch chat history when connection is established
      webSocket.current.send(JSON.stringify({ action: 'fetch_history' }));
    };

    webSocket.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data); // Debugging
      try {
        const data = JSON.parse(event.data);
        if (data && data.message) {
          console.log('Parsed message:', data.message); // Debugging
          setMessages(prevMessages => [...prevMessages, data.message]);
          scrollToBottom();
        } else if (data && data.history) {
          console.log('Received chat history:', data.history); // Debugging
          setMessages(data.history);
        } else {
          console.error('Invalid message format:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    webSocket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    webSocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, [senderId, senderType, receiverId, receiverType]);


    const handleSendMessage = () => {
        if (!inputText && !inputFile && !inputImage && !inputAudio) {
            return;
        }

        const messageData = {
            content_type: contentType,
            text: contentType === 'text' ? inputText : '',
            file: null,
            image: null,
            audio: null,
            sender_id: senderId,
            sender_content_type: senderType,
            receiver_id: receiverId,
            receiver_content_type: receiverType,
        };

        const sendBase64Data = (base64Data) => {
            messageData[contentType] = base64Data;
            webSocket.current.send(JSON.stringify(messageData));
        };

        if (contentType === 'image' && inputImage) {
            const reader = new FileReader();
            reader.onloadend = () => sendBase64Data(reader.result);
            reader.readAsDataURL(inputImage);
        } else if (contentType === 'file' && inputFile) {
            const reader = new FileReader();
            reader.onloadend = () => sendBase64Data(reader.result);
            reader.readAsDataURL(inputFile);
        } else if (contentType === 'audio' && inputAudio) {
            const reader = new FileReader();
            reader.onloadend = () => sendBase64Data(reader.result);
            reader.readAsDataURL(inputAudio);
        } else {
            webSocket.current.send(JSON.stringify(messageData));
        }

        // Clear input fields after sending
        setInputText('');
        setInputFile(null);
        setInputImage(null);
        setInputAudio(null);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="chat-box">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <p><strong>{msg.sender_content_type} {msg.sender_id}</strong>: {msg.text}</p>
                        {msg.image && <img src={msg.image} alt="sent image" />}
                        {msg.file && <a href={msg.file} download>Download File</a>}
                        {msg.audio && <audio controls src={msg.audio} />}
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="file">File</option>
                    <option value="audio">Audio</option>
                </select>

                {contentType === 'text' && (
                    <input 
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        placeholder="Type your message..."
                    />
                )}

                {contentType === 'image' && (
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setInputImage(e.target.files[0])} 
                    />
                )}

                {contentType === 'file' && (
                    <input 
                        type="file" 
                        onChange={(e) => setInputFile(e.target.files[0])} 
                    />
                )}

                {contentType === 'audio' && (
                    <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => setInputAudio(e.target.files[0])} 
                    />
                )}

                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatBox1;
