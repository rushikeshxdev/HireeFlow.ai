import { createContext, useState, useRef, useEffect, useContext, useCallback } from 'react'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'

const SocketContext = createContext()

// Server URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5004'

// STUN/TURN Server Configuration for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
}

// Ringtone - we'll use browser's built-in notification sound or skip if not available
const RINGTONE_URL = null // Disabled - was causing network errors

export const SocketProvider = ({ children }) => {
  // Connection state
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [me, setMe] = useState('')
  const [roomId, setRoomId] = useState('')

  // Media state
  const [stream, setStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('candidate') // 'interviewer' or 'candidate'

  // Call state
  const [callStatus, setCallStatus] = useState('idle') // idle, ringing, connecting, connected
  const [remoteUser, setRemoteUser] = useState('')

  // Incoming call state (StreamConnect feature)
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState('')
  const [callerName, setCallerName] = useState('')
  const [callerSignal, setCallerSignal] = useState(null)

  // Screen sharing state (StreamConnect feature)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  // Users in room for manual calling
  const [usersInRoom, setUsersInRoom] = useState([])

  // Shared code editor state (syncs between all users in room)
  const [sharedCode, setSharedCodeState] = useState('')
  const [sharedLanguage, setSharedLanguageState] = useState('javascript')
  const sharedCodeRef = useRef('')

  // Refs for video elements
  const myVideo = useRef(null)
  const userVideo = useRef(null)

  // Refs for peer connections (support multiple peers in future)
  const peersRef = useRef({})
  const streamRef = useRef(null)

  // Screen sharing track ref
  const screenTrackRef = useRef(null)

  // Ringtone audio ref
  const ringtoneRef = useRef(null)

  // Refs for values needed in callbacks (to avoid stale closures)
  const meRef = useRef('')
  const nameRef = useRef('')
  const socketRef = useRef(null)
  const callerRef = useRef('')
  const callerSignalRef = useRef(null)

  // Keep nameRef in sync with name state
  useEffect(() => {
    nameRef.current = name
  }, [name])

  // Initialize ringtone audio (disabled due to CORS issues)
  // useEffect(() => {
  //   if (RINGTONE_URL) {
  //     ringtoneRef.current = new Audio(RINGTONE_URL)
  //     ringtoneRef.current.loop = true
  //   }
  //   return () => {
  //     if (ringtoneRef.current) {
  //       ringtoneRef.current.pause()
  //       ringtoneRef.current = null
  //     }
  //   }
  // }, [])

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id)
      setMe(newSocket.id)
      meRef.current = newSocket.id
      setIsConnected(true)
    })

    socketRef.current = newSocket

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Get user media (camera/mic)
  useEffect(() => {
    const initMedia = async () => {
      try {
        console.log('🎥 Requesting camera/microphone...')
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        console.log('✅ Media stream obtained')
        setStream(mediaStream)
        streamRef.current = mediaStream
      } catch (err) {
        console.error('❌ Media access denied:', err.message)
      }
    }
    initMedia()

    return () => {
      // Cleanup media on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Create a peer connection
  const createPeer = useCallback((targetId, isInitiator) => {
    console.log(`🔗 Creating peer (initiator: ${isInitiator}) for: ${targetId}`)

    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: streamRef.current
    })

    peer.on('signal', (signal) => {
      console.log(`📡 Signal generated for ${targetId}, sending...`)
      if (isInitiator) {
        socket.emit('call-user', {
          userToCall: targetId,
          signalData: signal,
          from: me
        })
      } else {
        socket.emit('answer-call', {
          signal: signal,
          to: targetId
        })
      }
    })

    peer.on('stream', (remoteMediaStream) => {
      console.log('🎬 Remote stream received!')
      setRemoteStream(remoteMediaStream)
      setCallStatus('connected')
    })

    peer.on('connect', () => {
      console.log('✅ Peer connection established!')
      setCallStatus('connected')
    })

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err.message)
    })

    peer.on('close', () => {
      console.log('📴 Peer connection closed')
      setRemoteStream(null)
      setCallStatus('idle')
    })

    return peer
  }, [socket, me])

  // Join a room with role - server validates interviewer uniqueness
  // Pass name and role directly since React state updates are async
  const joinRoom = useCallback((newRoomId, userName, userRole) => {
    if (!socket || !newRoomId) return

    const finalName = userName || name || 'Anonymous'
    const finalRole = userRole || role || 'candidate'

    console.log(`🚪 Joining room: ${newRoomId} as ${finalRole} (${finalName})`)
    setRoomId(newRoomId)
    setName(finalName)
    setRole(finalRole)

    socket.emit('join-room', {
      roomId: newRoomId,
      role: finalRole,
      name: finalName
    })
  }, [socket, role, name])

  // Handle socket events for auto-connect
  useEffect(() => {
    if (!socket) return

    // When we join, server confirms our role (may be reassigned if interviewer already exists)
    socket.on('room-joined', ({ assignedRole, existingUsers, isInterviewerTaken }) => {
      console.log('🚪 Room joined - assigned role:', assignedRole)
      // No alert needed - role assignment is handled automatically
      setRole(assignedRole)
    })

    // When we join, server sends list of existing users
    socket.on('room-users', (existingUsers) => {
      console.log('👥 Existing users in room:', existingUsers)
      // Store users for manual calling
      setUsersInRoom(existingUsers.filter(id => id !== me))
    })

    // When a new user joins our room
    socket.on('user-joined', (userId) => {
      console.log(`👤 New user joined: ${userId}`)
      // Add to users list for manual calling
      setUsersInRoom(prev => [...prev.filter(id => id !== userId), userId])
    })

    // When we receive an incoming call (StreamConnect style - manual answer)
    socket.on('call-incoming', ({ signal, from, name }) => {
      console.log(`📞 Incoming call from: ${from} (${name || 'Unknown'})`)
      setReceivingCall(true)
      setCaller(from)
      setCallerName(name || 'Unknown')
      setCallerSignal(signal)
      setCallStatus('ringing')
      // Update refs for answerCall
      callerRef.current = from
      callerSignalRef.current = signal
    })

    // When our call is accepted
    socket.on('call-accepted', (signal) => {
      console.log('✅ Call accepted, processing answer...')
      const peer = peersRef.current[remoteUser]
      if (peer) {
        peer.signal(signal)
      }
    })

    // When a user leaves
    socket.on('user-left', (userId) => {
      console.log(`👋 User left: ${userId}`)
      // Remove from users list
      setUsersInRoom(prev => prev.filter(id => id !== userId))

      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy()
        delete peersRef.current[userId]
      }
      if (remoteUser === userId) {
        setRemoteStream(null)
        setCallStatus('idle')
        setRemoteUser('')
      }
      // Reset incoming call state if caller left
      if (caller === userId) {
        setReceivingCall(false)
        setCaller('')
        setCallerName('')
        setCallerSignal(null)
      }
    })

    return () => {
      socket.off('room-joined')
      socket.off('room-users')
      socket.off('user-joined')
      socket.off('call-incoming')
      socket.off('call-accepted')
      socket.off('user-left')
    }
  }, [socket, me, createPeer, remoteUser, caller])

  // Leave call / disconnect
  const leaveCall = useCallback(() => {
    console.log('📴 Leaving call...')

    // Destroy all peer connections
    Object.values(peersRef.current).forEach(peer => peer.destroy())
    peersRef.current = {}

    setRemoteStream(null)
    setCallStatus('idle')
    setRemoteUser('')

    // Reload to reset everything
    window.location.reload()
  }, [])

  // Toggle microphone
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return !audioTrack.enabled // return isMuted state
      }
    }
    return false
  }, [])

  // Toggle camera
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return !videoTrack.enabled // return isVideoOff state
      }
    }
    return false
  }, [])

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop()
    }

    const videoTrack = streamRef.current?.getVideoTracks()[0]

    // Replace screen track with camera track in peer connection
    Object.values(peersRef.current).forEach(peer => {
      if (peer && screenTrackRef.current && videoTrack) {
        try {
          peer.replaceTrack(screenTrackRef.current, videoTrack, streamRef.current)
        } catch (err) {
          console.error('Error replacing track:', err)
        }
      }
    })

    // Update local video back to camera
    if (myVideo.current && streamRef.current) {
      myVideo.current.srcObject = streamRef.current
    }

    screenTrackRef.current = null
    setIsScreenSharing(false)
  }, [])

  // Toggle screen sharing (StreamConnect feature)
  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true })
        const screenTrack = screenStream.getTracks()[0]
        screenTrackRef.current = screenTrack

        // Listen for when user stops sharing via browser UI
        screenTrack.onended = () => stopScreenShare()

        // Replace video track with screen track in peer connection
        const videoTrack = streamRef.current?.getVideoTracks()[0]
        Object.values(peersRef.current).forEach(peer => {
          if (peer && videoTrack) {
            try {
              peer.replaceTrack(videoTrack, screenTrack, streamRef.current)
            } catch (err) {
              console.error('Error replacing track:', err)
            }
          }
        })

        // Update local video to show screen share
        if (myVideo.current) {
          myVideo.current.srcObject = screenStream
        }

        setIsScreenSharing(true)
      } catch (err) {
        console.log("Screen share cancelled or failed:", err)
      }
    } else {
      stopScreenShare()
    }
  }, [isScreenSharing, stopScreenShare])

  // Manual call user (StreamConnect feature)
  const callUser = useCallback((userId) => {
    const currentSocket = socketRef.current
    const currentMe = meRef.current
    const currentName = nameRef.current
    const currentStream = streamRef.current

    console.log('📞 callUser called with:', { userId, currentMe, hasSocket: !!currentSocket, hasStream: !!currentStream })
    console.log('📞 Socket connected:', currentSocket?.connected)
    console.log('📞 Stream tracks:', currentStream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })))

    if (!currentSocket) {
      console.error('❌ Cannot call: No socket connection')
      alert('No socket connection!')
      return
    }
    if (!currentStream) {
      console.error('❌ Cannot call: No media stream')
      alert('No media stream!')
      return
    }
    if (!userId) {
      console.error('❌ Cannot call: No userId provided')
      alert('No userId provided!')
      return
    }

    console.log(`📞 Initiating call to: ${userId}`)
    setCallStatus('connecting')
    setRemoteUser(userId)

    try {
      console.log('📞 Creating Peer...')
      // Note: Removed ICE_SERVERS config - simple-peer uses default STUN servers
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream
      })
      console.log('📞 Peer created successfully')

      peer.on('signal', (signal) => {
        console.log('📡 Signal generated, emitting call-user to server')
        console.log('📡 Signal type:', signal.type)
        currentSocket.emit('call-user', {
          userToCall: userId,
          signalData: signal,
          from: currentMe,
          name: currentName || 'Anonymous'
        })
        console.log('📡 call-user emitted!')
      })

      peer.on('stream', (remoteMediaStream) => {
        console.log('🎬 Remote stream received!')
        setRemoteStream(remoteMediaStream)
        setCallStatus('connected')
      })

      peer.on('connect', () => {
        console.log('✅ Peer connection established!')
        setCallStatus('connected')
      })

      peer.on('close', () => {
        console.log('📴 Peer connection closed')
        setRemoteStream(null)
        setCallStatus('idle')
      })

      peersRef.current[userId] = peer
    } catch (err) {
      console.error('❌ Error creating peer:', err)
      alert('Error creating peer: ' + err.message)
      setCallStatus('idle')
    }
  }, [])

  // Answer incoming call (StreamConnect feature)
  const answerCall = useCallback(() => {
    const currentSocket = socketRef.current
    const currentStream = streamRef.current
    const currentCaller = callerRef.current
    const currentSignal = callerSignalRef.current

    console.log('✅ answerCall called with:', { currentCaller, hasSocket: !!currentSocket, hasStream: !!currentStream, hasSignal: !!currentSignal })

    if (!currentSocket) {
      console.error('❌ Cannot answer: No socket connection')
      return
    }
    if (!currentStream) {
      console.error('❌ Cannot answer: No media stream')
      return
    }
    if (!currentCaller || !currentSignal) {
      console.error('❌ Cannot answer: No caller or signal')
      return
    }

    console.log(`✅ Answering call from: ${currentCaller}`)
    setCallStatus('connecting')
    setReceivingCall(false)

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream
    })

    peer.on('signal', (signal) => {
      console.log('📡 Answer signal generated, sending to caller')
      currentSocket.emit('answer-call', {
        signal: signal,
        to: currentCaller
      })
    })

    peer.on('stream', (remoteMediaStream) => {
      console.log('🎬 Remote stream received!')
      setRemoteStream(remoteMediaStream)
      setCallStatus('connected')
    })

    peer.on('connect', () => {
      console.log('✅ Peer connection established!')
      setCallStatus('connected')
    })

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err.message)
      setCallStatus('idle')
    })

    peer.on('close', () => {
      console.log('📴 Peer connection closed')
      setRemoteStream(null)
      setCallStatus('idle')
    })

    // Signal the peer with caller's offer
    peer.signal(currentSignal)
    peersRef.current[currentCaller] = peer
    setRemoteUser(currentCaller)
  }, [])

  // Decline incoming call
  const declineCall = useCallback(() => {
    setReceivingCall(false)
    setCaller('')
    setCallerName('')
    setCallerSignal(null)
  }, [])

  // Update shared code and emit to socket
  const updateSharedCode = useCallback((code, language, isRemote = false) => {
    setSharedCodeState(code)
    sharedCodeRef.current = code
    if (language) {
      setSharedLanguageState(language)
    }

    // Only emit if this is a local change
    if (!isRemote && socketRef.current && roomId) {
      socketRef.current.emit('code-change', {
        roomId,
        code,
        language: language || sharedLanguage
      })
    }
  }, [roomId, sharedLanguage])

  // Update shared language and emit to socket
  const updateSharedLanguage = useCallback((language, isRemote = false) => {
    setSharedLanguageState(language)

    if (!isRemote && socketRef.current && roomId) {
      socketRef.current.emit('language-change', {
        roomId,
        language
      })
    }
  }, [roomId])

  // Listen for code sync events at context level
  useEffect(() => {
    if (!socket) return

    const handleCodeUpdate = (data) => {
      console.log('📥 [Context] Received code-update from remote')
      if (typeof data === 'string') {
        setSharedCodeState(data)
        sharedCodeRef.current = data
      } else {
        setSharedCodeState(data.code || '')
        sharedCodeRef.current = data.code || ''
        if (data.language) {
          setSharedLanguageState(data.language)
        }
      }
    }

    const handleLanguageUpdate = (newLanguage) => {
      console.log('📥 [Context] Received language-update:', newLanguage)
      setSharedLanguageState(newLanguage)
    }

    socket.on('code-update', handleCodeUpdate)
    socket.on('language-update', handleLanguageUpdate)
    console.log('👂 [Context] Listening for code-update and language-update events')

    return () => {
      socket.off('code-update', handleCodeUpdate)
      socket.off('language-update', handleLanguageUpdate)
    }
  }, [socket])

  const value = {
    // Socket
    socket,
    isConnected,
    me,

    // Room
    roomId,
    joinRoom,

    // Media
    stream,
    remoteStream,
    myVideo,
    userVideo,

    // User info
    name,
    setName,
    role,
    setRole,

    // Call state
    callStatus,
    remoteUser,
    leaveCall,

    // Media controls
    toggleMute,
    toggleVideo,

    // Screen sharing (StreamConnect feature)
    isScreenSharing,
    toggleScreenShare,

    // Incoming call (StreamConnect feature)
    receivingCall,
    caller,
    callerName,
    answerCall,
    declineCall,
    callUser,

    // Users in room for manual calling
    usersInRoom,

    // Shared code editor state
    sharedCode,
    sharedLanguage,
    updateSharedCode,
    updateSharedLanguage,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export default SocketContext
