import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, X, Users, FileText, Settings, Save, Clock, MessageSquare, ChevronDown, ChevronUp, Mic, MicOff, Video, VideoOff, Bot, Loader, Calendar, FolderOpen, ChevronLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';

const AIHub = () => {
  const { state, updateConversations, updateDocuments } = useAppState();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeAdvisors, setActiveAdvisors] = useState([]);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [documentPanelCollapsed, setDocumentPanelCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingStartTime, setMeetingStartTime] = useState(null);

  // First check for environment variable, then fall back to localStorage
  const getInitialApiKey = () => {
    // Check for Vercel environment variable first
    const envKey = process.env.REACT_APP_CLAUDE_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return envKey;
    }
    // Fall back to localStorage
    return localStorage.getItem('claudeApiKey') || '';
  };

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('aiHubSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          ...parsed,
          apiKey: getInitialApiKey() // Use the function to get API key
        };
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    return {
      apiKey: getInitialApiKey(), // Use the function to get API key
      interactionMode: 'orchestrated',
      defaultAdvisors: [],
      autoSave: true,
      maxStoredMeetings: 50,
      useLastAdvisors: true,
      includeHost: true
    };
  });

  // Check if API key is set (from environment or localStorage)
  const isUsingEnvKey = process.env.REACT_APP_CLAUDE_API_KEY && process.env.REACT_APP_CLAUDE_API_KEY.trim() !== '';
  const hasApiKey = (settings.apiKey && settings.apiKey.trim() !== '') || isUsingEnvKey;
  const showApiKeyBar = !hasApiKey;

  // When making API calls, use this function to get the API key
  const getApiKey = () => {
    // Always prefer environment variable if available
    const envKey = process.env.REACT_APP_CLAUDE_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return envKey;
    }
    // Fall back to settings/localStorage
    return settings.apiKey;
  };

  useEffect(() => {
    // Set up initial advisors
    if (state.selectedAdvisors && state.selectedAdvisors.length > 0 && activeAdvisors.length === 0) {
      if (settings.includeHost) {
        const host = state.selectedAdvisors.find(adv => adv.isHost);
        if (host) {
          setActiveAdvisors([host]);
        } else {
          setActiveAdvisors([state.selectedAdvisors[0]]);
        }
      } else {
        // If not including host, select first non-host advisor
        const nonHostAdvisors = state.selectedAdvisors.filter(adv => !adv.isHost);
        if (nonHostAdvisors.length > 0) {
          setActiveAdvisors([nonHostAdvisors[0]]);
        }
      }
    }

    // Show document panel if we have analyzed documents
    if (state.documents && state.documents.filter(doc => doc.analysis).length > 0) {
      setShowDocumentPanel(true);
    }
  }, [state.selectedAdvisors, state.documents, activeAdvisors.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const validateApiKey = (key) => {
    if (!key || !key.trim()) {
      return 'API key is required';
    }
    if (!key.startsWith('sk-ant-')) {
      return 'API key should start with "sk-ant-"';
    }
    return '';
  };

  const saveApiKey = () => {
    const keyToSave = tempApiKey;
    const error = validateApiKey(keyToSave);
    
    if (error) {
      setApiKeyError(error);
      return;
    }

    // Save to localStorage
    localStorage.setItem('claudeApiKey', keyToSave);
    const newSettings = {
      ...settings,
      apiKey: keyToSave
    };
    localStorage.setItem('aiHubSettings', JSON.stringify(newSettings));
    
    // Update state
    setSettings(newSettings);
    setTempApiKey('');
    setApiKeySaved(true);
    setApiKeyError('');
    
    // Clear success message after 3 seconds
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const clearApiKey = () => {
    localStorage.removeItem('claudeApiKey');
    const newSettings = {
      ...settings,
      apiKey: ''
    };
    localStorage.setItem('aiHubSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    setTempApiKey('');
    setApiKeyError('');
  };

  const startMeeting = async () => {
    setMeetingStarted(true);
    setMeetingStartTime(new Date());
    
    // Check if we should include host
    if (!settings.includeHost) {
      // Meeting starts without host greeting
      return;
    }
    
    // Find the host advisor
    const host = activeAdvisors.find(adv => adv.isHost);
    if (!host) return;

    const apiKey = getApiKey();
    
    if (apiKey) {
      try {
        const meetingInfo = {
          attendees: activeAdvisors.map(a => a.name).join(', '),
          documentsAvailable: state.documents.filter(doc => doc.analysis).length,
          time: new Date().toLocaleTimeString()
        };

        const hostGreeting = `You are ${host.name}, a highly trained AI Board Facilitator with expertise in Robert's Rules of Order, behavioral economics, and advanced facilitation techniques.
        
        Meeting attendees: ${meetingInfo.attendees}
        Documents available: ${meetingInfo.documentsAvailable}
        Meeting start time: ${meetingInfo.time}
        
        Your role is to:
        1. Warmly welcome everyone and establish psychological safety
        2. Briefly introduce attendees and their expertise (if multiple)
        3. Use open-ended Socratic questions to uncover true objectives
        4. Propose a structured agenda using time-boxing techniques
        5. Set ground rules for productive discussion (e.g., "yes, and" thinking)
        6. Mention you'll use techniques like Devil's Advocate or Six Thinking Hats if needed
        7. Commit to tracking SMART action items and providing a PREP summary
        
        Be warm yet professional. Use a behavioral nudge to encourage participation. Keep it concise but set the stage for a highly productive session.`;

        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: hostGreeting
              },
              {
                role: 'user',
                content: 'Please start the meeting.'
              }
            ],
            apiKey: apiKey.trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.content && data.content.length > 0) {
            const hostMessage = {
              id: `msg-${Date.now()}-host-welcome`,
              type: 'advisor',
              advisorId: host.id,
              advisorName: host.name,
              advisorRole: host.role,
              advisorAvatar: host.avatar,
              content: data.content[0].text,
              timestamp: new Date().toISOString(),
              isHostMessage: true
            };
            setMessages([hostMessage]);
          }
        }
      } catch (error) {
        console.error('Error starting meeting:', error);
      }
    } else {
      // Simulated host greeting when no API key
      const hostMessage = {
        id: `msg-${Date.now()}-host-welcome`,
        type: 'advisor',
        advisorId: host.id,
        advisorName: host.name,
        advisorRole: host.role,
        advisorAvatar: host.avatar,
        content: `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} everyone! Welcome to today's AI Board Advisory meeting.

I'm ${host.name}, your meeting facilitator, and I'm here to ensure we have a productive and focused session. ${activeAdvisors.length > 1 ? `Joining us today are ${activeAdvisors.filter(a => !a.isHost).map(a => `${a.name} (${a.role})`).join(', ')}.` : ''}

Before we begin, could you please share:
• What are your primary objectives for today's meeting?
• Any specific challenges or opportunities you'd like to discuss?
• Are there particular documents you'd like us to review?

I'll be tracking our discussion points, action items, and key decisions throughout the meeting. At the end, I'll provide a comprehensive summary with clear next steps.

How would you like to start?`,
        timestamp: new Date().toISOString(),
        isHostMessage: true
      };
      setMessages([hostMessage]);
    }
  };

  const endMeeting = async () => {
    if (!meetingStarted) return;
    
    const host = activeAdvisors.find(adv => adv.isHost);
    if (!host) return;

    const apiKey = getApiKey();
    
    if (apiKey && messages.length > 1) {
      try {
        // Prepare meeting context for summary
        const meetingDuration = Math.round((new Date() - meetingStartTime) / 1000 / 60);
        const conversationHistory = messages.map(msg => 
          `${msg.type === 'user' ? 'User' : msg.advisorName}: ${msg.content}`
        ).join('\n\n');

        const summaryPrompt = `You are ${host.name}, the AI Board Facilitator. The meeting is ending.
        
        Meeting duration: ${meetingDuration} minutes
        Attendees: ${activeAdvisors.map(a => a.name).join(', ')}
        
        Conversation history:
        ${conversationHistory}
        
        Please provide:
        1. A brief meeting summary (2-3 sentences)
        2. Key decisions made
        3. Action items with suggested owners and timelines
        4. Recommended follow-up topics for next meeting
        5. A warm closing statement
        
        Keep it concise but comprehensive.`;

        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: summaryPrompt
              },
              {
                role: 'user',
                content: 'Please provide the meeting summary and close the meeting.'
              }
            ],
            apiKey: apiKey.trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.content && data.content.length > 0) {
            const summaryMessage = {
              id: `msg-${Date.now()}-host-summary`,
              type: 'advisor',
              advisorId: host.id,
              advisorName: host.name,
              advisorRole: host.role,
              advisorAvatar: host.avatar,
              content: data.content[0].text,
              timestamp: new Date().toISOString(),
              isHostMessage: true,
              isSummary: true
            };
            setMessages(prev => [...prev, summaryMessage]);
          }
        }
      } catch (error) {
        console.error('Error ending meeting:', error);
      }
    }
    
    // Update meeting state
    const meetingRecord = {
      id: `meeting-${Date.now()}`,
      startTime: meetingStartTime,
      endTime: new Date(),
      messages: messages,
      advisors: activeAdvisors,
      documents: state.documents.filter(doc => doc.analysis)
    };
    
    updateConversations([...state.activeConversations, meetingRecord]);
    setMeetingStarted(false);
    setMeetingStartTime(null);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || activeAdvisors.length === 0) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    const apiKey = getApiKey(); // Use the getApiKey function

    if (apiKey) {
      try {
        // Get relevant documents context
        const relevantDocs = state.documents
          .filter(doc => doc.analysis)
          .map(doc => ({
            name: doc.name,
            summary: doc.analysis.summary,
            keyInsights: doc.analysis.keyInsights
          }));

        for (const advisor of activeAdvisors) {
          const systemPrompt = `You are ${advisor.name}, a ${advisor.role}. ${advisor.experience || ''}
          
          ${advisor.customPrompt || ''}
          
          Available documents for reference:
          ${relevantDocs.map(doc => `- ${doc.name}: ${doc.summary}`).join('\n')}`;

          const messages = [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: inputMessage
            }
          ];

          const response = await fetch('/api/claude', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: messages,
              apiKey: apiKey.trim() // Use the apiKey from getApiKey()
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || 'API request failed');
          }

          const data = await response.json();
          
          if (data && data.content && data.content.length > 0) {
            const advisorMessage = {
              id: `msg-${Date.now()}-${advisor.id}`,
              type: 'advisor',
              advisorId: advisor.id,
              advisorName: advisor.name,
              advisorRole: advisor.role,
              advisorAvatar: advisor.avatar,
              content: data.content[0].text,
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, advisorMessage]);
          }
        }
      } catch (error) {
        console.error('API Error:', error);
        const errorMessage = {
          id: `msg-${Date.now()}-error`,
          type: 'system',
          content: `Error: ${error.message}. Please check your API key in settings.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Simulated response when no API key
      for (const advisor of activeAdvisors) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = {
          id: `msg-${Date.now()}-${advisor.id}`,
          type: 'advisor',
          advisorId: advisor.id,
          advisorName: advisor.name,
          advisorRole: advisor.role,
          advisorAvatar: advisor.avatar,
          content: `As your ${advisor.role}, I believe the key consideration here is strategic alignment. ${advisor.personality?.approach || ''} suggests focusing on measurable outcomes. [Note: This is a simulated response. Please add your Claude API key above to get real AI responses.]`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, response]);
      }
    }

    setIsProcessing(false);
  };

  const toggleAdvisor = (advisor) => {
    if (activeAdvisors.find(a => a.id === advisor.id)) {
      setActiveAdvisors(prev => prev.filter(a => a.id !== advisor.id));
    } else {
      setActiveAdvisors(prev => [...prev, advisor]);
    }
  };

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    const supportedFileTypes = {
      'application/pdf': { ext: 'pdf', icon: '📄', color: 'red' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', icon: '📝', color: 'blue' },
      'text/plain': { ext: 'txt', icon: '📃', color: 'gray' },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', icon: '📊', color: 'green' },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', icon: '📽️', color: 'orange' }
    };
    
    for (const file of files) {
      if (!Object.keys(supportedFileTypes).includes(file.type)) {
        alert(`File type not supported: ${file.name}`);
        continue;
      }
      
      if (file.size > 20 * 1024 * 1024) {
        alert(`File too large: ${file.name} (max 20MB)`);
        continue;
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const newDocument = {
          id: docId,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          content: e.target.result,
          analyzed: true, // Mark as analyzed for immediate use
          fileType: supportedFileTypes[file.type],
          analysis: {
            summary: `Document "${file.name}" uploaded and ready for AI analysis.`,
            keyPoints: [
              'Document available for reference',
              'Ready for AI-powered insights',
              'Can be used in advisory discussions'
            ],
            sentiment: 'neutral',
            relevanceScore: 0.85,
            keyInsights: ['Uploaded via AI Hub', 'Ready for analysis']
          }
        };

        const updatedDocs = [...(state.documents || []), newDocument];
        updateDocuments(updatedDocs);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentDelete = (docId) => {
    const updatedDocs = state.documents.filter(doc => doc.id !== docId);
    updateDocuments(updatedDocs);
  };

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI Boardroom Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claude API Key
              </label>
              {isUsingEnvKey && (
                <p className="text-xs text-green-600 mb-2">
                  ✓ Using API key from environment variables
                </p>
              )}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={isUsingEnvKey ? '••••••••••••••••' : settings.apiKey}
                    onChange={(e) => !isUsingEnvKey && setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    disabled={isUsingEnvKey}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    disabled={isUsingEnvKey}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isUsingEnvKey && (
                  <button
                    onClick={() => {
                      localStorage.setItem('aiHubSettings', JSON.stringify(settings));
                      saveApiKey();
                      setShowSettings(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                )}
              </div>
              {!isUsingEnvKey && settings.apiKey && (
                <button
                  onClick={clearApiKey}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Clear API Key
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interaction Mode
              </label>
              <select
                value={settings.interactionMode}
                onChange={(e) => setSettings({ ...settings, interactionMode: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="orchestrated">Orchestrated (Advisors interact)</option>
                <option value="individual">Individual (Direct responses only)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-save conversations</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.useLastAdvisors}
                  onChange={(e) => setSettings({ ...settings, useLastAdvisors: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Remember last used advisors</span>
              </label>
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.includeHost}
                  onChange={(e) => setSettings({ ...settings, includeHost: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include Meeting Host when starting meetings</span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                When enabled, the AI Meeting Host will facilitate your sessions with professional meeting management techniques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* API Key Bar */}
        {showApiKeyBar && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-800">
                Add your Claude API key to enable AI responses:
              </span>
              <div className="flex-1 max-w-md relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => {
                    setTempApiKey(e.target.value);
                    setApiKeyError('');
                  }}
                  placeholder="sk-ant-..."
                  className={`w-full px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 ${
                    apiKeyError ? 'border-red-300 focus:ring-red-400' : 'border-amber-300 focus:ring-amber-400'
                  }`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1.5 text-amber-600 hover:text-amber-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={saveApiKey}
                className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
              >
                Save
              </button>
            </div>
            {apiKeyError && (
              <p className="text-xs text-red-600 mt-1 ml-8">{apiKeyError}</p>
            )}
          </div>
        )}

        {/* Success message */}
        {apiKeySaved && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-2">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Check className="w-4 h-4" />
              API key saved successfully!
            </div>
          </div>
        )}

        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Boardroom</h2>
              <p className="text-sm text-gray-600">
                {meetingStarted ? (
                  <span className="text-green-600">
                    • Meeting in progress ({Math.floor((new Date() - meetingStartTime) / 1000 / 60)} min)
                  </span>
                ) : (
                  'Live advisory session'
                )}
                {hasApiKey && !meetingStarted && <span className="text-green-600 ml-2">• AI enabled</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!meetingStarted ? (
                <button
                  onClick={startMeeting}
                  disabled={activeAdvisors.length === 0 || (settings.includeHost && !activeAdvisors.find(a => a.isHost))}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Start Meeting
                </button>
              ) : (
                <button
                  onClick={endMeeting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <VideoOff className="w-4 h-4" />
                  End Meeting
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowDocumentPanel(!showDocumentPanel)}
              className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Documents</h3>
                  <p className="text-2xl font-bold text-blue-600">{state.documents.filter(doc => doc.analysis).length}</p>
                  <p className="text-xs text-blue-600 mt-0.5">Available for AI</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </button>
            
            <button
              onClick={() => setShowAdvisorPanel(!showAdvisorPanel)}
              className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-purple-900">Advisors</h3>
                  <p className="text-2xl font-bold text-purple-600">{activeAdvisors.length}</p>
                  <p className="text-xs text-purple-600 mt-0.5">Active in meeting</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {!meetingStarted ? 'Ready to begin your advisory session' : 'Meeting started'}
              </p>
              <p className="text-sm mt-2">
                {activeAdvisors.length === 0 
                  ? 'Select advisors from the panel to begin'
                  : !meetingStarted 
                    ? settings.includeHost ? 'Click "Start Meeting" to begin with your host' : 'Click "Start Meeting" to begin'
                    : settings.includeHost ? 'Your host is preparing to welcome you...' : 'Meeting started - begin your discussion'}
              </p>
              {!hasApiKey && (
                <p className="text-xs text-amber-600 mt-4">
                  Add your API key above for real AI responses
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'system' ? (
                    <div className="max-w-[70%] bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-800">{msg.content}</p>
                      </div>
                    </div>
                  ) : msg.type === 'user' ? (
                    <div className="max-w-[70%] bg-blue-600 text-white rounded-lg px-4 py-3">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[70%] flex gap-3">
                      <span className="text-2xl">{msg.advisorAvatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{msg.advisorName}</p>
                          {msg.isHostMessage && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Host</span>
                          )}
                          {msg.isSummary && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Summary</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{msg.advisorRole}</p>
                        <div className={`${msg.isHostMessage ? 'bg-blue-50 border-blue-200' : 'bg-white border'} ${msg.isSummary ? 'bg-green-50 border-green-200' : ''} rounded-lg px-4 py-3 mt-1`}>
                          {msg.content.split('\n').map((line, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="bg-white border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                activeAdvisors.length === 0 
                  ? "Select advisors to start chatting..." 
                  : !meetingStarted
                    ? "Start the meeting to begin..."
                    : "Ask your advisors..."
              }
              disabled={activeAdvisors.length === 0 || !meetingStarted}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing || activeAdvisors.length === 0 || !meetingStarted}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {showAdvisorPanel && (
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Select Advisors</h3>
              <button
                onClick={() => setShowAdvisorPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {(!state.selectedAdvisors || state.selectedAdvisors.length === 0) ? (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No advisors selected</p>
                <p className="text-xs mt-1">Go to Advisory Hub to add advisors</p>
                <button
                  onClick={() => {
                    // This would normally navigate to Advisory Hub
                    // For now, we'll just show a message
                    alert('Please go to Advisory Hub from the sidebar to select advisors');
                  }}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  Select Advisors
                </button>
              </div>
            ) : (
              state.selectedAdvisors
                .filter(advisor => settings.includeHost || !advisor.isHost)
                .map((advisor) => (
                <div
                  key={advisor.id}
                  onClick={() => toggleAdvisor(advisor)}
                  className={`p-3 mb-2 border rounded-lg cursor-pointer transition-all ${
                    activeAdvisors.find(a => a.id === advisor.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{advisor.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium">{advisor.name}</p>
                      <p className="text-sm text-gray-600">{advisor.role}</p>
                    </div>
                    {activeAdvisors.find(a => a.id === advisor.id) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showDocumentPanel && (
        <div className={`${documentPanelCollapsed ? 'w-16' : 'w-80'} bg-white border-l transition-all duration-300`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!documentPanelCollapsed && (
                <h3 className="font-semibold text-gray-900">Available Documents</h3>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocumentPanelCollapsed(!documentPanelCollapsed)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={documentPanelCollapsed ? "Expand" : "Collapse"}
                >
                  {documentPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {!documentPanelCollapsed && (
                  <button
                    onClick={() => setShowDocumentPanel(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {!documentPanelCollapsed && (
            <div className="p-4 overflow-y-auto">
              {/* Upload button */}
              <label className="mb-4 w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Upload Document</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.xlsx,.pptx"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </label>

              {state.documents.filter(doc => doc.analysis).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No analyzed documents</p>
                  <p className="text-xs mt-1">Upload documents to analyze</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.documents.filter(doc => doc.analysis).map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg hover:bg-gray-50 relative group">
                      <button
                        onClick={() => handleDocumentDelete(doc.id)}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                        title="Remove document"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{doc.fileType.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Relevance: {Math.round(doc.analysis.relevanceScore * 100)}%
                          </p>
                          {doc.analysis.keyInsights && (
                            <p className="text-xs text-gray-600 mt-1">
                              {doc.analysis.keyInsights.length} key insights
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showSettings && <SettingsModal />}
    </div>
  );
};

export default AIHub;