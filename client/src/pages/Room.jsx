import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import VideoPlayer from '../components/VideoPlayer'
import CodeEditor from '../components/CodeEditor'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { MessageCircle, Sparkles } from 'lucide-react'

const Room = () => {
  const { roomId } = useParams()
  const {
    me,
    name,
    setName,
    isConnected,
    joinRoom,
    callStatus,
    usersInRoom
  } = useSocket()

  // Toggle between AI Sidebar and Chat
  const [showChat, setShowChat] = useState(false)

  // Join the room when component mounts
  useEffect(() => {
    if (isConnected && roomId) {
      joinRoom(roomId)
    }
  }, [isConnected, roomId, joinRoom])

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">
            HireFlow<span className="text-purple-400">.ai</span>
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-0.5 bg-gray-800 rounded">
              Room: {roomId}
            </span>
            <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {callStatus === 'connecting' && (
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Connecting call...
              </span>
            )}
            {callStatus === 'connected' && (
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Call active
              </span>
            )}
          </div>
        </div>

        {/* Name Input */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-40"
          />
          <span className="text-xs text-gray-500 hidden md:block">
            ID: {me?.slice(0, 8)}...
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Code Editor + Video */}
        <div className="flex-1 flex flex-col p-4 gap-4" style={{ width: '70%' }}>
          {/* Code Editor - Top Half */}
          <div className="flex-1 min-h-0">
            <CodeEditor roomId={roomId} />
          </div>

          {/* Video Player - Bottom Half */}
          <div className="flex-1 min-h-0">
            <VideoPlayer />
          </div>
        </div>

        {/* Right Panel: Sidebar with Toggle */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          {/* Panel Toggle Buttons */}
          <div className="flex bg-gray-900 border-b border-gray-800">
            <button
              onClick={() => setShowChat(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                !showChat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Questions
            </button>
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                showChat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 min-h-0">
            {showChat ? (
              <Chat roomId={roomId} />
            ) : (
              <Sidebar />
            )}
          </div>
        </div>
      </div>

      {/* Info banner */}
      {callStatus === 'idle' && isConnected && (
        <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm">
          <p className="text-sm text-gray-300">
            {usersInRoom.length > 0 ? (
              <>
                <span className="text-green-400 font-medium">Participant in room!</span>
                {' '}Click "Call Participant" in the video panel to connect.
              </>
            ) : (
              <>
                <span className="text-purple-400 font-medium">Waiting for participant.</span>
                {' '}Share this room link with others to start the interview.
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Room: {window.location.href}
          </p>
        </div>
      )}
    </div>
  )
}

export default Room
