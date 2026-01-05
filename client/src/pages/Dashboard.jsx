import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Video, Plus, Copy, Check, LogOut, Clock, Users, Calendar,
  ExternalLink, Trash2, X, Mail, Send, Link as LinkIcon
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut, addInterview } = useAuth()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newRoomId, setNewRoomId] = useState('')
  const [roomTitle, setRoomTitle] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Generate random room ID
  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let id = ''
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
  }

  // Create new room
  const handleCreateRoom = () => {
    const roomId = generateRoomId()
    setNewRoomId(roomId)
    setRoomTitle('')
    setShowCreateModal(true)
  }

  // Start interview (join room as interviewer)
  const handleStartInterview = () => {
    // Save interview to history
    addInterview({
      id: newRoomId,
      title: roomTitle || `Interview ${newRoomId}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    })

    // Navigate to interview room
    navigate(`/interview/${newRoomId}`)
  }

  // Copy link to clipboard
  const copyLink = () => {
    const link = `${window.location.origin}/join/${newRoomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Send email invite (simulated)
  const sendEmailInvite = () => {
    if (!candidateEmail) return
    // In real app, this would send an email via backend
    setEmailSent(true)
    setTimeout(() => {
      setEmailSent(false)
      setCandidateEmail('')
      setShowInviteModal(false)
    }, 2000)
  }

  // Handle sign out
  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  // Get interview link
  const getInterviewLink = (roomId) => `${window.location.origin}/join/${roomId}`

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HireeFlow.ai</h1>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.company || user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-slate-400">
            Create and manage your technical interviews
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleCreateRoom}
            className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-left hover:from-blue-500 hover:to-purple-500 transition group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">New Interview</h3>
            <p className="text-sm text-blue-200">Create a new interview room</p>
          </button>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {user?.interviews?.length || 0}
            </h3>
            <p className="text-sm text-slate-400">Total Interviews</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {user?.interviews?.filter(i => i.status === 'active').length || 0}
            </h3>
            <p className="text-sm text-slate-400">Active Sessions</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h3>
            <p className="text-sm text-slate-400">Today's Date</p>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Interviews</h3>
          </div>

          {user?.interviews?.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {user.interviews.slice().reverse().map((interview, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{interview.title}</h4>
                      <p className="text-sm text-slate-500">
                        Room: {interview.id} • {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getInterviewLink(interview.id))
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/interview/${interview.id}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                    >
                      Join
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No interviews yet</h4>
              <p className="text-slate-400 mb-6">Create your first interview to get started</p>
              <button
                onClick={handleCreateRoom}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Interview
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create Interview Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Room ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Room ID
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-lg">
                    {newRoomId}
                  </div>
                  <button
                    onClick={() => setNewRoomId(generateRoomId())}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Title (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Interview Title <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer Interview"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Candidate Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 text-sm truncate">
                    {`${window.location.origin}/join/${newRoomId}`}
                  </div>
                  <button
                    onClick={copyLink}
                    className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Send Invite Button */}
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowInviteModal(true)
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium transition flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Send Email Invite
              </button>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartInterview}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                Start Interview
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Send Email Invite</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Candidate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="candidate@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl">
                <p className="text-sm text-slate-400">
                  An email will be sent to the candidate with the interview link and instructions.
                </p>
              </div>

              <button
                onClick={sendEmailInvite}
                disabled={!candidateEmail || emailSent}
                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  emailSent
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-700 disabled:text-slate-500'
                }`}
              >
                {emailSent ? (
                  <>
                    <Check className="w-5 h-5" />
                    Invite Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
