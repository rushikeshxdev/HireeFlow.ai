import { Routes, Route } from 'react-router-dom'

// Pages
import LandingPage from './pages/LandingPage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import InterviewRoom from './pages/InterviewRoom'
import CandidateJoin from './pages/CandidateJoin'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Candidate Join Route (public - no auth required) */}
      <Route path="/join/:roomId" element={<CandidateJoin />} />

      {/* Protected Routes (requires authentication) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:roomId"
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
