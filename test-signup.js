import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  const email = `test-user-${Date.now()}@example.com`
  const password = 'TestPassword123'
  const clubName = 'Test Club'

  console.log(`Testing signup with email: ${email}...`)

  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password 
  })

  if (error) {
    if (error.message.includes('rate limit')) {
      console.error('❌ FAILED: Email rate limit still exists.')
    } else {
      console.error('❌ FAILED with error:', error.message)
    }
    return
  }

  console.log('✅ Auth Signup SUCCESS! (Emails are bypassed)')

  if (data?.user) {
    console.log('Attempting to create a club record...')
    const slug = clubName.toLowerCase().replace(/ /g, '-')
    const { error: clubError } = await supabase
      .from('clubs')
      .insert([{ name: clubName, slug, owner_id: data.user.id }])
    
    if (clubError) {
      if (clubError.message.includes('relation "public.clubs" does not exist')) {
        console.warn('⚠️  INFO: Auth works, but "clubs" table is missing. RUN THE SQL SCHEMA!')
      } else {
        console.error('❌ Failed to create club:', clubError.message)
      }
    } else {
      console.log('✅ Club creation SUCCESS!')
    }
  }
}

testSignup()
