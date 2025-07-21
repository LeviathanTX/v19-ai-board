import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Save, X, ChevronDown, ChevronUp, Brain, Briefcase, Star, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

// Default Meeting Host to ensure it's always available
const meetingHost = {
  id: 'meeting-host',
  name: 'Meeting Host',
  role: 'AI Board Facilitator',
  avatar: '🤖',
  isHost: true,
  experience: 'I facilitate productive discussions between you and your AI advisors',
  expertise: ['Meeting Facilitation', 'Agenda Management', 'Action Items', 'Follow-up'],
  personality: {
    traits: ['Professional', 'Organized', 'Neutral'],
    approach: 'Structured facilitation',
    tone: 'Professional and welcoming'
  },
  customPrompt: `You are the Meeting Host, a highly trained AI Board Facilitator with expertise in:
    - Robert's Rules of Order for structured decision-making
    - Behavioral economics techniques (anchoring, framing, nudging)
    - Design thinking and creative brainstorming methods (SCAMPER, Six Thinking Hats)
    - Socratic questioning and active listening
    - Conflict resolution and consensus building
    - Time management and meeting productivity
    
    Your role is to:
    1. Open meetings with clear objectives and time allocations
    2. Use behavioral nudges to encourage participation and reduce groupthink
    3. Apply structured decision frameworks when appropriate
    4. Facilitate brainstorming using proven methodologies
    5. Ensure psychological safety for all participants
    6. Track action items with SMART goals
    7. Summarize using the PREP method (Point, Reason, Example, Point)
    
    Be warm yet professional, structured yet flexible, and always focused on extracting maximum value from every meeting.`,
  specialtyDocuments: [],
  memory: {
    conversations: [],
    keyInsights: [],
    actionItems: []
  }
};

// Additional advisor templates for creating new advisors
const advisorTemplates = [
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
  },
  {
    id: 'cmo-001',
    name: 'Jessica Rodriguez',
    role: 'Chief Marketing Officer',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Growth Marketing', 'Customer Experience'],
    personality: {
      tone: 'Creative and enthusiastic',
      approach: 'Customer-centric innovation',
      traits: ['Creative', 'Data-savvy', 'Trendy', 'Customer-focused']
    },
    experience: 'Built marketing engines for 3 unicorn startups',
    avatar: '🎯',
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    },
    customPrompt: 'You are a growth-focused CMO who has built marketing engines for multiple successful startups.',
    specialtyDocuments: []
  },
  {
    id: 'legal-001',
    name: 'David Kim',
    role: 'Legal Expert',
    expertise: ['Corporate Law', 'IP Protection', 'Compliance', 'Contract Negotiation'],
    personality: {
      tone: 'Professional and cautious',
      approach: 'Risk-aware guidance',
      traits: ['Thorough', 'Protective', 'Clear communicator', 'Problem-solver']
    },
    experience: 'General Counsel for tech companies, startup specialist',
    avatar: '⚖️',
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    },
    customPrompt: 'You are a legal expert specializing in technology companies and startups.',
    specialtyDocuments: []
  },
  {
    id: 'growth-001',
    name: 'Alex Patel',
    role: 'Growth Expert',
    expertise: ['Product-Market Fit', 'Scaling Operations', 'Customer Acquisition', 'Metrics & Analytics'],
    personality: {
      tone: 'Energetic and data-focused',
      approach: 'Rapid experimentation',
      traits: ['Analytical', 'Agile', 'Results-driven', 'Innovative']
    },
    experience: 'Scaled 5 startups from seed to Series C',
    avatar: '🚀',
    memory: {
      conversations: [],
      keyInsights: [],
      actionItems: []
    },
    customPrompt: 'You are a growth expert who has helped scale multiple startups.',
    specialtyDocuments: []
  }
];

const AdvisoryHub = () => {
  const { state, updateAdvisors } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [expandedAdvisor, setExpandedAdvisor] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Initialize advisors from state
  const [advisors, setAdvisors] = useState(() => {
    // Always ensure Meeting Host is included at initialization
    const hasHost = state.selectedAdvisors.some(adv => adv.isHost);
    if (!hasHost) {
      return [meetingHost, ...state.selectedAdvisors];
    }
    return state.selectedAdvisors;
  });

  // Update global state when advisors change, but prevent circular updates
  useEffect(() => {
    // Only update if advisors have actually changed
    const advisorsChanged = JSON.stringify(advisors) !== JSON.stringify(state.selectedAdvisors);
    if (advisorsChanged && advisors.length > 0) {
      updateAdvisors(advisors);
    }
  }, [advisors, updateAdvisors, state.selectedAdvisors]);

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

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setNewAdvisor({
      ...template,
      name: '',
      id: undefined
    });
  };

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expertiseOptions = [
    'Leadership', 'Finance', 'Marketing', 'Sales', 'Operations',
    'Technology', 'Product', 'Legal', 'HR', 'Strategy',
    'M&A', 'Fundraising', 'Customer Success', 'Data Analytics'
  ];

  const personalityTraits = [
    'Analytical', 'Creative', 'Direct', 'Supportive', 'Strategic',
    'Detail-oriented', 'Visionary', 'Pragmatic', 'Innovative', 'Empathetic'
  ];

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
                        <h3 className="font-semibold text-gray-900">
                          {advisor.name}
                          {advisor.isHost && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Host</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{advisor.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!advisor.isHost && (
                        <button
                          onClick={() => setEditingAdvisor(advisor)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {!advisor.isHost && advisor.id.startsWith('custom-') && (
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
                    {advisor.expertise.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        +{advisor.expertise.length - 3}
                      </span>
                    )}
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
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Personality</h4>
                        <p className="text-sm text-gray-600">Tone: {advisor.personality.tone}</p>
                        <p className="text-sm text-gray-600">Approach: {advisor.personality.approach}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {advisor.personality.traits.map((trait, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      {advisor.customPrompt && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Instructions</h4>
                          <p className="text-sm text-gray-600 italic">{advisor.customPrompt}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">All Expertise Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {advisor.expertise.map((exp, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {advisor.specialtyDocuments && advisor.specialtyDocuments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Specialty Training</h4>
                          <p className="text-sm text-gray-600">
                            {advisor.specialtyDocuments.length} document{advisor.specialtyDocuments.length !== 1 ? 's' : ''} attached
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingAdvisor) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {editingAdvisor ? 'Edit Advisor' : 'Create Custom Advisor'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAdvisor(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                {/* Template Selection */}
                {!editingAdvisor && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start from template (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {advisorTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className={`p-3 border rounded-lg text-left hover:bg-gray-50 ${
                            selectedTemplate === template.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{template.avatar}</span>
                            <div>
                              <p className="text-sm font-medium">{template.role}</p>
                              <p className="text-xs text-gray-500">{template.expertise.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingAdvisor ? editingAdvisor.name : newAdvisor.name}
                        onChange={(e) => {
                          if (editingAdvisor) {
                            setEditingAdvisor({ ...editingAdvisor, name: e.target.value });
                          } else {
                            setNewAdvisor({ ...newAdvisor, name: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Sarah Johnson"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        value={editingAdvisor ? editingAdvisor.role : newAdvisor.role}
                        onChange={(e) => {
                          if (editingAdvisor) {
                            setEditingAdvisor({ ...editingAdvisor, role: e.target.value });
                          } else {
                            setNewAdvisor({ ...newAdvisor, role: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Strategic Advisor"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={editingAdvisor ? editingAdvisor.experience : newAdvisor.experience}
                      onChange={(e) => {
                        if (editingAdvisor) {
                          setEditingAdvisor({ ...editingAdvisor, experience: e.target.value });
                        } else {
                          setNewAdvisor({ ...newAdvisor, experience: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 15+ years in tech leadership"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas</label>
                    <div className="flex flex-wrap gap-2">
                      {expertiseOptions.map((exp) => (
                        <button
                          key={exp}
                          onClick={() => {
                            const currentExpertise = editingAdvisor ? editingAdvisor.expertise : newAdvisor.expertise;
                            const updatedExpertise = currentExpertise.includes(exp)
                              ? currentExpertise.filter(e => e !== exp)
                              : [...currentExpertise, exp];
                            
                            if (editingAdvisor) {
                              setEditingAdvisor({ ...editingAdvisor, expertise: updatedExpertise });
                            } else {
                              setNewAdvisor({ ...newAdvisor, expertise: updatedExpertise });
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            (editingAdvisor ? editingAdvisor.expertise : newAdvisor.expertise).includes(exp)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Communication Tone</label>
                      <input
                        type="text"
                        value={editingAdvisor ? editingAdvisor.personality.tone : newAdvisor.personality.tone}
                        onChange={(e) => {
                          if (editingAdvisor) {
                            setEditingAdvisor({
                              ...editingAdvisor,
                              personality: { ...editingAdvisor.personality, tone: e.target.value }
                            });
                          } else {
                            setNewAdvisor({
                              ...newAdvisor,
                              personality: { ...newAdvisor.personality, tone: e.target.value }
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Direct and supportive"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approach</label>
                      <input
                        type="text"
                        value={editingAdvisor ? editingAdvisor.personality.approach : newAdvisor.personality.approach}
                        onChange={(e) => {
                          if (editingAdvisor) {
                            setEditingAdvisor({
                              ...editingAdvisor,
                              personality: { ...editingAdvisor.personality, approach: e.target.value }
                            });
                          } else {
                            setNewAdvisor({
                              ...newAdvisor,
                              personality: { ...newAdvisor.personality, approach: e.target.value }
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Data-driven decision making"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personality Traits</label>
                    <div className="flex flex-wrap gap-2">
                      {personalityTraits.map((trait) => (
                        <button
                          key={trait}
                          onClick={() => {
                            const currentTraits = editingAdvisor 
                              ? editingAdvisor.personality.traits 
                              : newAdvisor.personality.traits;
                            const updatedTraits = currentTraits.includes(trait)
                              ? currentTraits.filter(t => t !== trait)
                              : [...currentTraits, trait];
                            
                            if (editingAdvisor) {
                              setEditingAdvisor({
                                ...editingAdvisor,
                                personality: { ...editingAdvisor.personality, traits: updatedTraits }
                              });
                            } else {
                              setNewAdvisor({
                                ...newAdvisor,
                                personality: { ...newAdvisor.personality, traits: updatedTraits }
                              });
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            (editingAdvisor ? editingAdvisor.personality.traits : newAdvisor.personality.traits).includes(trait)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Instructions</label>
                    <textarea
                      value={editingAdvisor ? editingAdvisor.customPrompt : newAdvisor.customPrompt}
                      onChange={(e) => {
                        if (editingAdvisor) {
                          setEditingAdvisor({ ...editingAdvisor, customPrompt: e.target.value });
                        } else {
                          setNewAdvisor({ ...newAdvisor, customPrompt: e.target.value });
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Provide specific instructions for how this advisor should behave..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty Training Documents
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Attach documents to give this advisor specialized knowledge
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {state.documents.filter(doc => doc.analysis).length > 0 ? (
                        <div className="space-y-2">
                          {state.documents.filter(doc => doc.analysis).map((doc) => {
                            const isSelected = editingAdvisor 
                              ? (editingAdvisor.specialtyDocuments || []).includes(doc.id)
                              : (newAdvisor.specialtyDocuments || []).includes(doc.id);
                            
                            return (
                              <label key={doc.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentDocs = editingAdvisor 
                                      ? (editingAdvisor.specialtyDocuments || [])
                                      : (newAdvisor.specialtyDocuments || []);
                                    
                                    const updatedDocs = e.target.checked
                                      ? [...currentDocs, doc.id]
                                      : currentDocs.filter(id => id !== doc.id);
                                    
                                    if (editingAdvisor) {
                                      setEditingAdvisor({ ...editingAdvisor, specialtyDocuments: updatedDocs });
                                    } else {
                                      setNewAdvisor({ ...newAdvisor, specialtyDocuments: updatedDocs });
                                    }
                                  }}
                                  className="rounded text-purple-600"
                                />
                                <span className="text-sm">{doc.fileType.icon}</span>
                                <span className="text-sm truncate flex-1">{doc.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          No analyzed documents available. Upload and analyze documents first.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAdvisor(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAdvisor ? handleUpdateAdvisor : handleCreateAdvisor}
                  disabled={
                    editingAdvisor 
                      ? !editingAdvisor.name || !editingAdvisor.role
                      : !newAdvisor.name || !newAdvisor.role
                  }
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAdvisor ? 'Update Advisor' : 'Create Advisor'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModuleContainer>
  );
};

export default AdvisoryHub;