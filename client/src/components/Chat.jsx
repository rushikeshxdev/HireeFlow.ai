import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { Send, MessageCircle } from 'lucide-react'

const Chat = ({ roomId }) => {
  const { socket, name } = useSocket()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  const sendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && socket) {
      socket.emit('send-message', {
        roomId,
        sender: name || 'Anonymous',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      setMessage('')
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleMessage = (data) => {
      // Add timestamp if missing from backend
      if (!data.timestamp) {
        data.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, data])
    }

    socket.on('receive-message', handleMessage)
    socket.on('chat-history', (history) => setMessages(history))

    return () => {
      socket.off('receive-message', handleMessage)
      socket.off('chat-history')
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const username = name || 'Anonymous'

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white text-sm">
          Chat
        </h3>
        <span className="ml-auto text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet.</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.sender === username
          return (
            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-2.5 rounded-xl relative ${
                isMe
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-gray-700 text-gray-100 rounded-bl-sm'
              }`}>
                {!isMe && <p className="text-xs font-semibold text-purple-300 mb-0.5">{msg.sender}</p>}
                <p className="text-sm leading-relaxed pr-8">{msg.text}</p>
                <span className={`text-[10px] absolute bottom-1 right-2 opacity-60 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                  {msg.timestamp || ''}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-gray-700 text-white rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1.5 bg-purple-600 p-2 rounded-full hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
