'use client'

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { GridPattern } from "@/components/ui/animated-grid-pattern";
import HyperText from "@/components/ui/hyper-text";
import { AnimatePresence, motion, LayoutGroup, useMotionValue, useTransform } from "framer-motion";
import ShimmerButton from "@/components/ui/shimmer-button";
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';

const AuthPage: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]); // Reduced rotation range
  const rotateY = useTransform(x, [-100, 100], [-5, 5]); // Reduced rotation range

  const inputStyle = {
    WebkitTextFillColor: '#000',
    boxShadow: '0 0 0px 1000px white inset',
    transition: 'background-color 5000s ease-in-out 0s',
    font: 'inherit',
    fontSize: '16px',
    lineHeight: '1.5',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none'
  };

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        router.push('/podcast'); // Redirect to the podcast page after successful sign-in
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrorPopup(false);
    setPasswordMatchError('');

    if (password.length < 6) {
      setPopupMessage('Password should be at least 6 characters long.');
      setShowErrorPopup(true);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match.');
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setPopupMessage('Successfully signed up!');
        setShowSuccessPopup(true);
        console.log('New user created:', userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setPopupMessage('Successfully logged in!');
        setShowSuccessPopup(true);
        console.log('User signed in:', userCredential.user.uid);
      }
    } catch (error) {
      if (error instanceof Error) {
        setPopupMessage(error.message);
      } else {
        setPopupMessage('An unexpected error occurred');
      }
      setShowErrorPopup(true);
      console.error('Authentication error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const formVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) * 0.1); // Reduced sensitivity
    y.set((event.clientY - centerY) * 0.1); // Reduced sensitivity
  };

  // Add this function to handle the go back action
  const handleGoBack = () => {
    onGoBack(); // Call the onGoBack function passed as a prop
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="text-purple-500/30"  // Increased opacity
        containerClassName="absolute inset-0 -z-10"
        x={-1}
        y={-1}
        strokeDasharray={0}
        numSquares={300}  // Increased number of squares
        maxOpacity={0.5}  // Increased max opacity
        duration={3}  // Increased duration
        repeatDelay={1.5}  // Increased repeat delay
      />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}  // Increased from 1.2 to 2
      >
        <HyperText 
          text="APEXYAI" 
          className="text-5xl font-extrabold mb-8 relative z-10 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 drop-shadow-sm"
          duration={1500}  // Increased to 1500 as requested
        />
      </motion.div>

      {/* Add this new motion.div for the Go Back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-4 left-4 z-20"
      >
        <button
          onClick={handleGoBack}
          className="flex items-center text-purple-500 hover:text-purple-600 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-md relative z-10"
        style={{
          perspective: 2000 // Increased perspective for subtler effect
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <LayoutGroup>
          <motion.div
            layout
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transition: "all 0.1s ease" // Smoother transition
            }}
          >
            <motion.div layout className="flex mb-6">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 ${!isSignUp ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 ${isSignUp ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                Sign Up
              </button>
            </motion.div>
            <AnimatePresence mode="sync">
              <motion.p
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-600 mb-6"
              >
                {isSignUp ? "Already have an account? Press Sign In" : "Don't have an account? Press Sign Up"}
              </motion.p>
            </AnimatePresence>
            <form onSubmit={handleAuth} className="space-y-4 w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup-form' : 'signin-form'}
                  {...formVariants}
                >
                  <motion.div layout className="relative mb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 text-base font-sans"
                      required
                      style={{
                        ...inputStyle,
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    />
                  </motion.div>
                  <motion.div layout className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 text-base font-sans"
                      required
                      style={{
                        ...inputStyle,
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 transition duration-300"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </motion.div>
                  {isSignUp && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative mb-4"
                    >
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 transition duration-300"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </motion.div>
                  )}
                  {passwordMatchError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {passwordMatchError}
                    </motion.p>
                  )}
                  <motion.div layout>
                    <ShimmerButton
                      shimmerColor="#ffffff"
                      shimmerSize="0.1em"
                      shimmerDuration="2.5s"
                      background="linear-gradient(45deg, #6366f1, #8b5cf6)"
                      borderRadius="9999px"
                      className="w-full py-3 text-white font-semibold text-lg shadow-lg flex items-center justify-center"
                    >
                      {isSignUp ? (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Sign Up
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          Sign In
                        </>
                      )}
                    </ShimmerButton>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </form>
            {!isSignUp && (
              <motion.p
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-center text-blue-600 mt-4 cursor-pointer hover:underline"
              >
                Forgot Password
              </motion.p>
            )}
            <motion.div layout className="mt-8">
              <p className="text-sm text-center text-gray-600 mb-4">Or sign {isSignUp ? 'up' : 'in'} with</p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleSignIn}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition duration-300 shadow-md"
                >
                  <FcGoogle className="mr-2" /> Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition duration-300 shadow-md"
                >
                  <FaApple className="mr-2" /> Apple
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </motion.div>

      {/* Add floating elements */}
      <FloatingElement
        className="absolute top-20 left-20 w-16 h-16 bg-purple-500 rounded-full opacity-30"
        animationProps={{ y: [0, -20, 0], duration: 5, repeat: Infinity }}
      />
      <FloatingElement
        className="absolute bottom-20 right-20 w-20 h-20 bg-indigo-500 rounded-full opacity-30"
        animationProps={{ y: [0, 20, 0], duration: 7, repeat: Infinity }}
      />
      <FloatingElement
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-pink-500 rounded-full opacity-30"
        animationProps={{ y: [0, -15, 0], duration: 6, repeat: Infinity }}
      />
    </div>
  );
};

// Add this new component at the end of the file
const FloatingElement: React.FC<{
  className: string;
  animationProps: {
    y: number[];
    duration: number;
    repeat: number;
  };
}> = ({ className, animationProps }) => {
  return (
    <motion.div
      className={className}
      animate={{ y: animationProps.y }}
      transition={{
        duration: animationProps.duration,
        repeat: animationProps.repeat,
        ease: "easeInOut",
      }}
    />
  );
};

export default AuthPage;