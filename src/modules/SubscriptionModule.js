import React from 'react';
import { CreditCard, FileText, Users, MessageSquare, Check, X, TrendingUp } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

const SubscriptionModule = () => {
  const { state } = useAppState();
  
  return (
    <ModuleContainer title="Subscription Hub">
      <div className="p-6">
        {/* Usage Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Usage Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Professional Plan</h2>
              <p className="text-indigo-100">Your current subscription</p>
            </div>
            <CreditCard className="w-12 h-12 text-white opacity-50" />
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold">$199</span>
            <span className="text-indigo-100">/month</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Unlimited AI advisory meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Up to 10 custom advisors</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>100 document analyses per month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Priority support</span>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">5 AI advisory meetings/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">3 pre-configured advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">10 document analyses/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">Custom advisors</span>
                </li>
              </ul>
              <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Downgrade
              </button>
            </div>

            {/* Professional Plan (Current) */}
            <div className="border-2 border-indigo-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                CURRENT PLAN
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Unlimited meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">10 custom advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">100 document analyses/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Priority support</span>
                </li>
              </ul>
              <button className="w-full py-2 bg-indigo-500 text-white rounded-lg cursor-default">
                Current Plan
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">$999</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Everything in Professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Unlimited custom advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Unlimited document analyses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">White-glove onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Custom integrations</span>
                </li>
              </ul>
              <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">•••• •••• •••• 4242</span>
                <span className="text-sm text-gray-500 ml-auto">Visa</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Billing Date</label>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <span className="text-gray-700">January 21, 2025</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
              Update Payment Method
            </button>
            <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </ModuleContainer>
  );
};

export default SubscriptionModule;