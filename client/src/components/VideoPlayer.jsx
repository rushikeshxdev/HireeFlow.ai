import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  Phone, PhoneIncoming, X, Code, Bot, Users
} from 'lucide-react'

const VideoPlayer = ({ onToggleCode, onToggleAI, isCodeOpen, isAIOpen }) => {
  const {
    stream,
    remoteStream,
    callStatus,
    leaveCall,
    toggleMute,
    toggleVideo,
    name,
    role,
    isScreenSharing,
    toggleScreenShare,
    receivingCall,
    callerName,
    answerCall,
    declineCall,
    callUser,
    usersInRoom
  } = useSocket()

  // Local state for media controls
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  // Local refs for video elements
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream
    }
  }, [stream])

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Handle mute toggle
  const handleToggleMute = () => {
    const newMutedState = toggleMute()
    setIsMuted(newMutedState)
  }

  // Handle video toggle
  const handleToggleVideo = () => {
    const newVideoOffState = toggleVideo()
    setIsVideoOff(newVideoOffState)
  }

  const isCallActive = callStatus === 'connected'
  const isRinging = callStatus === 'ringing' || receivingCall
  const isInterviewer = role === 'interviewer'

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Incoming Call Overlay */}
      {isRinging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="bg-slate-800/90 p-10 rounded-3xl shadow-2xl border border-slate-600 text-center max-w-md">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/30 animate-pulse">
              <PhoneIncoming className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Incoming Call</h3>
            <p className="text-slate-400 text-lg mb-8">{callerName || 'Participant'} is calling...</p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={answerCall}
                className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-green-500/30"
              >
                <Phone className="w-6 h-6" />
                Accept
              </button>
              <button
                onClick={declineCall}
                className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-red-500/30"
              >
                <X className="w-6 h-6" />
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Area - Changes layout based on code editor state */}
      <div className="absolute inset-0 bottom-20">
        {isCodeOpen ? (
          /* Side-by-side layout when code editor is open */
          <div className="w-full h-full flex gap-2 p-2">
            {/* Remote Video */}
            <div className="flex-1 rounded-xl overflow-hidden bg-slate-900 relative">
              {isCallActive && remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      {usersInRoom.length > 0 ? 'Ready to Connect' : 'Waiting...'}
                    </p>
                    {callStatus === 'idle' && usersInRoom.length > 0 && (
                      <button
                        onClick={() => callUser(usersInRoom[0])}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Call
                      </button>
                    )}
                  </div>
                </div>
              )}
              {/* Remote user label */}
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white">
                  {isInterviewer ? 'Candidate' : 'Interviewer'}
                </span>
              </div>
            </div>

            {/* Local Video */}
            <div className="w-48 rounded-xl overflow-hidden bg-slate-900 relative border-2 border-slate-700">
              {stream ? (
                <video
                  ref={localVideoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-slate-600" />
                </div>
              )}
              {/* Local user label */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
                  {isScreenSharing && <Monitor className="w-3 h-3 text-blue-400" />}
                  {name || 'You'}
                </span>
                {isMuted && (
                  <span className="bg-red-500/90 p-1 rounded-full">
                    <MicOff className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Full screen with PiP when code editor is closed */
          <>
            {/* Main Remote Video */}
            {isCallActive && remoteStream ? (
              <video
                ref={remoteVideoRef}
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-slate-700">
                    <Users className="w-16 h-16 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {callStatus === 'connecting'
                      ? 'Connecting...'
                      : usersInRoom.length > 0
                        ? 'Ready to Connect'
                        : 'Waiting for Participant'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {callStatus === 'connecting'
                      ? 'Establishing peer connection'
                      : usersInRoom.length > 0
                        ? 'Another participant is in the room'
                        : 'Share the room ID to invite someone'}
                  </p>
                  {callStatus === 'idle' && usersInRoom.length > 0 && (
                    <button
                      onClick={() => callUser(usersInRoom[0])}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-600/30"
                    >
                      <Phone className="w-6 h-6" />
                      Start Call
                    </button>
                  )}
                  {callStatus === 'connecting' && (
                    <div className="flex justify-center mt-4">
                      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Local Video PiP */}
            <div className="absolute top-4 right-4 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-slate-600 bg-slate-900">
              {stream ? (
                <video
                  ref={localVideoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white font-medium flex items-center gap-1">
                  {isScreenSharing && <Monitor className="w-3 h-3 text-blue-400" />}
                  {name || 'You'} {isInterviewer && <span className="text-blue-400">(Host)</span>}
                </span>
                {isMuted && (
                  <span className="bg-red-500/90 p-1 rounded-full">
                    <MicOff className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
        <div className="h-full flex items-center justify-between px-6">
          {/* Left: Status */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-slate-400 text-sm">
              {isCallActive ? 'Connected' : callStatus === 'connecting' ? 'Connecting...' : 'Ready'}
            </span>
          </div>

          {/* Center: Media controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMute}
              className={`p-4 rounded-xl transition-all ${
                isMuted ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={handleToggleVideo}
              className={`p-4 rounded-xl transition-all ${
                isVideoOff ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-xl transition-all ${
                isScreenSharing ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </button>

            {isCallActive && (
              <button
                onClick={leaveCall}
                className="p-4 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all"
                title="End call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Right: Panel toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCode}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                isCodeOpen ? 'bg-purple-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
              title="Toggle Code Editor"
            >
              <Code className="w-5 h-5" />
              <span className="text-sm font-medium hidden md:inline">Code</span>
            </button>

            {isInterviewer && (
              <button
                onClick={onToggleAI}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  isAIOpen ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Toggle AI Assistant"
              >
                <Bot className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline">AI</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
