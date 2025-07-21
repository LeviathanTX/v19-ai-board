import React from 'react';
import { FileText, Video } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

const DashboardModule = ({ setActiveModule }) => {
  const { state } = useAppState();
  
  return (
    <ModuleContainer title="Dashboard">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Documents</h3>
            <p className="text-3xl font-bold text-blue-600">{state.documents.length}</p>
            <p className="text-sm text-blue-600 mt-1">Active documents</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-purple-900 mb-2">Advisors</h3>
            <p className="text-3xl font-bold text-purple-600">{state.selectedAdvisors.length}</p>
            <p className="text-sm text-purple-600 mt-1">Active advisors</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">Meetings</h3>
            <p className="text-3xl font-bold text-green-600">{state.activeConversations.length}</p>
            <p className="text-sm text-green-600 mt-1">This month</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start?</h3>
          <p className="text-gray-600 mb-6">Jump into the AI Boardroom to start your advisory session</p>
          <button
            onClick={() => setActiveModule('ai')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Open AI Boardroom
          </button>
        </div>
      </div>
    </ModuleContainer>
  );
};

export default DashboardModule;