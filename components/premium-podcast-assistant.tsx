'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { FiSearch, FiUser, FiTwitter, FiLinkedin, FiGlobe, FiClock, FiSettings, FiBookOpen, FiHome, FiCalendar, FiBarChart2, FiTrendingUp, FiEdit3, FiFolder, FiFile, FiPlus, FiChevronRight, FiChevronDown, FiMoon, FiSun, FiLogOut, FiChevronLeft, FiCopy, FiChevronRight as FiChevronRightIcon, FiChevronLeft as FiChevronLeftIcon, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import { getAuth, signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getFirestore, doc, setDoc, collection, addDoc, query, orderBy, limit, getDocs, getDoc, updateDoc, QueryDocumentSnapshot, DocumentData, where, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useSpring, animated } from 'react-spring'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday, isSameMonth, isSameDay } from 'date-fns'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { FirebaseError } from 'firebase/app';
import AuthPage from './auth-page'
import { Switch } from '@headlessui/react'
// Remove the import for react-modal as it's causing an error
// import Modal from 'react-modal';

const firebaseConfig = {
  apiKey: "AIzaSyBF7CT0zjsqG01WTcWZr-KUFbmiNyVVWSw",
  authDomain: "cursorai-12ebe.firebaseapp.com",
  projectId: "cursorai-12ebe",
  storageBucket: "cursorai-12ebe.appspot.com",
  messagingSenderId: "327589599737",
  appId: "1:327589599737:web:4ea05227ea786c8b550528"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

type Section = 'Home' | 'Research' | 'History' | 'Calendar' | 'Notes' | 'Settings'

type NoteItem = {
  id: string
  type: 'folder' | 'page'
  name: string
  content?: string
  children?: NoteItem[]
}

type CalendarNote = {
  id: string;
  date: string;
  content: string;
};

const Background = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 dark:from-black dark:via-gray-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMzAgMzNMMCA2M2g2MEwzMCAzM3oiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PC9wYXRoPgo8cGF0aCBkPSJNMzAgMzNMNjAgNjNIMEwzMCAzM3oiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-20"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black opacity-30"></div>
    </div>
  )
}

const PremiumPodcastAssistant: React.FC = () => {
  const [user, loading] = useAuthState(auth)
  const [guestName, setGuestName] = useState('')
  const [lastSearchedName, setLastSearchedName] = useState('')
  const [guestInfo, setGuestInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('Home')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('podcastNotes')
      return savedNotes ? JSON.parse(savedNotes) : [
        {
          id: '1',
          type: 'folder',
          name: 'Getting Started',
          children: [
            { id: '2', type: 'page', name: 'Welcome', content: 'Welcome to your premium podcast notes!' },
            { id: '3', type: 'page', name: 'Pro Tips', content: 'Here are some expert tips for creating outstanding podcasts...' }
          ]
        },
        { id: '4', type: 'page', name: 'Content Ideas', content: 'Innovative podcast concepts...' }
      ]
    }
    return []
  })
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']))
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const controls = useAnimation()
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<Array<{person: string, timestamp: string}>>([])
  const [searchHistory, setSearchHistory] = useState<Array<{id: string, person: string, timestamp: string}>>([])
  const [selectedPerson, setSelectedPerson] = useState<{person: string, output: string} | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isOutputLoading, setIsOutputLoading] = useState(false);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [recentSearchesUnsubscribe, setRecentSearchesUnsubscribe] = useState<(() => void) | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    controls.start({
      opacity: [0.5, 1, 0.5],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    })
  }, [controls])

  useEffect(() => {
    localStorage.setItem('podcastNotes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    const addUserToFirestore = async () => {
      if (user && !loading) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            email: user.email,
            uid: user.uid,
            created_time: serverTimestamp(),
          }, { merge: true });
          console.log("User added to Firestore");
        } catch (error) {
          console.error("Error adding user to Firestore:", error);
        }
      }
    };

    addUserToFirestore();
  }, [user, loading]);

  useEffect(() => {
    const setupRecentSearchesListener = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const historyCollectionRef = collection(userRef, 'History');
        const recentSearchesQuery = query(historyCollectionRef, orderBy('timestamp', 'desc'), limit(3));
        
        try {
          const unsubscribe = onSnapshot(recentSearchesQuery, (querySnapshot) => {
            const searches = querySnapshot.docs.map(doc => {
              const data = doc.data();
              const date = data.timestamp?.toDate();
              return { 
                person: data.person, 
                timestamp: date ? format(date, 'MMM d, yyyy HH:mm') : 'No date'
              };
            });
            setRecentSearches(searches);
          }, (error) => {
            console.error("Error fetching recent searches:", error);
          });

          setRecentSearchesUnsubscribe(() => unsubscribe);
        } catch (error) {
          console.error("Error setting up recent searches listener:", error);
        }
      }
    };

    setupRecentSearchesListener();

    // Cleanup function
    return () => {
      if (recentSearchesUnsubscribe) {
        recentSearchesUnsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    const fetchSearchHistory = async (): Promise<(() => void) | undefined> => {
      if (user) {
        setIsHistoryLoading(true);
        setHistoryError(null);
        const userRef = doc(db, 'users', user.uid);
        const historyCollectionRef = collection(userRef, 'History');
        const searchHistoryQuery = query(historyCollectionRef, orderBy('timestamp', 'desc'), limit(15));
        
        try {
          const unsubscribe = onSnapshot(searchHistoryQuery, (querySnapshot) => {
            const history = querySnapshot.docs.map(doc => {
              const data = doc.data();
              const date = data.timestamp?.toDate();
              return { 
                id: doc.id, 
                person: data.person, 
                timestamp: date ? format(date, 'MMM d, yyyy HH:mm') : 'No date'
              };
            });
            setSearchHistory(history);
            setIsHistoryLoading(false);
          }, (error) => {
            console.error("Error fetching search history:", error);
            setHistoryError("Failed to load search history. Please try again later.");
            setIsHistoryLoading(false);
          });

          return unsubscribe;
        } catch (error) {
          console.error("Error setting up search history listener:", error);
          setHistoryError("Failed to set up search history listener. Please try again later.");
          setIsHistoryLoading(false);
        }
      }
    };

    const unsubscribeFunction = fetchSearchHistory();

    // Cleanup function
    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction.then(unsubscribe => {
          if (unsubscribe) {
            unsubscribe();
          }
        });
      }
    };
  }, [user]);

  // Fetch calendar notes when component mounts or user changes
  useEffect(() => {
    const fetchCalendarNotes = async () => {
      if (user) {
        const calendarRef = collection(db, 'users', user.uid, 'Calendar');
        try {
          const querySnapshot = await getDocs(calendarRef);
          const notes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            date: doc.data().Date,
            content: doc.data().Note
          }));
          setCalendarNotes(notes);
        } catch (error) {
          console.error("Error fetching calendar notes:", error);
        }
      }
    };

    fetchCalendarNotes();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setWebhookResponse(null);
    setLastSearchedName(guestName);
    try {
      const response = await axios.post('https://hook.eu2.make.com/dip7m2lmags6th3jucajiabhatiure5e', {
        guestName: guestName
      });

      setWebhookResponse(response.data);

      // Add search to user's history in Firestore
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const historyCollectionRef = collection(userRef, 'History');
        await addDoc(historyCollectionRef, {
          person: guestName,
          output: response.data,
          timestamp: serverTimestamp()
        });
        console.log("Search added to user's history");
      }
    } catch (error) {
      console.error("Error fetching guest info or updating history:", error);
      setWebhookResponse("Error: Unable to fetch guest information");
    } finally {
      setIsLoading(false);
      setGuestName('');
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addNoteItem = (type: 'folder' | 'page', parentId: string | null = null) => {
    const newItem: NoteItem = {
      id: Date.now().toString(),
      type,
      name: type === 'folder' ? 'New Folder' : 'New Page',
      content: type === 'page' ? '' : undefined,
      children: type === 'folder' ? [] : undefined
    }

    setNotes(prev => {
      let updatedNotes
      if (!parentId) {
        updatedNotes = [...prev, newItem]
      } else {
        updatedNotes = updateNoteTree(prev, parentId, (item) => ({
          ...item,
          children: [...(item.children || []), newItem]
        }))
      }
      return updatedNotes
    })

    if (type === 'page') {
      setActiveNoteId(newItem.id)
    }
  }

  const updateNoteContent = (id: string, content: string) => {
    setNotes(prev => updateNoteTree(prev, id, (item) => ({ ...item, content })))
  }

  const startRenaming = (id: string) => {
    setRenamingId(id)
  }

  const handleRename = (id: string, newName: string) => {
    setNotes(prev => updateNoteTree(prev, id, (item) => ({ ...item, name: newName })))
    setRenamingId(null)
  }

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
    }
  }, [renamingId])

  const renderNoteTree = (items: NoteItem[], depth = 0) => {
    return items.map(item => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        {item.type === 'folder' ? (
          <div className="flex items-center py-2">
            <button
              onClick={() => toggleFolder(item.id)}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 group"
            >
              <motion.div
                animate={{ rotate: expandedFolders.has(item.id) ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronRight className="mr-2 group-hover:text-pink-500" size={18} />
              </motion.div>
              <FiFolder className="mr-2 group-hover:text-pink-500" size={18} />
              {renamingId === item.id ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  defaultValue={item.name}
                  onBlur={(e) => handleRename(item.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(item.id, e.currentTarget.value)
                    }
                  }}
                  className="bg-transparent border-b border-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                />
              ) : (
                <span className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400" onDoubleClick={() => startRenaming(item.id)}>{item.name}</span>
              )}
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addNoteItem('page', item.id)}
              className="ml-auto text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-200"
              aria-label="Add page"
            >
              <FiPlus size={18} />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => setActiveNoteId(item.id)}
            onDoubleClick={() => startRenaming(item.id)}
            className={`flex items-center py-2 w-full text-left group ${
              activeNoteId === item.id
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            } transition-colors duration-200`}
          >
            <FiFile className="mr-2 group-hover:text-pink-500" size={18} />
            {renamingId === item.id ? (
              <input
                ref={renameInputRef}
                type="text"
                defaultValue={item.name}
                onBlur={(e) => handleRename(item.id, e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(item.id, e.currentTarget.value)
                  }
                }}
                className="bg-transparent border-b border-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              />
            ) : (
              <span className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.name}</span>
            )}
          </motion.button>
        )}
        <AnimatePresence>
          {item.children && expandedFolders.has(item.id) && renderNoteTree(item.children, depth + 1)}
        </AnimatePresence>
      </motion.div>
    ))
  }

  const getActiveNote = (items: NoteItem[]): NoteItem | null => {
    for (const item of items) {
      if (item.id === activeNoteId) return item
      if (item.children) {
        const found = getActiveNote(item.children)
        if (found) return found
      }
    }
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      // Optionally, you can redirect the user or update the UI state here
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePersonClick = async (id: string, person: string) => {
    setIsOutputLoading(true);
    setOutputError(null);
    setSelectedPerson(null);
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const userRef = doc(db, 'users', user.uid);
      const historyDocRef = doc(collection(userRef, 'History'), id);
      const docSnap = await getDoc(historyDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedPerson({ person, output: data.output });
      } else {
        setOutputError("No data found for this search.");
      }
    } catch (error) {
      console.error("Error fetching output:", error);
      setOutputError("Failed to load output. Please try again later.");
    } finally {
      setIsOutputLoading(false);
    }
  };

  const goToPreviousMonth = () => setCurrentDate(prevDate => subMonths(prevDate, 1));
  const goToNextMonth = () => setCurrentDate(prevDate => addMonths(prevDate, 1));

  // This handleDateClick function is already defined below, so we'll remove it here

  const handleNoteSubmit = async () => {
    if (!selectedDate || !user || !noteInput.trim()) {
      console.log("Missing required data for saving note");
      return;
    }

    const calendarRef = collection(db, 'users', user.uid, 'Calendar');
    
    try {
      const newNote = {
        Date: format(selectedDate, 'yyyy-MM-dd'),
        Note: noteInput.trim(),
        timestamp: serverTimestamp()
      };

      if (selectedNoteId) {
        // Update existing note
        await setDoc(doc(calendarRef, selectedNoteId), newNote);
        setCalendarNotes(prevNotes => prevNotes.map(note => 
          note.id === selectedNoteId ? { ...note, content: noteInput.trim(), date: format(selectedDate, 'yyyy-MM-dd') } : note
        ));
      } else {
        // Add new note
        const docRef = await addDoc(calendarRef, newNote);
        setCalendarNotes(prevNotes => [...prevNotes, { id: docRef.id, date: format(selectedDate, 'yyyy-MM-dd'), content: noteInput.trim() }]);
      }
      
      setNoteInput('');
      setSelectedDate(null);
      setSelectedNoteId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving calendar note:", error);
    }
  };

  const handleDeleteNote = async () => {
    if (!user || !selectedNoteId) return;

    try {
      const calendarRef = collection(db, 'users', user.uid, 'Calendar');
      await deleteDoc(doc(calendarRef, selectedNoteId));
      setCalendarNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteId));
      setNoteInput('');
      setSelectedDate(null);
      setSelectedNoteId(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting calendar note:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    
    if (confirmDelete) {
      try {
        // Delete user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        await deleteDoc(userRef);

        // Delete user authentication account
        await user.delete();

        // Sign out the user
        await signOut(auth);

        console.log("Account deleted successfully");
        // Optionally, you can redirect the user to a confirmation page or the home page
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("An error occurred while deleting your account. Please try again.");
      }
    }
  };

  const getUpcomingEvents = (notes: CalendarNote[], limit: number = 3): CalendarNote[] => {
    const today = new Date()
    return notes
      .filter(note => new Date(note.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Home':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-10">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <FiClock className="mr-3 text-purple-200" /> Recent Searches
                </h3>
                <ul className="space-y-4">
                  {recentSearches.map((search, index) => (
                    <li key={index} className="text-purple-100 hover:text-white transition-colors duration-200 cursor-pointer">
                      <span className="font-bold">{search.person}</span> - <span className="text-sm opacity-75">{search.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <FiCalendar className="mr-3 text-pink-200" /> Upcoming Events
                </h3>
                <ul className="space-y-4">
                  {getUpcomingEvents(calendarNotes).map((event, index) => (
                    <li key={index} className="text-pink-100">
                      <span className="text-white font-semibold">{format(new Date(event.date), 'MMM d, yyyy')}</span> - {event.content}
                    </li>
                  ))}
                  {getUpcomingEvents(calendarNotes).length === 0 && (
                    <li className="text-pink-100">No upcoming events</li>
                  )}
                </ul>
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-shadow duration-300 md:col-span-2"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <FiBarChart2 className="mr-3 text-blue-200" /> Quick Stats
                </h3>
                <div className="flex items-center justify-center h-40">
                  <p className="text-xl text-blue-100 text-center italic">
                    Coming Soon: Detailed analytics and insights for your podcast!
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )
      case 'Research':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Premium Research</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Unlock the power of AI-driven guest insights</p>
            </div>

            <form onSubmit={handleSearch} className="mb-12">
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="w-full px-8 py-6 rounded-full border-2 border-purple-300 dark:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white pr-20 text-xl transition-all duration-300 ease-in-out shadow-lg"
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(167, 139, 250, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSearch size={28} />
                </motion.button>
              </div>
            </form>

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center my-12"
                >
                  <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </motion.div>
              )}

              {webhookResponse && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-3xl p-10 shadow-2xl"
                >
                  <h3 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center">
                    <FiUser className="mr-4" size={32} /> {lastSearchedName}
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-inner">
                    <pre className="text-gray-800 dark:text-gray-200 text-lg whitespace-pre-wrap font-sans leading-relaxed">
                      {webhookResponse}
                    </pre>
                  </div>
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(167, 139, 250, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full flex items-center justify-center shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-lg font-semibold"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookResponse)
                          .then(() => setCopySuccess('Copied!'))
                          .catch(() => setCopySuccess('Failed to copy'));
                        setTimeout(() => setCopySuccess(''), 2000);
                      }}
                    >
                      <FiCopy className="mr-3" size={20} /> {copySuccess || 'Copy to Clipboard'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!webhookResponse && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-16 text-center"
              >
                <h4 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Searches</h4>
                <div className="flex justify-center space-x-4">
                  {recentSearches.map((search, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(167, 139, 250, 0.3)" }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
                    >
                      <p className="text-lg font-medium text-purple-600 dark:text-purple-400">{search.person}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{search.timestamp}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )
      case 'History':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 h-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">Search History</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[calc(100%-8rem)]">
              <div className="p-8 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">Recent Searches</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Clear History
                  </motion.button>
                </div>
              </div>
              
              <div className="flex-grow overflow-hidden">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : historyError ? (
                  <p className="text-red-500 text-center text-lg p-8">{historyError}</p>
                ) : (
                  <div className="overflow-y-auto h-full px-8 pb-8">
                    <div className="space-y-4">
                      {searchHistory.map((search, index) => (
                        <motion.div 
                          key={index} 
                          className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                        >
                          <button 
                            onClick={() => handlePersonClick(search.id, search.person)}
                            className="w-full text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-xl text-gray-800 dark:text-gray-200 font-semibold">
                                <FiUser className="mr-3 text-purple-500 group-hover:text-pink-500 transition-colors duration-200" size={24} />
                                <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                                  {search.person}
                                </span>
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FiClock className="mr-2" size={16} />
                                {search.timestamp}
                              </span>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Transition appear show={!!selectedPerson} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={() => setSelectedPerson(null)}
              >
                <div className="min-h-screen px-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                  </Transition.Child>

                  <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <div className="inline-block w-full max-w-2xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-3xl">
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-bold leading-6 text-gray-900 dark:text-gray-100 mb-6 flex items-center"
                      >
                        <FiUser className="mr-3 text-purple-500" size={28} />
                        {selectedPerson?.person}
                      </Dialog.Title>
                      <div className="mt-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6 shadow-inner">
                          <pre className="text-gray-800 dark:text-gray-200 text-lg whitespace-pre-wrap font-sans">
                            {selectedPerson?.output}
                          </pre>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-200 flex items-center"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedPerson?.output || '')
                              .then(() => setCopySuccess('Copied!'))
                              .catch(() => setCopySuccess('Failed to copy'));
                            setTimeout(() => setCopySuccess(''), 2000);
                          }}
                        >
                          <FiCopy className="mr-2" /> {copySuccess || 'Copy'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 text-base font-medium text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200 border border-transparent rounded-full shadow-lg transition-all duration-200"
                          onClick={() => setSelectedPerson(null)}
                        >
                          Close
                        </motion.button>
                      </div>
                    </div>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          </motion.div>
        )
      case 'Notes':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <div className="flex bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden h-[calc(100vh-100px)]">
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Folders & Pages</h3>
                  <motion.button
                    onClick={() => addNoteItem('folder')}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Add folder"
                  >
                    <FiPlus size={24} />
                  </motion.button>
                </div>
                <div className="space-y-4 overflow-y-auto flex-grow pr-4">
                  {renderNoteTree(notes)}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                {activeNoteId ? (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {getActiveNote(notes)?.name}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => {/* Implement save functionality */}}
                      >
                        Save Changes
                      </motion.button>
                    </div>
                    <textarea
                      value={getActiveNote(notes)?.content || ''}
                      onChange={(e) => updateNoteContent(activeNoteId, e.target.value)}
                      placeholder="Type your notes here..."
                      className="w-full flex-grow p-6 text-lg border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none transition-all duration-300 ease-in-out"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-2xl text-gray-400 dark:text-gray-500 italic">Select a page to start editing</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      case 'Settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col"
          >
            <h2 className="text-4xl font-bold text-center text-purple-600 dark:text-purple-400 mb-8">Settings</h2>
            <div className="flex-grow bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="h-full overflow-auto px-8 py-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Account Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Email</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Appearance</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Dark Mode</span>
                    <Switch
                      checked={isDarkMode}
                      onChange={setIsDarkMode}
                      className={`${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">Toggle dark mode</span>
                      <span
                        className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Email Notifications</span>
                    <Switch
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                      className={`${emailNotifications ? 'bg-purple-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">Enable email notifications</span>
                      <span
                        className={`${emailNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Account Actions</h3>
                  <div className="flex space-x-6">
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(144, 97, 249, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center justify-center">
                        <FiLogOut className="mr-3" size={20} />
                        <span>Log Out</span>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
                      onClick={handleDeleteAccount}
                    >
                      <div className="flex items-center justify-center">
                        <FiTrash2 className="mr-3" size={20} />
                        <span>Delete Account</span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 'Calendar':
        const today = new Date();

        const handleDateClick = (date: Date) => {
          setSelectedDate(date);
          const existingNote = calendarNotes.find(note => note.date === format(date, 'yyyy-MM-dd'));
          if (existingNote) {
            setNoteInput(existingNote.content);
            setSelectedNoteId(existingNote.id);
          } else {
            setNoteInput('');
            setSelectedNoteId(null);
          }
          setIsModalOpen(true);
        };

        const handleNoteSubmit = () => {
          if (selectedDate) {
            if (selectedNoteId) {
              // Edit existing note
              setCalendarNotes(prevNotes =>
                prevNotes.map(note =>
                  note.id === selectedNoteId ? { ...note, content: noteInput } : note
                )
              );
            } else {
              // Add new note
              const newNote = {
                id: Date.now().toString(),
                date: format(selectedDate, 'yyyy-MM-dd'),
                content: noteInput
              };
              setCalendarNotes(prevNotes => [...prevNotes, newNote]);
            }
            setIsModalOpen(false);
            setNoteInput('');
            setSelectedNoteId(null);
          }
        };

        const handleDeleteNote = () => {
          if (selectedNoteId) {
            setCalendarNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteId));
            setIsModalOpen(false);
            setNoteInput('');
            setSelectedNoteId(null);
          }
        };

        return (
          <div className="h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors duration-200"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors duration-200"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                {eachDayOfInterval({
                  start: startOfMonth(currentDate),
                  end: endOfMonth(currentDate)
                }).map((date, index) => {
                  const isPastDate = date < today && !isSameDay(date, today);
                  return (
                    <button
                      key={index}
                      onClick={() => !isPastDate && handleDateClick(date)}
                      disabled={isPastDate}
                      className={`p-4 rounded-xl text-center ${
                        isPastDate
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : isSameMonth(date, currentDate)
                          ? 'bg-purple-50 dark:bg-purple-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      } ${
                        isSameDay(date, today)
                          ? 'border-2 border-purple-500 dark:border-purple-400'
                          : ''
                      } hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors duration-200`}
                    >
                      <span className="text-lg font-medium">{format(date, 'd')}</span>
                      {calendarNotes.some(note => note.date === format(date, 'yyyy-MM-dd')) && (
                        <div className="mt-1 w-2 h-2 bg-pink-500 rounded-full mx-auto"></div>
                      )}
                    </button>
                  )
                })}
                </div>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Add Note'}
                  </h3>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Enter your note here..."
                    className="w-full h-40 p-4 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none transition-all duration-300 ease-in-out mb-4"
                  />
                  <div className="flex justify-end space-x-4">
                    {selectedNoteId && (
                      <button
                        onClick={handleDeleteNote}
                        className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete Note
                      </button>
                    )}
                    <button
                      onClick={handleNoteSubmit}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      {selectedNoteId ? 'Update Note' : 'Add Note'}
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
                </div>
        )
      default:
        return null
    }
  }

  const updateNoteTree = (
    items: NoteItem[],
    id: string,
    updateFn: (item: NoteItem) => NoteItem
  ): NoteItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return updateFn(item)
      }
      if (item.children) {
        return { ...item, children: updateNoteTree(item.children, id, updateFn) }
      }
      return item
    })
  }

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <AuthPage onGoBack={() => {}} />;
  }

        return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Background />
      {/* Sidebar */}
          <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-20 bg-gradient-to-b from-purple-900 via-indigo-900 to-purple-900 shadow-xl z-20 flex-shrink-0 border-r border-purple-700"
      >
        <div className="p-4 h-full flex flex-col items-center">
          <motion.h1
            className="text-3xl font-bold mb-12 tracking-tight"
            animate={controls}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              AI
            </span>
          </motion.h1>
          <nav className="flex-grow">
            <ul className="space-y-8">
              {(['Home', 'Research', 'History', 'Calendar', 'Notes'] as Section[]).map((section) => (
                <motion.li key={section} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setActiveSection(section)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center group relative ${
                      activeSection === section
                        ? 'bg-white bg-opacity-20 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                    } transition-all duration-200`}
                  >
                    {section === 'Home' && <FiHome size={22} />}
                    {section === 'Research' && <FiBookOpen size={22} />}
                    {section === 'History' && <FiClock size={22} />}
                    {section === 'Calendar' && <FiCalendar size={22} />}
                    {section === 'Notes' && <FiEdit3 size={22} />}
                    <span className="absolute left-full ml-4 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {section}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>
          <motion.div className="mt-auto" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <button 
              onClick={() => setActiveSection('Settings')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center group relative ${
                activeSection === 'Settings'
                  ? 'bg-white bg-opacity-20 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              } transition-all duration-200`}
            >
              <FiSettings size={22} />
              <span className="absolute left-full ml-4 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Settings
                                </span>
                          </button>
                        </motion.div>
                    </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 h-full flex flex-col"
          >
            {renderContent()}
          </motion.div>
                  </div>
              </div>
            </div>
  )
}

export default PremiumPodcastAssistant;



