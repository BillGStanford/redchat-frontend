import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import { 
  Send, 
  Users, 
  UserX, 
  Check, 
  X, 
  Shield, 
  LogOut, 
  MessageCircle, 
  Download,
  Settings,
  Hash,
  Crown,
  Circle,
  Plus,
  Copy,
  CheckCircle
} from 'lucide-react';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

function App() {
  // Socket and connection state
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // UI State
  const [currentView, setCurrentView] = useState('home'); // home, waiting, chat
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  
  // Room and user state
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [roomName, setRoomName] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    roomName: '',
    joinRoomId: ''
  });
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setRoomIdCopied(true);
      setTimeout(() => setRoomIdCopied(false), 2000);
    } catch (err) {
      showError('Failed to copy room ID');
    }
  };

  const downloadChatArchive = () => {
    if (!isCreator || messages.length === 0) return;

    const chatData = messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `[${timestamp}] ${msg.username}: ${msg.message}`;
    }).join('\n');

    const header = `RedChat Archive - Room: ${roomName || roomId}\nGenerated: ${new Date().toLocaleString()}\nTotal Messages: ${messages.length}\n${'='.repeat(50)}\n\n`;
    
    const fullContent = header + chatData;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redchat-${roomId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Chat archive downloaded successfully');
  };

  // Socket initialization and cleanup
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('error', (data) => {
      showError(data.message);
    });

    // Room creation/joining events
    newSocket.on('roomCreated', (data) => {
      setRoomId(data.roomId);
      setUserId(data.userId);
      setUsername(data.username);
      setIsCreator(data.isCreator);
      setRoomName(formData.roomName);
      setCurrentView('chat');
      showSuccess('Room created successfully');
    });

    newSocket.on('waitingForApproval', (data) => {
      setRoomId(data.roomId);
      setUserId(data.userId);
      setUsername(data.username);
      setCurrentView('waiting');
    });

    newSocket.on('joinApproved', (data) => {
      setRoomId(data.roomId);
      setUserId(data.userId);
      setUsername(data.username);
      setIsCreator(data.isCreator);
      setCurrentView('chat');
      showSuccess('Welcome to the chat');
    });

    newSocket.on('joinRejected', (data) => {
      showError(data.message);
      setCurrentView('home');
    });

    newSocket.on('kicked', (data) => {
      showError(data.message);
      setCurrentView('home');
      resetState();
    });

    newSocket.on('roomClosed', (data) => {
      showError(data.message);
      setCurrentView('home');
      resetState();
    });

    // Chat events
    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('messageHistory', (history) => {
      setMessages(history);
    });

    newSocket.on('userList', (userList) => {
      setUsers(userList);
    });

    newSocket.on('userJoined', (data) => {
      showSuccess(`${data.username} joined`);
    });

    newSocket.on('userLeft', (data) => {
      showSuccess(`${data.username} left`);
    });

    newSocket.on('joinRequest', (data) => {
      setJoinRequests(prev => [...prev, data]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetState = () => {
    setRoomId('');
    setUserId('');
    setUsername('');
    setIsCreator(false);
    setRoomName('');
    setMessages([]);
    setUsers([]);
    setJoinRequests([]);
    setFormData({ username: '', roomName: '', joinRoomId: '' });
    setShowSettings(false);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.roomName.trim()) {
      showError('Please enter both username and room name');
      return;
    }
    
    if (!socket || !isConnected) {
      showError('Not connected to server');
      return;
    }

    socket.emit('createRoom', {
      username: formData.username.trim(),
      roomName: formData.roomName.trim()
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.joinRoomId.trim()) {
      showError('Please enter both username and room ID');
      return;
    }
    
    if (!socket || !isConnected) {
      showError('Not connected to server');
      return;
    }

    socket.emit('joinRoom', {
      username: formData.username.trim(),
      roomId: formData.joinRoomId.trim()
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('sendMessage', {
      message: newMessage.trim()
    });
    
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  const handleApproveUser = (userId) => {
    if (socket) {
      socket.emit('approveUser', { userId });
      setJoinRequests(prev => prev.filter(req => req.userId !== userId));
    }
  };

  const handleRejectUser = (userId) => {
    if (socket) {
      socket.emit('rejectUser', { userId });
      setJoinRequests(prev => prev.filter(req => req.userId !== userId));
    }
  };

  const handleKickUser = (userId) => {
    if (socket && window.confirm('Remove this user from the room?')) {
      socket.emit('kickUser', { userId });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      const confirmMessage = isCreator 
        ? 'Are you sure? This will permanently delete the room and remove all participants.'
        : 'Are you sure you want to leave this room?';
      
      if (window.confirm(confirmMessage)) {
        socket.emit('leaveRoom');
        setCurrentView('home');
        resetState();
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === new Date(today - 86400000).toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Home View - Professional Landing
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">RedChat</h1>
                <p className="text-gray-600 text-lg">Enterprise Secure Communication</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">Zero Persistence • End-to-End Ready</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
              <div className="flex items-center">
                <X className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="max-w-md mx-auto mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                {success}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Room */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center text-white">
                  <Plus className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-semibold">Create New Room</h2>
                </div>
                <p className="text-blue-100 text-sm mt-2">Start a secure conversation with full control</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                    <input
                      type="text"
                      placeholder="Meeting title or topic"
                      value={formData.roomName}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      maxLength={30}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:transform-none"
                  >
                    Create Room
                  </button>
                </form>
              </div>
            </div>

            {/* Join Room */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6">
                <div className="flex items-center text-white">
                  <Hash className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-semibold">Join Existing Room</h2>
                </div>
                <p className="text-gray-300 text-sm mt-2">Enter a room ID to request access</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room ID</label>
                    <input
                      type="text"
                      placeholder="Enter room identifier"
                      value={formData.joinRoomId}
                      onChange={(e) => setFormData(prev => ({ ...prev, joinRoomId: e.target.value.toLowerCase() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:transform-none"
                  >
                    Request Access
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Zero Persistence</h3>
                <p className="text-gray-600 text-sm">Messages are never stored. When you leave, everything disappears forever.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Controlled Access</h3>
                <p className="text-gray-600 text-sm">Room creators approve or reject all join requests with full user management.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Archive Ready</h3>
                <p className="text-gray-600 text-sm">Room owners can download complete chat transcripts for compliance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for Approval View
  if (currentView === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Circle className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Awaiting Approval</h2>
            <p className="text-gray-600 mb-6">The room administrator is reviewing your access request.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-500 mb-1">Room ID</div>
              <div className="font-mono text-gray-900 font-medium">{roomId}</div>
            </div>
            
            <button
              onClick={() => {
                setCurrentView('home');
                resetState();
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat View - Professional Interface
  if (currentView === 'chat') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{roomName || 'Chat Room'}</h1>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-mono">{roomId}</span>
                    <button onClick={copyRoomId} className="ml-2 p-1 hover:bg-gray-100 rounded">
                      {roomIdCopied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                  <Users className="w-4 h-4 mr-2" />
                  {users.length} participant{users.length !== 1 ? 's' : ''}
                </div>
                
                {isCreator && messages.length > 0 && (
                  <button
                    onClick={downloadChatArchive}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Archive
                  </button>
                )}
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleLeaveRoom}
                  className={`flex items-center text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                    isCreator 
                      ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {isCreator ? 'End Room' : 'Leave'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-center max-w-sm">Start the conversation! Messages in this room are ephemeral and will be permanently deleted when the room closes.</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg, index) => {
                    const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp);
                    const isOwn = msg.userId === userId;
                    
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                            {!isOwn && (
                              <div className="flex items-center mb-1">
                                <span className="text-sm font-medium text-gray-900">{msg.username}</span>
                                <span className="text-xs text-gray-500 ml-2">{formatTime(msg.timestamp)}</span>
                              </div>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              {isOwn && (
                                <div className="text-right mt-1">
                                  <span className="text-xs text-blue-200">{formatTime(msg.timestamp)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all max-h-32"
                      rows={1}
                      maxLength={500}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-2xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          {showSettings && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              {/* Join Requests */}
              {isCreator && joinRequests.length > 0 && (
                <div className="border-b border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Circle className="w-4 h-4 text-yellow-500 mr-2" />
                    Pending Requests ({joinRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {joinRequests.map((request) => (
                      <div key={request.userId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="font-medium text-gray-900 text-sm">{request.username}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveUser(request.userId)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRejectUser(request.userId)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="flex-1 p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 text-gray-600 mr-2" />
                  Participants ({users.length})
                </h3>
                <div className="space-y-2">
                  {users.map((user, index) => {
                    const userKey = user.userId || `user-${index}`;
                    const isCurrentUser = user.username === username;
                    const isRoomCreator = isCreator && !isCurrentUser;
                    
                    return (
                      <div key={userKey} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900 text-sm">{user.username}</span>
                              {isCurrentUser && (
                                <span className="text-xs text-gray-500 ml-2">(You)</span>
                              )}
                              {user.username === users.find(u => isCreator && u.username === username)?.username && (
                                <Crown className="w-3 h-3 text-yellow-500 ml-1" />
                              )}
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-500">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        {isRoomCreator && (
                          <button
                            onClick={() => handleKickUser(userKey)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove participant"
                          >
                            <UserX className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Information */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Room Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room ID</span>
                    <div className="flex items-center">
                      <span className="font-mono text-gray-900 mr-2">{roomId}</span>
                      <button onClick={copyRoomId} className="p-1 hover:bg-gray-100 rounded">
                        {roomIdCopied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Role</span>
                    <span className="text-gray-900 font-medium">
                      {isCreator ? 'Administrator' : 'Participant'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages</span>
                    <span className="text-gray-900 font-medium">{messages.length}</span>
                  </div>
                </div>
                
                {isCreator && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <Crown className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">Administrator Privileges</p>
                        <p>You can approve/reject requests, remove participants, and download chat archives. The room will be permanently deleted when you leave.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                    <div className="text-xs text-red-800">
                      <p className="font-medium mb-1">Zero Persistence</p>
                      <p>Messages are stored in memory only and permanently deleted when the room closes. No data is saved to any database.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notifications */}
        {error && (
          <div className="fixed top-4 right-4 bg-white border border-red-200 shadow-lg rounded-xl p-4 z-50 max-w-sm">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <X className="w-3 h-3 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Error</p>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="fixed top-4 right-4 bg-white border border-green-200 shadow-lg rounded-xl p-4 z-50 max-w-sm">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Success</p>
                <p className="text-sm text-gray-600 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;