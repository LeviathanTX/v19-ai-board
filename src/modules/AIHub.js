import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, X, Users, FileText, Settings, Save, Clock, MessageSquare, ChevronDown, ChevronUp, Mic, MicOff, Video, VideoOff, Bot, Loader, Calendar, FolderOpen, ChevronLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';

const AIHub = () => {
  const { state, updateConversations } = useAppState();
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

  const [settings, setSettings] = useState({
    apiKey: localStorage.getItem('claudeApiKey') || '',
    interactionMode: 'orchestrated',
    defaultAdvisors: [],
    autoSave: true,
    maxStoredMeetings: 50,
    useLastAdvisors: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('aiHubSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        apiKey: parsed.apiKey || localStorage.getItem('claudeApiKey') || ''
      });
    }

    if (state.selectedAdvisors.length > 0 && activeAdvisors.length === 0) {
      const host = state.selectedAdvisors.find(adv => adv.isHost);
      if (host) {
        setActiveAdvisors([host]);
      } else {
        setActiveAdvisors([state.selectedAdvisors[0]]);
      }
    }

    if (state.documents.filter(doc => doc.analysis).length > 0) {
      setShowDocumentPanel(true);
    }
  }, [state.selectedAdvisors, state.documents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('claudeApiKey', settings.apiKey);
    localStorage.setItem('aiHubSettings', JSON.stringify(settings));
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
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

    if (settings.apiKey) {
      try {
        for (const advisor of activeAdvisors) {
          const messages = [
            {
              role: 'system',
              content: advisor.customPrompt || `You are ${advisor.name}, a ${advisor.role}. ${advisor.experience}`
            },
            {
              role: 'user',
              content: inputMessage
            }
          ];

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': settings.apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              messages: messages,
              max_tokens: 1000
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
          content: `Error: ${error.message}. Please check your API key above.`,
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

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* API Key Bar */}
        {!settings.apiKey && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">Add your Claude API key to enable AI responses:</span>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="flex-1 max-w-md px-3 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 text-amber-600 hover:bg-amber-100 rounded"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={saveApiKey}
                className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
              >
                Save
              </button>
            </div>
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
              {settings.apiKey && (
                <button
                  onClick={() => {
                    setSettings({ ...settings, apiKey: '' });
                    localStorage.removeItem('claudeApiKey');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  title="Clear API Key"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Start your advisory session</p>
              <p className="text-sm mt-2">Type a message below to begin</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'system' ? (
                    <div className="max-w-[70%] bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800">
                      {msg.content}
                    </div>
                  ) : msg.type === 'user' ? (
                    <div className="max-w-[70%] bg-blue-600 text-white rounded-lg px-4 py-3">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[70%] flex gap-3">
                      <span className="text-2xl">{msg.advisorAvatar}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{msg.advisorName}</p>
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
              placeholder="Ask your advisors..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing || activeAdvisors.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {showAdvisorPanel && (
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Select Advisors</h3>
          </div>
          <div className="p-4">
            {state.selectedAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                onClick={() => toggleAdvisor(advisor)}
                className={`p-3 mb-2 border rounded-lg cursor-pointer ${
                  activeAdvisors.find(a => a.id === advisor.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{advisor.avatar}</span>
                  <div>
                    <p className="font-medium">{advisor.name}</p>
                    <p className="text-sm text-gray-600">{advisor.role}</p>
                  </div>
                  {activeAdvisors.find(a => a.id === advisor.id) && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              {state.documents.filter(doc => doc.analysis).length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No analyzed documents available
                </p>
              ) : (
                state.documents.filter(doc => doc.analysis).map((doc) => (
                  <div key={doc.id} className="p-3 mb-2 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{doc.fileType.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          Relevance: {Math.round(doc.analysis.relevanceScore * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIHub;