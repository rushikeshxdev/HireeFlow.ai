import { useState, useRef, useEffect, useCallback } from 'react'
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

  // Use refs for values needed during drag to avoid stale closures
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Handle drag move - using useCallback with refs to avoid closure issues
  const handleDragMove = useCallback((e) => {
    if (!dragState.current.isDragging) return

    e.preventDefault()

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY

    const newX = clientX - dragState.current.offsetX
    const newY = clientY - dragState.current.offsetY

    // Constrain within viewport
    const containerWidth = containerRef.current?.offsetWidth || 200
    const containerHeight = containerRef.current?.offsetHeight || 150
    const maxX = window.innerWidth - containerWidth
    const maxY = window.innerHeight - containerHeight

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    dragState.current.isDragging = false
    setIsDragging(false)

    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove, { passive: false })
    document.removeEventListener('touchend', handleDragEnd)
  }, [handleDragMove])

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY

    const rect = containerRef.current?.getBoundingClientRect()

    dragState.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - (rect?.left || 0),
      offsetY: clientY - (rect?.top || 0)
    }

    setIsDragging(true)

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)
  }, [handleDragMove, handleDragEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [handleDragMove, handleDragEnd])

  return (
    <div
      ref={containerRef}
      className={`fixed z-[100] w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 transition-shadow select-none ${
        isDragging ? 'border-blue-500 shadow-blue-500/30' : 'border-slate-600 hover:border-slate-500'
      }`}
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Drag Handle Indicator */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/70 to-transparent z-10 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1">
          <Move className="w-3 h-3 text-white/80" />
          <span className="text-[9px] text-white/60 font-medium">DRAG</span>
        </div>
      </div>

      {/* Video */}
      {stream ? (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isLocal}
          className="w-full h-full object-cover bg-slate-900 pointer-events-none"
          style={{ transform: isLocal && !isScreenSharing ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 text-lg font-medium">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between pointer-events-none">
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
