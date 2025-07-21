import React, { useState } from 'react';
import { Menu, X, Home, FileText, Users, Brain, Video, CreditCard, ChevronLeft, Settings, User } from 'lucide-react';
import { AppStateProvider } from './contexts/AppStateContext';
import ModuleContainer from './components/ModuleContainer';
import DocumentHub from './modules/DocumentHub';
import AdvisoryHub from './modules/AdvisoryHub';
import AIHub from './modules/AIHub';
import SubscriptionModule from './modules/SubscriptionModule';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('subscription');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  const modules = [
    { id: 'ai', name: 'AI Boardroom', icon: Brain, color: 'green' },
    { id: 'documents', name: 'Document Hub', icon: FileText, color: 'blue' },
    { id: 'advisors', name: 'Advisory Hub', icon: Users, color: 'purple' },
    { id: 'meetings', name: 'Virtual Meetings Hub', icon: Video, color: 'orange' },
    { id: 'subscription', name: 'Subscription', icon: CreditCard, color: 'indigo' }
  ];

  const PlaceholderModule = ({ title, icon: Icon, color }) => {
    const isMeetingsHub = title === 'Virtual Meetings Hub';
    
    return (
      <ModuleContainer title={title}>
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Icon className={`w-16 h-16 mb-4 text-${color}-400`} />
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm mt-2">Coming soon...</p>
          
          {isMeetingsHub && (
            <>
              <div className="mt-8 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl">🎥</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Google Meet</p>
                  <p className="text-xs text-gray-500">Integration</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-3xl">💻</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Zoom</p>
                  <p className="text-xs text-gray-500">Integration</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <span className="text-3xl">📱</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Microsoft Teams</p>
                  <p className="text-xs text-gray-500">Integration</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-6 max-w-md text-center">
                Invite your AI Advisors to join your virtual meetings
              </p>
            </>
          )}
        </div>
      </ModuleContainer>
    );
  };

  const GlobalSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Global Settings</h2>
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* API Settings Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">API Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                To configure API keys for the AI Boardroom, please go to the AI Boardroom module and click the settings icon.
              </p>
              <button
                onClick={() => {
                  setShowGlobalSettings(false);
                  setActiveModule('ai');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to AI Boardroom Settings
              </button>
            </div>

            {/* General Settings */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Home Module
                  </label>
                  <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="subscription">Subscription</option>
                    <option value="ai">AI Boardroom</option>
                    <option value="documents">Document Hub</option>
                    <option value="advisors">Advisory Hub</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Enable notifications</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <h3 className="text-lg font-medium mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Light</option>
                    <option>Dark (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Keep sidebar expanded by default</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Data Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                Clear all local data including documents, conversations, and settings.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure? This will clear all documents, conversations, and settings.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModule = () => {
    switch(activeModule) {
      case 'documents':
        return <DocumentHub />;
      case 'advisors':
        return <AdvisoryHub />;
      case 'ai':
        return <AIHub />;
      case 'meetings':
        return <PlaceholderModule title="Virtual Meetings Hub" icon={Video} color="orange" />;
      case 'subscription':
        return <SubscriptionModule setActiveModule={setActiveModule} />;
      default:
        return <SubscriptionModule setActiveModule={setActiveModule} />;
    }
  };

  return (
    <AppStateProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
          {/* Logo and Toggle */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                  <span className="font-bold text-gray-900">AI Board</span>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <li key={module.id}>
                    <button
                      onClick={() => setActiveModule(module.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeModule === module.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="font-medium">{module.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={() => setShowGlobalSettings(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Settings</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">AI Board of Advisors</h2>
              
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700">John Doe</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Profile</button>
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Account Settings</button>
                    <hr className="my-1 border-gray-200" />
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Module Content */}
          {renderModule()}
        </div>

        {/* Global Settings Modal */}
        {showGlobalSettings && <GlobalSettingsModal />}
      </div>
    </AppStateProvider>
  );
}

export default App;