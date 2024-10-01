'use client'

import { useState, useEffect, useRef, useMemo, useCallback, MouseEvent } from 'react'
import { motion, useAnimation, useScroll, useTransform, useInView, AnimatePresence, MotionValue } from 'framer-motion'
import { useSpring, animated, interpolate } from 'react-spring'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic2, Sparkles, Brain, Clock, Search, ChevronDown, CheckCircle, ArrowRight, Menu, X } from "lucide-react"
import Image from "next/image"
import AnimatedBeam from "@/components/animata/background/animated-beam"
import { useMediaQuery } from 'react-responsive'

// Update GradientText component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 ${className}`}>
    {children}
  </span>
)

// Add this new component for animated text
const AnimatedText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  const words = text.split(" ");
  
  return (
    <motion.h1 className={`${className} flex flex-wrap justify-center`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// Add this new component for a floating effect
const FloatingElement: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      {children}
    </motion.div>
  );
};
// Add this component for a glowing effect
import { MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingButtonProps extends MotionProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlowingButton: React.FC<GlowingButtonProps> = ({ children, className = "", onClick, ...motionProps }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-75 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Update FeatureCard with more animations
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0"
        whileHover={{ opacity: 0.1 }}
      />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <Icon className="h-10 w-10 text-purple-300 mb-4" />
      </motion.div>
      <motion.h3 
        className="text-xl font-semibold mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.4 }}
      >
        <GradientText>{title}</GradientText>
      </motion.h3>
      <motion.p 
        className="text-gray-300"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.5 }}
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

// Add missing prop types for PricingCard component
const PricingCard: React.FC<{ name: string; price: string; features: string[] }> = ({ name, price, features }) => {
  return (
    <Tilt>
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
        whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      >
        <h3 className="text-2xl font-bold mb-4"><GradientText>{name}</GradientText></h3>
        <p className="text-4xl font-bold mb-6">{price}</p>
        <ul className="mb-8 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
          Choose Plan
        </Button>
      </motion.div>
    </Tilt>
  )
}

// Add this component for a 3D tilt effect
const Tilt: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tiltRef, setTiltRef] = useState<HTMLDivElement | null>(null);
  const { tiltX, tiltY } = useSpring({
    tiltX: 0,
    tiltY: 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef) return;
    const rect = tiltRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltAmountX = (x - centerX) / centerX;
    const tiltAmountY = (y - centerY) / centerY;
    tiltX.set(tiltAmountX * 10);
    tiltY.set(-tiltAmountY * 10);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <animated.div
      ref={setTiltRef}
      style={{
        transform: interpolate([tiltX, tiltY], (x, y) => `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </animated.div>
  );
};

// Add a particle effect background
const ParticleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

interface EnhancedLandingPageComponentProps {
  onSignInClick: () => void;
}

interface NavItemProps {
  href: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, onClick }) => (
  <motion.a
    href={href}
    className="relative px-3 py-2 text-white hover:text-purple-300 transition-colors"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
    <motion.span
      className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-300"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.a>
)

const EnhancedLandingPageComponent: React.FC<EnhancedLandingPageComponentProps> = ({ onSignInClick }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const controls = useAnimation()
  const { scrollY } = useScroll()
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    if (typeof window !== 'undefined') {
      const section = document.getElementById(sectionId);
      const header = document.querySelector('header');
      if (section && header) {
        const headerHeight = header.getBoundingClientRect().height;
        const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: sectionTop,
          behavior: 'smooth'
        });
      }
    }
  };

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
  ]

  return (
    <AnimatedBeam className="min-h-screen text-white">
      <ParticleBackground />

      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black bg-opacity-70 backdrop-blur-lg shadow-lg' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
          >
            <Mic2 className="h-8 w-8 text-purple-300" />
            <GradientText className="text-2xl font-bold">ApexyAI Pro</GradientText>
          </motion.div>
          
          {isMobile ? (
            <motion.button
              className="text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          ) : (
            <nav className="flex items-center space-x-8">
              {navItems.map((item) => (
                <NavItem 
                  key={item.name} 
                  href={item.href} 
                  onClick={(e) => scrollToSection(e, item.href.slice(1))}
                >
                  {item.name}
                </NavItem>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  className="bg-transparent border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-black transition-all duration-300" 
                  onClick={onSignInClick}
                >
                  Sign In
                </Button>
              </motion.div>
            </nav>
          )}
        </div>
        
        <AnimatePresence>
          {isMobile && isMenuOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 bg-black bg-opacity-90 backdrop-blur-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="flex flex-col items-center py-4 space-y-4">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.name} 
                    href={item.href} 
                    onClick={(e) => {
                      scrollToSection(e, item.href.slice(1))
                      setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </NavItem>
                ))}
                <Button 
                  variant="outline" 
                  className="bg-transparent border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-black transition-all duration-300" 
                  onClick={() => {
                    onSignInClick()
                    setIsMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="pt-32 relative z-10">
        <motion.section 
          ref={heroRef}
          className="container mx-auto px-4 py-24"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <AnimatedText 
              text="Elevate Your Podcast Research"
              className="text-7xl font-bold mb-6 leading-tight"
            />
            <motion.p 
              className="text-2xl mb-12 text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Harness the power of AI to transform your podcast preparation process
            </motion.p>
            <GlowingButton
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-10 py-6 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg group"
              onClick={onSignInClick}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Start Your Exclusive Trial
              <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
            </GlowingButton>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative">
              <FloatingElement>
                <motion.div
                  className="rounded-lg overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <Image
                    src="/images/Dashscreen.png"
                    width={600}
                    height={400}
                    alt="ApexyAI Pro Dashboard"
                    className="w-full h-auto"
                  />
                </motion.div>
              </FloatingElement>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 mix-blend-overlay rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1, duration: 1 }}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                <GradientText>Effortless Research</GradientText> at Your Fingertips
              </h2>
              <p className="text-lg text-gray-300">
                ApexyAI Pro leverages cutting-edge AI technology to provide you with comprehensive research for your podcast topics, saving you hours of preparation time.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Sparkles, text: "AI-powered topic analysis" },
                  { icon: Brain, text: "Intelligent content suggestions" },
                  { icon: Clock, text: "Time-saving automated research" },
                  { icon: Search, text: "In-depth source verification" },
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition-all duration-300"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(167, 139, 250, 0.3)",
                    }}
                  >
                    <item.icon className="h-6 w-6 text-purple-300" />
                    <span className="text-gray-300">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.section>

        <section id="features" className="py-24 mt-16 bg-purple-900 bg-opacity-50">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-4xl font-bold text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GradientText>Elevate Your Podcast</GradientText> with ApexyAI Pro
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Brain}
                title="Smart Research"
                description="Our AI analyzes vast amounts of data to provide you with the most relevant and up-to-date information for your podcast topics."
              />
              <FeatureCard
                icon={Clock}
                title="Time Efficiency"
                description="Reduce your preparation time by up to 70% with our automated research tools, allowing you to focus on creating compelling content."
              />
              <FeatureCard
                icon={Sparkles}
                title="Customized Insights"
                description="Receive tailored suggestions and insights based on your podcast's niche and audience preferences."
              />
            </motion.div>
          </div>
        </section>

        {/* New Start Free Trial Section */}
        <motion.section 
          className="py-32 bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/circuit-pattern.svg')] opacity-10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <GradientText className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Experience the Future of Podcasting
                </GradientText>
              </motion.h2>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Harness the power of cutting-edge AI to revolutionize your podcast preparation. 
                Unlock exclusive features, save countless hours, and create content that truly resonates.
              </motion.p>
              
              <motion.div
                className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <GlowingButton
                  className="bg-white text-purple-900 text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-opacity-90 transform hover:-translate-y-1"
                  onClick={onSignInClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your 14-Day Free Trial
                </GlowingButton>
                <span className="text-gray-400 text-lg">No credit card required</span>
              </motion.div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div 
              className="mt-20 grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              viewport={{ once: true }}
            >
              {[
                { icon: Sparkles, title: "AI-Powered Insights", description: "Get deep, contextual analysis of your topics" },
                { icon: Clock, title: "Save 10+ Hours/Week", description: "Automate your research and preparation" },
                { icon: Brain, title: "Personalized Content", description: "Tailored suggestions based on your style" }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <feature.icon className="h-12 w-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Testimonial or social proof */}
            <motion.div 
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              viewport={{ once: true }}
            >
              <blockquote className="text-2xl italic text-gray-300 mb-4">
                "ApexyAI Pro transformed our podcast workflow. It's an absolute game-changer!"
              </blockquote>
              <p className="text-purple-400 font-semibold">- Sarah Johnson, Top 10 Tech Podcast Host</p>
            </motion.div>
          </div>

          {/* Enhanced animated particles */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 2 }}
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * 100 - 50],
                  x: [0, Math.random() * 100 - 50],
                  scale: [1, Math.random() * 1.5 + 0.5, 1],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            ))}
          </motion.div>
        </motion.section>

        <section id="pricing" className="py-24 mt-16">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-4xl font-bold text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GradientText>Choose Your Plan</GradientText>
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
              viewport={{ once: true }}
            >
              <PricingCard
                name="Starter"
                price="€19.99"
                features={["Basic AI research", "5 podcast topics/month", "Email support"]}
              />
              <PricingCard
                name="Pro"
                price="€29.99"
                features={["Advanced AI research", "Unlimited topics", "Priority support", "Custom insights"]}
              />
              <PricingCard
                name="Enterprise"
                price="Custom"
                features={["Full-scale AI integration", "Dedicated account manager", "Custom API access", "Advanced analytics"]}
              />
            </motion.div>
          </div>
        </section>

        <motion.section 
          className="py-16 bg-purple-900 bg-opacity-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h3
              className="text-3xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <GradientText>Already have an account?</GradientText>
            </motion.h3>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Sign in to access your ApexyAI Pro dashboard and continue elevating your podcast.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              viewport={{ once: true }}
            >
              <GlowingButton
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-10 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                onClick={onSignInClick}
              >
                Sign In
              </GlowingButton>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <footer className="bg-black bg-opacity-50 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.p 
            className="text-purple-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} ApexyAI Pro. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </AnimatedBeam>
  )
}

export default EnhancedLandingPageComponent