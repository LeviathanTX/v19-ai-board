import React, { useState } from 'react';
import { Menu, X, Home, FileText, Users, Brain, Video, CreditCard, ChevronLeft, Settings, User } from 'lucide-react';
import { AppStateProvider } from './contexts/AppStateContext';
import ModuleContainer from './components/ModuleContainer';
import DashboardModule from './modules/DashboardModule';
import DocumentHub from './modules/DocumentHub';
import AdvisoryHub from './modules/AdvisoryHub';
import AIHub from './modules/AIHub';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('ai');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'gray' },
    { id: 'ai', name: 'AI Hub', icon: Brain, color: 'green' },
    { id: 'documents', name: 'Document Hub', icon: FileText, color: 'blue' },
    { id: 'advisors', name: 'Advisory Hub', icon: Users, color: 'purple' },
    { id: 'meetings', name: 'Meeting Hub', icon: Video, color: 'orange' },
    { id: 'subscription', name: 'Subscription', icon: CreditCard, color: 'indigo' }
  ];

  const PlaceholderModule = ({ title, icon: Icon, color }) => {
    return (
      <ModuleContainer title={title}>
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Icon className={`w-16 h-16 mb-4 text-${color}-400`} />
          <p className="text-lg font-medium">{title} Module</p>
          <p className="text-sm mt-2">Coming soon...</p>
        </div>
      </ModuleContainer>
    );
  };

  const renderModule = () => {
    switch(activeModule) {
      case 'dashboard':
        return <DashboardModule setActiveModule={setActiveModule} />;
      case 'documents':
        return <DocumentHub />;
      case 'advisors':
        return <AdvisoryHub />;
      case 'ai':
        return <AIHub />;
      case 'meetings':
        return <PlaceholderModule title="Meeting Hub" icon={Video} color="orange" />;
      case 'subscription':
        return <PlaceholderModule title="Subscription" icon={CreditCard} color="indigo" />;
      default:
        return <DashboardModule setActiveModule={setActiveModule} />;
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
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
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
      </div>
    </AppStateProvider>
  );
}

export default App;