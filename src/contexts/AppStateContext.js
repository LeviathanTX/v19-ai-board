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
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Ensure we have default advisors if none are saved
        if (!parsed.selectedAdvisors || parsed.selectedAdvisors.length === 0) {
          parsed.selectedAdvisors = DEFAULT_ADVISORS;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing saved state:', e);
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

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
    updateUserProfile
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};