import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

// Default advisors to ensure they're always available
const DEFAULT_ADVISORS = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'CEO Coach',
    avatar: '👩‍💼',
    isHost: true,
    experience: '20+ years experience in executive leadership and scaling startups',
    expertise: ['Leadership', 'Strategy', 'Fundraising', 'Culture'],
    personality: {
      traits: ['Direct', 'Strategic', 'Empathetic'],
      approach: 'Socratic questioning'
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
      approach: 'Data-driven analysis'
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
      approach: 'Customer-centric strategy'
    }
  }
];

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
      // Clear old localStorage if it's too large
      const currentSize = new Blob([localStorage.getItem('appState') || '']).size;
      if (currentSize > 4 * 1024 * 1024) { // If over 4MB, clear it
        console.log('Clearing localStorage due to size');
        localStorage.removeItem('appState');
      }

      const savedState = localStorage.getItem('appState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Remove document content to save space
          if (parsed.documents) {
            parsed.documents = parsed.documents.map(doc => {
              const { content, ...docWithoutContent } = doc;
              return docWithoutContent;
            });
          }
          // Ensure we have default advisors if none are saved
          if (!parsed.selectedAdvisors || parsed.selectedAdvisors.length === 0) {
            parsed.selectedAdvisors = DEFAULT_ADVISORS;
          }
          return parsed;
        } catch (e) {
          console.error('Error parsing saved state:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      // Clear localStorage if there's an error
      try {
        localStorage.clear();
      } catch (clearError) {
        console.error('Error clearing localStorage:', clearError);
      }
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
      const size = new Blob([serialized]).size;
      
      if (size < 4 * 1024 * 1024) { // Only save if under 4MB
        localStorage.setItem('appState', serialized);
      } else {
        console.warn('State too large to save to localStorage');
      }
    } catch (e) {
      console.error('Error saving state:', e);
      // Try to clear old data and save just the essentials
      try {
        const minimalState = {
          documents: state.documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadDate: doc.uploadDate,
            analyzed: doc.analyzed,
            analysis: doc.analysis,
            fileType: doc.fileType
          })),
          selectedAdvisors: state.selectedAdvisors,
          userProfile: state.userProfile
        };
        localStorage.setItem('appState', JSON.stringify(minimalState));
      } catch (minimalError) {
        console.error('Error saving minimal state:', minimalError);
      }
    }
  }, [state]);

  // Store document content in IndexedDB instead of state
  const storeDocumentContent = async (docId, content) => {
    try {
      // For now, we'll just skip storing content
      // In a production app, you'd use IndexedDB or upload to a server
      console.log('Document content storage skipped for:', docId);
    } catch (e) {
      console.error('Error storing document content:', e);
    }
  };

  const updateDocuments = (documents) => {
    setState(prev => ({ ...prev, documents }));
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

  const value = {
    state,
    updateDocuments,
    updateAdvisors,
    updateConversations,
    updateUserProfile,
    storeDocumentContent
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};