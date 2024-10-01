'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth } from 'firebase/auth'
import EnhancedLandingPageComponent from './enhanced-landing-page'
import AuthPage from './auth-page'
import PremiumPodcastAssistant from './premium-podcast-assistant'
import Link from 'next/link'

const auth = getAuth()

export function MainComponent() {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return <div>Loading...</div>
  }

  // The routing is now handled by Next.js, so we don't need to conditionally render components here
  return null
}