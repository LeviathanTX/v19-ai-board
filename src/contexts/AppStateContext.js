import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

// Default advisors to ensure they're always available
const DEFAULT_ADVISORS = [
  {
    id: 'meeting-host',
    name: 'Meeting Host',
    role: 'AI Board Facilitator',
    avatar: '🤖',
    isHost: true,
    experience: 'Expert facilitator trained in Robert\'s Rules, behavioral economics, and modern brainstorming techniques',
    expertise: ['Meeting Facilitation', 'Robert\'s Rules of Order', 'Behavioral Economics', 'Design Thinking', 'Brainstorming', 'Action Planning'],
    personality: {
      traits: ['Professional', 'Organized', 'Neutral', 'Strategic', 'Empathetic'],
      approach: 'Structured facilitation with behavioral insights',
      tone: 'Professional, warm, and encouraging'
    },
    customPrompt: `You are the Meeting Host, a highly trained AI Board Facilitator with expertise in:
    - Robert's Rules of Order for structured decision-making
    - Behavioral economics techniques (anchoring, framing, nudging)
    - Design thinking and creative brainstorming methods (SCAMPER, Six Thinking Hats)
    - Socratic questioning and active listening
    - Conflict resolution and consensus building
    - Time management and meeting productivity
    
    Your role is to:
    1. Open meetings with clear objectives and time allocations
    2. Use behavioral nudges to encourage participation and reduce groupthink
    3. Apply structured decision frameworks when appropriate
    4. Facilitate brainstorming using proven methodologies
    5. Ensure psychological safety for all participants
    6. Track action items with SMART goals
    7. Summarize using the PREP method (Point, Reason, Example, Point)
    
    Be warm yet professional, structured yet flexible, and always focused on extracting maximum value from every meeting.`,
    specialtyDocuments: [],
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    }
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'CEO Coach',
    avatar: '👩‍💼',
    experience: '20+ years experience in executive leadership and scaling startups',
    expertise: ['Leadership', 'Strategy', 'Fundraising', 'Culture'],
    personality: {
      traits: ['Direct', 'Strategic', 'Empathetic'],
      approach: 'Socratic questioning',
      tone: 'Direct and inspirational'
    },
    customPrompt: 'You are a seasoned CEO coach with extensive experience leading Fortune 500 companies.',
    specialtyDocuments: [],
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    }
  },
  {
    id: 'michael-thompson',
    name: 'Michael Thompson',
    role: 'Chief Financial Officer',
    avatar: '📊',
    experience: 'Former CFO at three unicorn startups, expert in financial modeling',
    expertise: ['Financial Strategy', 'Fundraising', 'M&A', 'Risk Management'],
    personality: {
      traits: ['Analytical', 'Detail-oriented', 'Conservative'],
      approach: 'Data-driven analysis',
      tone: 'Analytical and precise'
    },
    customPrompt: 'You are an experienced CFO who has guided multiple tech companies through rapid growth and IPOs.',
    specialtyDocuments: [],
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    }
  },
  {
    id: 'jessica-rodriguez',
    name: 'Jessica Rodriguez',
    role: 'Chief Marketing Officer',
    avatar: '🎯',
    experience: 'Built and scaled marketing teams at Fortune 500 and high-growth startups',
    expertise: ['Brand Strategy', 'Growth Marketing', 'Content', 'Analytics'],
    personality: {
      traits: ['Creative', 'Data-savvy', 'Trend-aware'],
      approach: 'Customer-centric strategy',
      tone: 'Creative and enthusiastic'
    },
    customPrompt: 'You are a growth-focused CMO who has built marketing engines for multiple successful startups.',
    specialtyDocuments: [],
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    }
  }
];

// IndexedDB setup for document storage
const DB_NAME = 'AIBoardDocuments';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveDocumentToDB = async (document) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.put(document);
  } catch (error) {
    console.error('Error saving document to IndexedDB:', error);
  }
};

const getDocumentFromDB = async (docId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(docId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting document from IndexedDB:', error);
    return null;
  }
};

const deleteDocumentFromDB = async (docId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.delete(docId);
  } catch (error) {
    console.error('Error deleting document from IndexedDB:', error);
  }
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState(() => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Ensure we have default advisors if none are saved
          if (!parsed.selectedAdvisors || parsed.selectedAdvisors.length === 0) {
            parsed.selectedAdvisors = DEFAULT_ADVISORS;
          } else {
            // Make sure we have the Meeting Host
            const hasHost = parsed.selectedAdvisors.some(adv => adv.isHost);
            if (!hasHost) {
              parsed.selectedAdvisors = [DEFAULT_ADVISORS[0], ...parsed.selectedAdvisors];
            }
          }
          return parsed;
        } catch (e) {
          console.error('Error parsing saved state:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }

    return {
      documents: [],
      selectedAdvisors: DEFAULT_ADVISORS,
      activeConversations: [],
      userProfile: {
        name: 'John Doe',
        email: 'john@example.com',
        subscription: 'Professional'
      }
    };
  });

  // Save state to localStorage whenever it changes (without document content)
  useEffect(() => {
    try {
      const stateToSave = {
        ...state,
        documents: state.documents.map(doc => {
          const { content, ...docWithoutContent } = doc;
          return docWithoutContent;
        })
      };
      
      const serialized = JSON.stringify(stateToSave);
      localStorage.setItem('appState', serialized);
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [state]);

  const updateDocuments = (documents) => {
    setState(prev => ({ ...prev, documents }));
  };

  const addDocument = async (document) => {
    // Save full document to IndexedDB
    await saveDocumentToDB(document);
    
    // Save metadata to state (without content)
    const { content, ...docMetadata } = document;
    setState(prev => ({
      ...prev,
      documents: [...prev.documents, docMetadata]
    }));
  };

  const getDocumentContent = async (docId) => {
    return await getDocumentFromDB(docId);
  };

  const deleteDocument = async (docId) => {
    // Delete from IndexedDB
    await deleteDocumentFromDB(docId);
    
    // Delete from state
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  const updateAdvisors = (advisors) => {
    setState(prev => ({ ...prev, selectedAdvisors: advisors }));
  };

  const updateConversations = (conversations) => {
    setState(prev => ({ ...prev, activeConversations: conversations }));
  };

  const updateUserProfile = (profile) => {
    setState(prev => ({ ...prev, userProfile: profile }));
  };

  const clearAllData = async () => {
    // Clear IndexedDB
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Reset state to defaults
    setState({
      documents: [],
      selectedAdvisors: DEFAULT_ADVISORS,
      activeConversations: [],
      userProfile: {
        name: 'John Doe',
        email: 'john@example.com',
        subscription: 'Professional'
      }
    });
  };

  const value = {
    state,
    updateDocuments,
    addDocument,
    getDocumentContent,
    deleteDocument,
    updateAdvisors,
    updateConversations,
    updateUserProfile,
    clearAllData
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};