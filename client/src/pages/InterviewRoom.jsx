import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import Sidebar from '../components/Sidebar'
import CodeEditor from '../components/CodeEditor'
import { X, Minimize2, ArrowLeft, Code } from 'lucide-react'

const InterviewRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { joinRoom, setName, setRole, role, name, isConnected } = useSocket()
  const { user, isAuthenticated } = useAuth()

  // Panel states
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  // AI questions state
  const [questions, setQuestions] = useState([])

  // Join room automatically when connected
  useEffect(() => {
    if (isConnected && roomId && !hasJoined) {
      // If authenticated user (from dashboard), they are the interviewer
      const userName = user?.name || name || 'Interviewer'
      const userRole = 'interviewer'

      joinRoom(roomId, userName, userRole)
      setHasJoined(true)

      // Auto-open AI panel for interviewers
      setIsAIPanelOpen(true)
    }
  }, [isConnected, roomId, hasJoined, user, name, joinRoom])

  // Toggle handlers
  const toggleAIPanel = () => setIsAIPanelOpen(prev => !prev)
  const toggleCodeEditor = () => setIsCodeEditorOpen(prev => !prev)

  // Go back to dashboard
  const handleBack = () => {
    navigate('/dashboard')
  }

  const isInterviewer = role === 'interviewer'

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
              onToggleAI={toggleAIPanel}
              isCodeOpen={isCodeEditorOpen}
              isAIOpen={isAIPanelOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - When code is closed */}
      {!isCodeEditorOpen && (
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isAIPanelOpen && isInterviewer ? 'mr-96' : ''
        }`}>
          {/* Video Area (takes remaining space) */}
          <div className="flex-1 relative">
            <VideoPlayer
              onToggleCode={toggleCodeEditor}
              onToggleAI={toggleAIPanel}
              isCodeOpen={isCodeEditorOpen}
              isAIOpen={isAIPanelOpen}
            />
          </div>
        </div>
      )}

      {/* AI Panel (slides in from right) - Interviewer Only */}
      {isInterviewer && (
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-slate-900 border-l border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out z-40 ${
            isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">AI Interview Assistant</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Interviewer</span>
            </div>
            <button
              onClick={toggleAIPanel}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          {/* Panel Content */}
          <div className="h-[calc(100%-52px)] overflow-hidden">
            <Sidebar questions={questions} setQuestions={setQuestions} />
          </div>
        </div>
      )}

      {/* Room Info Badge */}
      <div className={`fixed top-4 left-4 z-50 flex items-center gap-2 ${isCodeEditorOpen ? 'z-[60]' : ''}`}>
        <button
          onClick={handleBack}
          className="p-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${
            isInterviewer ? 'bg-blue-500' : 'bg-green-500'
          }`} />
          <span className="text-sm text-slate-300">
            Room: <span className="font-mono text-white">{roomId}</span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isInterviewer ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {isInterviewer ? 'Interviewer' : 'Candidate'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom
