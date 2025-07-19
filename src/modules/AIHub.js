import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, X, Users, FileText, Settings, Save, Clock, MessageSquare, ChevronDown, ChevronUp, Mic, MicOff, Video, VideoOff, Bot, Loader, Calendar, FolderOpen, ChevronLeft } from 'lucide-react';
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
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
    interactionMode: 'orchestrated',
    defaultAdvisors: [],
    autoSave: true,
    maxStoredMeetings: 50,
    useLastAdvisors: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('aiHubSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
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

  useEffect(() => {
    localStorage.setItem('aiHubSettings', JSON.stringify(settings));
  }, [settings]);

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
      // Real API call
      try {
        for (const advisor of activeAdvisors) {
          const response = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              messages: [
                {
                  role: 'system',
                  content: advisor.customPrompt
                },
                {
                  role: 'user',
                  content: inputMessage
                }
              ],
              max_tokens: 1000
            })
          });

          const data = await response.json();
          
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
      } catch (error) {
        console.error('API Error:', error);
      }
    } else {
      // Simulated response
      for (const advisor of activeAdvisors) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = {
          id: `msg-${Date.now()}-${advisor.id}`,
          type: 'advisor',
          advisorId: advisor.id,
          advisorName: advisor.name,
          advisorRole: advisor.role,
          advisorAvatar: advisor.avatar,
          content: `As your ${advisor.role}, I believe the key consideration here is strategic alignment. ${advisor.personality.approach} suggests focusing on measurable outcomes.`,
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
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
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
                  {msg.type === 'user' ? (
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
              disabled={!inputMessage.trim() || isProcessing}
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
              {state.documents.filter(doc => doc.analysis).map((doc) => (
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
              ))}
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">AI Hub Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claude API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sk-ant-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Your API key is stored locally</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHub;