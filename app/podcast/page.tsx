'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase'
import PremiumPodcastAssistant from '@/components/premium-podcast-assistant'

export default function Podcast() {
  const router = useRouter()
  const [user, loading] = useAuthState(auth)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <PremiumPodcastAssistant />
}