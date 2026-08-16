/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { supabase } from '../../lib/supabase'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadInitialSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error('Session loading error:', error.message)
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id)
      } else {
        setProfile(null)
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    async function loadProfile(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
            id,
            full_name,
            role,
            grade_level,
            cohort,
            avatar_url,
            is_premium,
            premium_until
          `,
        )
        .eq('id', userId)
        .single()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error('Profile loading error:', error.message)
        setProfile(null)
        return
      }

      setProfile(data)
    }

    loadInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!isMounted) {
          return
        }

        setSession(nextSession)
        setUser(nextSession?.user ?? null)

        if (nextSession?.user) {
          await loadProfile(nextSession.user.id)
        } else {
          setProfile(null)
        }

        if (isMounted) {
          setIsLoading(false)
        }
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      isStudent: profile?.role === 'student',
      isTeacher:
        profile?.role === 'teacher' ||
        profile?.role === 'super_admin',
      isSuperAdmin: profile?.role === 'super_admin',
      signOut,
    }),
    [session, user, profile, isLoading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    )
  }

  return context
}

export { AuthProvider, useAuth }
