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

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('aiHubSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          ...parsed,
          apiKey: parsed.apiKey || localStorage.getItem('claudeApiKey') || ''
        };
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    return {
      apiKey: localStorage.getItem('claudeApiKey') || '',
      interactionMode: 'orchestrated',
      defaultAdvisors: [],
      autoSave: true,
      maxStoredMeetings: 50,
      useLastAdvisors: true
    };
  });

  // Check if API key is set
  const hasApiKey = settings.apiKey && settings.apiKey.trim() !== '';
  const showApiKeyBar = !hasApiKey;

  useEffect(() => {
    // Set up initial advisors
    if (state.selectedAdvisors && state.selectedAdvisors.length > 0 && activeAdvisors.length === 0) {
      const host = state.selectedAdvisors.find(adv => adv.isHost);
      if (host) {
        setActiveAdvisors([host]);
      } else {
        setActiveAdvisors([state.selectedAdvisors[0]]);
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

    if (hasApiKey) {
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
              apiKey: settings.apiKey.trim()
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
            <h3 className="text-lg font-semibold">AI Hub Settings</h3>
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
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    const newSettings = { ...settings };
                    saveApiKey();
                    setShowSettings(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
              {settings.apiKey && (
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
                {hasApiKey ? 'Update your Claude API key:' : 'Add your Claude API key to enable AI responses:'}
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
              {hasApiKey && !tempApiKey && (
                <button
                  onClick={() => setTempApiKey('')}
                  className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Advisory Meeting</h2>
              <p className="text-sm text-gray-600">
                {activeAdvisors.length} advisor{activeAdvisors.length !== 1 ? 's' : ''} active
                {hasApiKey && <span className="text-green-600 ml-2">• AI enabled</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvisorPanel(!showAdvisorPanel)}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Advisors
              </button>
              <button
                onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documents
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Start your advisory session</p>
              <p className="text-sm mt-2">
                {activeAdvisors.length === 0 
                  ? 'Select advisors from the panel to begin'
                  : 'Type a message below to begin'}
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
                        <p className="text-sm font-medium text-gray-900">{msg.advisorName}</p>
                        <p className="text-xs text-gray-500">{msg.advisorRole}</p>
                        <div className="bg-white border rounded-lg px-4 py-3 mt-1">
                          {msg.content}
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
                  : "Ask your advisors..."
              }
              disabled={activeAdvisors.length === 0}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing || activeAdvisors.length === 0}
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
              state.selectedAdvisors.map((advisor) => (
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