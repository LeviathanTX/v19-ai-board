import React, { createContext, useContext, useState } from 'react';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [state, setState] = useState({
    documents: [],
    selectedAdvisors: [],
    activeConversations: [],
    userProfile: {
      name: 'John Doe',
      email: 'john@example.com',
      subscription: 'Professional'
    }
  });

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