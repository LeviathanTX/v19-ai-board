import React from 'react';

const ModuleContainer = ({ children, title }) => {
  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      <div className="h-full p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModuleContainer;