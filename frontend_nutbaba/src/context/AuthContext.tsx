import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Admin } from '../types'
import { getApiUrl } from '../utils'

const API_URL = getApiUrl()

interface AuthContextType {
  user: User | null
  admin: Admin | null
  loading: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => void
  adminLogin: (username: string, password: string) => Promise<boolean>
  adminLogout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      })
      const data = await response.json()
      
      if (data.success) {
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            googleId: data.user.google_id || '',
            phone: data.user.phone,
            address: data.user.address,
            city: data.user.city,
            state: data.user.state,
            pincode: data.user.pincode,
            createdAt: data.user.created_at
          })
        }
        if (data.admin) {
          setAdmin(data.admin)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password')
    }

    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      googleId: data.user.google_id || '',
      phone: data.user.phone,
      address: data.user.address,
      city: data.user.city,
      state: data.user.state,
      pincode: data.user.pincode,
      createdAt: data.user.created_at
    })
  }

  const register = async (name: string, lastName: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, lastName, email, password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed')
    }

    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      googleId: '',
      createdAt: new Date().toISOString()
    })
  }

  const googleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAdmin(data.admin)
        return true
      }
      return false
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    }
  }

  const adminLogout = async () => {
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Admin logout error:', error)
    }
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading: isLoading,
        isLoading,
        login,
        register,
        logout,
        googleLogin,
        adminLogin,
        adminLogout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
