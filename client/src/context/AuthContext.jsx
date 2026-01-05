import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

// Storage keys
const USER_KEY = 'hireeflow_user'
const USERS_KEY = 'hireeflow_users'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem(USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  // Get all users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  // Sign up a new user
  const signUp = async ({ name, email, password, company }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const users = getUsers()

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists')
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password, // In real app, this would be hashed
      company,
      createdAt: new Date().toISOString(),
      interviews: []
    }

    // Save to users list
    users.push(newUser)
    saveUsers(users)

    // Auto login
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Sign in existing user
  const signIn = async ({ email, password }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const users = getUsers()
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!foundUser) {
      throw new Error('Invalid email or password')
    }

    const userWithoutPassword = { ...foundUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Sign out
  const signOut = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  // Update user data
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))

    // Also update in users list
    const users = getUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      saveUsers(users)
    }
  }

  // Add interview to user's history
  const addInterview = (interview) => {
    const users = getUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      if (!users[index].interviews) {
        users[index].interviews = []
      }
      users[index].interviews.push(interview)
      saveUsers(users)

      // Update current user state
      const updatedUser = { ...user, interviews: users[index].interviews }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateUser,
    addInterview
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
