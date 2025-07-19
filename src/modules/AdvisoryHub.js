import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Save, X, ChevronDown, ChevronUp, Brain, Briefcase, Star, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

// Default Host advisor
const defaultHost = {
  id: 'host-001',
  name: 'Meeting Host',
  role: 'AI Board Facilitator',
  expertise: ['Meeting Facilitation', 'Strategic Planning', 'Board Governance', 'Decision Making', 'Consensus Building'],
  personality: {
    tone: 'Professional and welcoming',
    approach: 'Structured facilitation with focus on outcomes',
    traits: ['Organized', 'Neutral', 'Inclusive', 'Time-conscious', 'Action-oriented']
  },
  experience: 'AI-powered board meeting facilitator and strategic advisor',
  avatar: '🎯',
  memory: {
    conversations: [],
    keyInsights: [],
    actionItems: []
  },
  customPrompt: `You are the AI Board Meeting Host and Facilitator. Your role is to:
- Welcome participants and set the meeting tone
- Keep discussions focused and productive
- Ensure all advisors have opportunity to contribute
- Summarize key points and action items
- Help the user navigate complex decisions
- Moderate debates between advisors
- Track time and meeting objectives
- Facilitate consensus-building
You should be professional yet approachable, keeping meetings efficient while ensuring thorough discussion of important topics.`,
  specialtyDocuments: [],
  isHost: true
};

// Default advisor templates
const defaultAdvisors = [
  defaultHost,
  {
    id: 'ceo-coach-001',
    name: 'Sarah Chen',
    role: 'CEO Coach',
    expertise: ['Leadership', 'Strategic Vision', 'Organizational Culture', 'Board Management'],
    personality: {
      tone: 'Direct and inspirational',
      approach: 'Challenging yet supportive',
      traits: ['Visionary', 'Results-oriented', 'Empathetic', 'Strategic']
    },
    experience: '20+ years Fortune 500 CEO experience',
    avatar: '👔',
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    },
    customPrompt: 'You are a seasoned CEO coach with extensive experience leading Fortune 500 companies.',
    specialtyDocuments: []
  },
  {
    id: 'cfo-001',
    name: 'Michael Thompson',
    role: 'Chief Financial Officer',
    expertise: ['Financial Strategy', 'Risk Management', 'M&A', 'Investor Relations'],
    personality: {
      tone: 'Analytical and precise',
      approach: 'Data-driven decision making',
      traits: ['Detail-oriented', 'Conservative', 'Strategic', 'Pragmatic']
    },
    experience: 'Former CFO at multiple tech unicorns',
    avatar: '📊',
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    },
    customPrompt: 'You are an experienced CFO who has guided multiple tech companies through rapid growth and IPOs.',
    specialtyDocuments: []
  }
];

const AdvisoryHub = () => {
  const { state, updateAdvisors } = useAppState();
  const [advisors, setAdvisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [expandedAdvisor, setExpandedAdvisor] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (state.selectedAdvisors.length === 0) {
      updateAdvisors(defaultAdvisors);
      setAdvisors(defaultAdvisors);
    } else {
      setAdvisors(state.selectedAdvisors);
    }
  }, []);

  useEffect(() => {
    updateAdvisors(advisors);
  }, [advisors]);

  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    role: '',
    expertise: [],
    personality: {
      tone: '',
      approach: '',
      traits: []
    },
    experience: '',
    avatar: '🤖',
    customPrompt: '',
    specialtyDocuments: []
  });

  const handleCreateAdvisor = () => {
    const advisor = {
      ...newAdvisor,
      id: `custom-${Date.now()}`,
      memory: {
        conversations: [],
        keyInsights: [],
        actionItems: []
      },
      specialtyDocuments: newAdvisor.specialtyDocuments || []
    };

    setAdvisors([...advisors, advisor]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateAdvisor = () => {
    const updatedAdvisors = advisors.map(adv => 
      adv.id === editingAdvisor.id ? editingAdvisor : adv
    );
    setAdvisors(updatedAdvisors);
    setEditingAdvisor(null);
  };

  const handleDeleteAdvisor = (advisorId) => {
    if (window.confirm('Are you sure you want to delete this advisor?')) {
      const updatedAdvisors = advisors.filter(adv => adv.id !== advisorId);
      setAdvisors(updatedAdvisors);
    }
  };

  const resetForm = () => {
    setNewAdvisor({
      name: '',
      role: '',
      expertise: [],
      personality: {
        tone: '',
        approach: '',
        traits: []
      },
      experience: '',
      avatar: '🤖',
      customPrompt: '',
      specialtyDocuments: []
    });
    setSelectedTemplate(null);
  };

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModuleContainer title="Advisory Hub">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Advisory Team</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your AI advisors and their expertise</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Advisor
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search advisors by name, role, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{advisor.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                        <p className="text-sm text-gray-600">{advisor.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAdvisor(advisor)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {advisor.id.startsWith('custom-') && (
                        <button
                          onClick={() => handleDeleteAdvisor(advisor.id)}
                          className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{advisor.experience}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {advisor.expertise.slice(0, 3).map((exp, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {exp}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedAdvisor(expandedAdvisor === advisor.id ? null : advisor.id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    {expandedAdvisor === advisor.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View Details
                      </>
                    )}
                  </button>
                </div>

                {expandedAdvisor === advisor.id && (
                  <div className="border-t px-4 pb-4">
                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Custom Instructions</h4>
                        <p className="text-sm text-gray-600 italic">{advisor.customPrompt}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};

export default AdvisoryHub;