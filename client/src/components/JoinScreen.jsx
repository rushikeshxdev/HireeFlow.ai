import { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { Video, Users, Shield, User } from 'lucide-react'

const JoinScreen = ({ onJoin }) => {
  const { me, isConnected, stream } = useSocket()
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [role, setRole] = useState('candidate')
  const [errors, setErrors] = useState({})

  // Generate a random room ID
  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(id)
  }

  // Validate inputs
  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!roomId.trim()) newErrors.roomId = 'Room ID is required'
    if (roomId.trim().length < 4) newErrors.roomId = 'Room ID must be at least 4 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle join
  const handleJoin = (e) => {
    e.preventDefault()
    if (validate()) {
      onJoin({
        name: name.trim(),
        roomId: roomId.trim().toUpperCase(),
        role
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Video className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">HireeFlow.ai</h1>
          </div>
          <p className="text-slate-400">AI-Powered Technical Interviews</p>
        </div>

        {/* Connection Status */}
        <div className={`mb-6 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700">
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 bg-slate-900/50 border ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              autoFocus
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Room ID Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter or generate ID"
                className={`flex-1 px-4 py-3 bg-slate-900/50 border ${
                  errors.roomId ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase`}
              />
              <button
                type="button"
                onClick={generateRoomId}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                title="Generate random ID"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
            {errors.roomId && <p className="mt-1 text-sm text-red-500">{errors.roomId}</p>}
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Interviewer */}
              <button
                type="button"
                onClick={() => setRole('interviewer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'interviewer'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Interviewer</div>
                <div className="text-xs mt-1 opacity-70">Full access to AI panel</div>
              </button>

              {/* Candidate */}
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'candidate'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Candidate</div>
                <div className="text-xs mt-1 opacity-70">Video & code only</div>
              </button>
            </div>
          </div>

          {/* Camera Preview */}
          {stream && (
            <div className="mb-6 rounded-lg overflow-hidden bg-slate-900 aspect-video">
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

          {/* Join Button */}
          <button
            type="submit"
            disabled={!isConnected || !stream}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              isConnected && stream
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!isConnected ? 'Connecting...' : !stream ? 'Camera required' : 'Join Interview'}
          </button>

          {/* Socket ID */}
          {me && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Your ID: <span className="font-mono text-slate-400">{me}</span>
            </p>
          )}
        </form>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Share the Room ID with your interview partner</p>
        </div>
      </div>
    </div>
  )
}

export default JoinScreen
