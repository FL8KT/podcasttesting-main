'use client'

import { useRouter } from 'next/navigation'
import EnhancedLandingPageComponent from '@/components/enhanced-landing-page'

export default function Home() {
  const router = useRouter()

  const handleSignInClick = () => {
    router.push('/auth')
  }

  return <EnhancedLandingPageComponent onSignInClick={handleSignInClick} />
}