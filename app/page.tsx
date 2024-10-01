'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const EnhancedLandingPageComponent = dynamic(
  () => import('@/components/enhanced-landing-page'),
  { ssr: false }
)

export default function Home() {
  const router = useRouter()

  const handleSignInClick = () => {
    router.push('/auth')
  }

  return <EnhancedLandingPageComponent onSignInClick={handleSignInClick} />
}