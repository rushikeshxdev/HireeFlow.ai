import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Code, Sparkles, ArrowRight } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')

  // Generate a random room ID
  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setRoomId(id)
  }

  // Join or create room
  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            HireFlow<span className="text-purple-400">.ai</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-Time AI Technical Interview Platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Video Calls</h3>
            <p className="text-sm text-gray-400">
              Peer-to-peer video conferencing with WebRTC
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Coding</h3>
            <p className="text-sm text-gray-400">
              Collaborative code editor synced in real-time
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Co-Pilot</h3>
            <p className="text-sm text-gray-400">
              Generate tailored interview questions from resume
            </p>
          </div>
        </div>

        {/* Join Room Form */}
        <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">
            Start or Join an Interview
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!roomId.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              Join Room
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Share the room ID with your interview partner to join the same room
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
