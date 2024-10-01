'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase'
import AuthPage from '@/components/auth-page'

export default function Auth() {
  const router = useRouter()
  const [user, loading] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      router.push('/podcast')
    }
  }, [user, router])

  const handleGoBack = () => {
    router.push('/')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <AuthPage onGoBack={handleGoBack} />
  }

  return null
}
