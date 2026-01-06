import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import VideoPlayer from '../components/VideoPlayer'
import CodeEditor from '../components/CodeEditor'
import { Video, User, ArrowRight, Loader2 } from 'lucide-react'

const CandidateJoin = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { joinRoom, isConnected, stream, role } = useSocket()

  const [name, setName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  // Panel state (candidates can use code editor)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)

  // Handle join
  const handleJoin = () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!isConnected) {
      setError('Connecting to server... Please wait')
      return
    }

    setIsJoining(true)
    setError('')

    // Join as candidate
    joinRoom(roomId, name.trim(), 'candidate')

    // Small delay to ensure socket event is processed
    setTimeout(() => {
      setHasJoined(true)
      setIsJoining(false)
    }, 500)
  }

  // Toggle code editor
  const toggleCodeEditor = () => setIsCodeEditorOpen(prev => !prev)

  // Show join form if not joined yet
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">HireeFlow.ai</h1>
            </div>
            <p className="text-slate-400">You're invited to join an interview</p>
          </div>

          {/* Room Info */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
            <p className="text-sm text-slate-400 mb-1">Interview Room</p>
            <p className="text-2xl font-mono font-bold text-white">{roomId}</p>
          </div>

          {/* Connection Status */}
          <div className={`mb-6 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            {isConnected ? 'Connected to server' : 'Connecting...'}
          </div>

          {/* Join Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700">
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Camera Preview */}
            {stream && (
              <div className="mb-6 rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-700">
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={(video) => {
                    if (video && stream) video.srcObject = stream
                  }}
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={!isConnected || !stream || isJoining}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                isConnected && stream && !isJoining
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : !isConnected ? (
                'Connecting...'
              ) : !stream ? (
                'Camera required'
              ) : (
                <>
                  Join Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <p className="mt-6 text-center text-sm text-slate-500">
            By joining, you agree to be recorded for interview purposes.
          </p>
        </div>
      </div>
    )
  }

  // Interview Room for Candidate
  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden flex">
      {/* Full-screen Code Editor Overlay - When code is open */}
      {isCodeEditorOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950 flex flex-col">
          {/* Code Editor - Takes full height minus control bar */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor onClose={toggleCodeEditor} />
          </div>

          {/* Control Bar at Bottom */}
          <div className="h-16 bg-slate-900 border-t border-slate-700">
            <VideoPlayer
              onToggleCode={toggleCodeEditor}
              onToggleAI={() => {}}
              isCodeOpen={isCodeEditorOpen}
              isAIOpen={false}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - When code is closed */}
      {!isCodeEditorOpen && (
        <div className="flex-1 flex flex-col">
          {/* Video Area */}
          <div className="flex-1 relative">
            <VideoPlayer
              onToggleCode={toggleCodeEditor}
              onToggleAI={() => {}} // No AI panel for candidates
              isCodeOpen={isCodeEditorOpen}
              isAIOpen={false}
            />
          </div>
        </div>
      )}

      {/* Room Info Badge */}
      <div className={`fixed top-4 left-4 z-50 ${isCodeEditorOpen ? 'z-[60]' : ''}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-slate-300">
            Room: <span className="font-mono text-white">{roomId}</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
            Candidate
          </span>
        </div>
      </div>
    </div>
  )
}

export default CandidateJoin
