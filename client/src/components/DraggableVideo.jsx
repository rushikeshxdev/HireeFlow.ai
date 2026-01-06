import { useState, useRef, useEffect } from 'react'
import { MicOff, Monitor, Move } from 'lucide-react'

const DraggableVideo = ({
  stream,
  name,
  isMuted,
  isScreenSharing,
  isLocal = false,
  initialPosition = { x: 20, y: 20 },
  label
}) => {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Handle mouse/touch drag
  const handleDragStart = (e) => {
    e.preventDefault()
    setIsDragging(true)

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY

    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    }

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleDragMove)
    document.addEventListener('touchend', handleDragEnd)
  }

  const handleDragMove = (e) => {
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY

    const newX = clientX - dragOffset.current.x
    const newY = clientY - dragOffset.current.y

    // Constrain within viewport
    const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 200)
    const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 150)

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
  }

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 transition-shadow ${
        isDragging ? 'border-blue-500 shadow-blue-500/30 cursor-grabbing' : 'border-slate-600 cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none'
      }}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <Move className="w-3 h-3 text-white/70" />
      </div>

      {/* Video */}
      {stream ? (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isLocal}
          className="w-full h-full object-cover bg-slate-900"
          style={{ transform: isLocal && !isScreenSharing ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 text-lg font-medium">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1 truncate max-w-[70%]">
          {isScreenSharing && <Monitor className="w-2.5 h-2.5 text-blue-400" />}
          {label || name || 'Participant'}
        </span>
        {isMuted && (
          <span className="bg-red-500/90 p-0.5 rounded-full">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
    </div>
  )
}

export default DraggableVideo
