// Polyfills are now handled by vite-plugin-node-polyfills
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import App from './App.jsx'
import './index.css'

// NOTE: StrictMode REMOVED - it causes useEffect to run twice,
// which destroys WebRTC peer connections in development mode

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
)
