import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check local storage for superadmin status
    const savedSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
    if (savedSuperAdmin) setIsSuperAdmin(true)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserClub(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserClub(session.user.id)
      } else {
        setClub(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserClub(userId) {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('owner_id', userId)
        .single()

      if (error) {
        console.error('Error fetching club:', error)
      } else {
        setClub(data)
      }
    } catch (err) {
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    club,
    loading,
    isSuperAdmin,
    loginAsSuperAdmin: (login, password) => {
      const adminToken = import.meta.env.VITE_SUPERADMIN_TOKEN || 'admin123';
      if (login === 'admin' && password === adminToken) {
        setIsSuperAdmin(true);
        localStorage.setItem('isSuperAdmin', 'true');
        return { success: true };
      }
      return { success: false, error: 'Login yoki parol noto\'g\'ri' };
    },
    signIn: async (login, password) => {
      // 1. First verify against clubs table records for management override
      const { data: clubRecord, error: clubSearchError } = await supabase
        .from('clubs')
        .select('*')
        .eq('login', login)
        .single();

      if (clubSearchError || !clubRecord || clubRecord.password !== password) {
        return { error: { message: 'Login yoki parol noto\'g\'ri' } };
      }

      // 2. If valid in management table, proceed to Auth session
      const email = login.includes('@') ? login : `${login}@axiph.pos`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (data?.user) {
        setClub(clubRecord);
      }
      return { data, error };
    },
    updateClub: async (updates) => {
      if (!club?.id) return { error: { message: 'Klub topilmadi' } };

      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', club.id)
        .select()
        .single();

      if (!error) setClub(data);
      return { data, error };
    },
    signUp: async (login, password, clubName, subscriptionMonths = 1) => {
      // Internal mapping: login -> login@axiph.pos
      const email = login.includes('@') ? login : `${login}@axiph.pos`;

      // 1. Try signUp first
      let { data, error } = await supabase.auth.signUp({ email, password })
      
      // 2. If user already exists, try to recover the session to check/create the club record
      if (error?.message?.toLowerCase().includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (signInError) {
          // If signIn fails, the password might be wrong or login truly band
          return { error: { message: 'Ushbu login band yoki parol xato kiritilgan.' } };
        }
        
        data = signInData;
        error = null;
      }

      if (error) return { error }

      if (data?.user) {
        // 3. Check if club profile already exists for this user
        const { data: existingClub } = await supabase
          .from('clubs')
          .select('*')
          .eq('owner_id', data.user.id)
          .single();

        if (existingClub) {
          // Club already exists, just return it as success recovery
          return { data: { user: data.user, club: existingClub }, error: null }
        }

        // 4. If club record is missing, create it now (Self-healing)
        const slug = clubName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(subscriptionMonths));

        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .insert([{ 
            name: clubName, 
            slug, 
            owner_id: data.user.id,
            login: login,
            password: password,
            subscription_expires_at: expiresAt.toISOString()
          }])
          .select()
          .single()

        if (clubError) return { error: clubError }
        
        // If the SuperAdmin is doing this, we might not want to set active club, 
        // but it's safe since SuperAdmin UI doesn't rely on 'club' state for auth.
        setClub(clubData)
        return { data: { user: data.user, club: clubData }, error: null }
      }
      return { data, error: null }
    },
    signOut: () => {
      setIsSuperAdmin(false);
      localStorage.removeItem('isSuperAdmin');
      return supabase.auth.signOut();
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
