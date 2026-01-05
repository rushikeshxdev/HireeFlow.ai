import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import Sidebar from '../components/Sidebar'
import CodeEditor from '../components/CodeEditor'
import { X, ChevronDown, ArrowLeft } from 'lucide-react'

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
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isAIPanelOpen && isInterviewer ? 'mr-96' : ''
      }`}>
        {/* Video Area (takes remaining space) */}
        <div className={`flex-1 relative transition-all duration-300 ${
          isCodeEditorOpen ? 'pb-80' : ''
        }`}>
          <VideoPlayer
            onToggleCode={toggleCodeEditor}
            onToggleAI={toggleAIPanel}
            isCodeOpen={isCodeEditorOpen}
            isAIOpen={isAIPanelOpen}
          />
        </div>

        {/* Code Editor Drawer (slides up from bottom) */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 transition-all duration-300 ease-in-out ${
            isCodeEditorOpen ? 'h-80' : 'h-0'
          } ${isAIPanelOpen && isInterviewer ? 'right-96' : ''}`}
        >
          {isCodeEditorOpen && (
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Code Editor</span>
                  <span className="text-xs text-slate-500">Collaborative</span>
                </div>
                <button
                  onClick={toggleCodeEditor}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              {/* Editor Content */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor />
              </div>
            </div>
          )}
        </div>
      </div>

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
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
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
