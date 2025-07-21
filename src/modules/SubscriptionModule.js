import React from 'react';
import { CreditCard, Users, FileText, Video, Check, X, TrendingUp } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

const SubscriptionModule = ({ setActiveModule }) => {
  const { state } = useAppState();
  
  const plans = [
    {
      name: 'Starter',
      price: '$199',
      period: '/month',
      features: [
        '3 AI Advisors',
        '10 Documents/month',
        '5 Advisory Sessions/month',
        'Email Support',
        'Basic Analytics'
      ],
      notIncluded: [
        'Custom Advisors',
        'Virtual Meeting Integration',
        'Advanced Analytics'
      ],
      current: false
    },
    {
      name: 'Professional',
      price: '$499',
      period: '/month',
      features: [
        'Unlimited AI Advisors',
        '100 Documents/month',
        'Unlimited Advisory Sessions',
        'Priority Support',
        'Advanced Analytics',
        'Custom Advisor Creation',
        'Document Intelligence'
      ],
      notIncluded: [
        'Virtual Meeting Integration',
        'API Access'
      ],
      current: true,
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$1999',
      period: '/month',
      features: [
        'Everything in Professional',
        'Virtual Meeting Integration',
        'API Access',
        'Dedicated Success Manager',
        'Custom Integrations',
        'SLA Guarantee',
        'Advanced Security',
        'Unlimited Everything'
      ],
      notIncluded: [],
      current: false
    }
  ];

  return (
    <ModuleContainer title="Subscription & Account">
      <div className="p-6 space-y-6">
        {/* Usage Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Documents</h4>
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{state.documents.length}</p>
              <p className="text-sm text-blue-600 mt-1">Active documents</p>
              <div className="mt-3 bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((state.documents.length / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">{state.documents.length} of 100</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-purple-900">Advisors</h4>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{state.selectedAdvisors.length}</p>
              <p className="text-sm text-purple-600 mt-1">Active advisors</p>
              <div className="mt-3 bg-purple-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-purple-600 mt-1">Unlimited</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-green-900">Meetings</h4>
                <Video className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{state.activeConversations.length}</p>
              <p className="text-sm text-green-600 mt-1">This month</p>
              <div className="mt-3 bg-green-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-green-600 mt-1">Unlimited</p>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`rounded-lg p-6 ${
                  plan.current 
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-500' 
                    : 'bg-white border border-gray-200'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 opacity-50">
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    plan.current
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : plan.name === 'Enterprise'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Downgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
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

        {/* Account Settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Billing Information</span>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Usage History</span>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};

export default SubscriptionModule;