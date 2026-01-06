import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useSocket } from '../context/SocketContext'
import { Play, Copy, Check, ChevronDown, Loader2, X, Terminal, Code2, Minimize2 } from 'lucide-react'

// Supported languages with Piston API mappings
const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', piston: 'javascript', version: '18.15.0' },
  { id: 'typescript', name: 'TypeScript', piston: 'typescript', version: '5.0.3' },
  { id: 'python', name: 'Python', piston: 'python', version: '3.10.0' },
  { id: 'java', name: 'Java', piston: 'java', version: '15.0.2' },
  { id: 'cpp', name: 'C++', piston: 'c++', version: '10.2.0' },
  { id: 'c', name: 'C', piston: 'c', version: '10.2.0' },
  { id: 'go', name: 'Go', piston: 'go', version: '1.16.2' },
  { id: 'rust', name: 'Rust', piston: 'rust', version: '1.68.2' },
]

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'

const DEFAULT_CODE = `// HireeFlow.ai - Collaborative Code Editor
// Write your solution here...

function solution(input) {
  // Your code here
  return input;
}

// Test your code
console.log(solution("Hello, World!"));
`

const CodeEditor = ({ onClose }) => {
  const { socket, roomId } = useSocket()

  // Editor state
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [copied, setCopied] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  // Code execution state
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState(null)
  const [showConsole, setShowConsole] = useState(false)

  // Ref to track if change is from remote
  const isRemoteChange = useRef(false)
  const editorRef = useRef(null)

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
  }

  // Handle local code changes
  const handleEditorChange = (value) => {
    setCode(value || '')

    // Only emit if this is a LOCAL change
    if (!isRemoteChange.current && socket && roomId) {
      console.log('📝 Emitting code-change to room:', roomId)
      socket.emit('code-change', {
        roomId,
        code: value || '',
        language
      })
    }
    isRemoteChange.current = false
  }

  // Listen for remote code and language changes
  useEffect(() => {
    if (!socket) return

    const handleCodeUpdate = (data) => {
      console.log('📥 Received code-update from remote')
      isRemoteChange.current = true
      // Handle both old format (string) and new format (object)
      if (typeof data === 'string') {
        setCode(data)
      } else {
        setCode(data.code || '')
        if (data.language) {
          setLanguage(data.language)
        }
      }
    }

    const handleLanguageUpdate = (newLanguage) => {
      console.log('📥 Received language-update:', newLanguage)
      setLanguage(newLanguage)
    }

    socket.on('code-update', handleCodeUpdate)
    socket.on('language-update', handleLanguageUpdate)
    console.log('👂 Listening for code-update and language-update events')

    return () => {
      socket.off('code-update', handleCodeUpdate)
      socket.off('language-update', handleLanguageUpdate)
    }
  }, [socket])

  // Copy code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Change language and sync to other users
  const selectLanguage = (langId) => {
    setLanguage(langId)
    setShowLangDropdown(false)

    // Emit language change to sync with other users
    if (socket && roomId) {
      console.log('🔧 Emitting language-change:', langId)
      socket.emit('language-change', {
        roomId,
        language: langId
      })
    }
  }

  // Run code using Piston API
  const runCode = async () => {
    const langConfig = LANGUAGES.find(l => l.id === language)

    if (!langConfig?.piston) {
      setOutput({
        success: false,
        error: `${langConfig?.name || language} execution is not supported.`
      })
      setShowConsole(true)
      return
    }

    setIsRunning(true)
    setShowConsole(true)
    setOutput(null)

    try {
      const response = await fetch(PISTON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langConfig.piston,
          version: langConfig.version,
          files: [{ content: code }]
        })
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const result = await response.json()
      const runResult = result.run || {}
      const stdout = runResult.stdout ?? ''
      const stderr = runResult.stderr ?? ''
      const exitCode = runResult.code
      const pistonOutput = runResult.output ?? ''

      let displayText = stdout.trim() || pistonOutput.trim() || stderr.trim() || ''

      setOutput({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode,
        displayText: displayText || '(Program finished with no output)'
      })
    } catch (error) {
      setOutput({
        success: false,
        error: error.message || 'Failed to execute code.'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.id === language)

  return (
    <div className="h-full flex bg-slate-950">
      {/* Editor Section */}
      <div className={`flex-1 flex flex-col ${showConsole ? 'w-1/2' : 'w-full'}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border-b border-slate-700">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              {selectedLang?.name || language}
              <ChevronDown className={`w-4 h-4 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLangDropdown && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => selectLanguage(lang.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center justify-between ${
                      language === lang.id ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'
                    }`}
                  >
                    {lang.name}
                    {language === lang.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Copy */}
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Run */}
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm text-white font-medium transition-colors"
              title="Run code (Ctrl+Enter)"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Run</span>
            </button>

            {/* Close/Minimize Code Editor */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
                title="Close code editor"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </div>
      </div>

      {/* Output Console Panel */}
      {showConsole && (
        <div className="w-1/2 flex flex-col border-l border-slate-700 bg-slate-900">
          {/* Console Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Output</span>
              {output && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  output.success
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {output.success ? 'Success' : output.exitCode !== undefined ? `Exit: ${output.exitCode}` : 'Error'}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowConsole(false)}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close console"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Console Output */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4">
            {isRunning ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-sm">Executing...</span>
              </div>
            ) : output ? (
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {output.error ? (
                  <span className="text-red-400">{output.error}</span>
                ) : output.displayText && output.displayText !== '(Program finished with no output)' ? (
                  <span className="text-green-400">{output.displayText}</span>
                ) : output.stderr ? (
                  <span className="text-red-400">{output.stderr}</span>
                ) : (
                  <span className="text-slate-500">(Program finished with no output)</span>
                )}
              </pre>
            ) : (
              <span className="font-mono text-sm text-slate-500">
                Click "Run" to execute your code...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
