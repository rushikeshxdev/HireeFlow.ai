import { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import {
  Sparkles, Loader2, ChevronDown, ChevronUp, Copy, Check,
  Upload, FileText, X, AlertCircle
} from 'lucide-react'
import { useSocket } from '../context/SocketContext'

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5004'

// Difficulty badge colors
const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// Type badge colors
const TYPE_COLORS = {
  conceptual: 'bg-blue-500/20 text-blue-400',
  practical: 'bg-green-500/20 text-green-400',
  'system-design': 'bg-purple-500/20 text-purple-400',
}

const Sidebar = ({ questions, setQuestions }) => {
  const { roomId } = useSocket()

  // Form state
  const [pdfFile, setPdfFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [candidateName, setCandidateName] = useState('')

  // Refs
  const fileInputRef = useRef(null)

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.')
        return
      }
      setPdfFile(file)
      setError('')
    } else {
      setError('Please upload a PDF file')
    }
  }

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [])

  // Remove file
  const removeFile = () => {
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate questions from PDF
  const analyzeResume = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF resume')
      return
    }
    if (!jobRole.trim()) {
      setError('Please enter the job role')
      return
    }

    setLoading(true)
    setError('')
    setQuestions([])
    setCandidateName('')

    try {
      const formData = new FormData()
      formData.append('resume', pdfFile)
      formData.append('jobRole', jobRole.trim())
      if (roomId) {
        formData.append('roomId', roomId)
      }

      const response = await axios.post(`${API_URL}/api/ai/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success && response.data.questions) {
        setQuestions(response.data.questions)
        setCandidateName(response.data.metadata?.candidateName || 'Candidate')
      } else {
        setError('Failed to analyze resume. Please try again.')
      }
    } catch (err) {
      console.error('Error analyzing resume:', err)
      setError(
        err.response?.data?.message ||
        'Failed to connect to AI service. Is the server running?'
      )
    } finally {
      setLoading(false)
    }
  }

  // Copy question to clipboard
  const copyQuestion = async (question, index) => {
    try {
      await navigator.clipboard.writeText(question)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Toggle question expansion
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Upload Section */}
      <div className="p-4 border-b border-slate-700 space-y-4">
        {/* Job Role Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Job Role
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Senior Frontend Developer"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* PDF Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Resume (PDF)
          </label>

          {!pdfFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <Upload className={`w-10 h-10 mx-auto mb-3 ${
                isDragging ? 'text-green-400' : 'text-slate-500'
              }`} />
              <p className="text-sm text-slate-400 mb-1">
                Drag & drop PDF here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Maximum file size: 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-600">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{pdfFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(pdfFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeResume}
          disabled={loading || !pdfFile}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Questions
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Candidate Info */}
        {candidateName && questions.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl mb-4">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-semibold text-sm">
                {candidateName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-white font-medium">{candidateName}</p>
              <p className="text-xs text-slate-400">{questions.length} questions generated</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !loading && (
          <div className="text-center text-slate-500 py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-1">No Questions Yet</p>
            <p className="text-xs">
              Upload a resume and click "Generate Questions"
            </p>
          </div>
        )}

        {/* Questions */}
        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
          >
            {/* Question Header */}
            <div
              onClick={() => toggleExpand(index)}
              className="flex items-start justify-between p-4 cursor-pointer"
            >
              <div className="flex-1 pr-3">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium
                  }`}>
                    {q.difficulty}
                  </span>
                  {q.type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      TYPE_COLORS[q.type] || TYPE_COLORS.conceptual
                    }`}>
                      {q.type}
                    </span>
                  )}
                  {q.skill && (
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                      {q.skill}
                    </span>
                  )}
                </div>
                {/* Question Text */}
                <p className="text-sm text-white leading-relaxed">
                  {q.question}
                </p>
              </div>
              <button className="text-slate-400 hover:text-white p-1 flex-shrink-0">
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="px-4 pb-4 border-t border-slate-700 pt-3 space-y-3">
                {q.context && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Why ask this?</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{q.context}</p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyQuestion(q.question, index)
                  }}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-3 py-2 bg-slate-700/50 rounded-lg"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy question</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
