import React, { useState } from 'react';
import { Upload, FileText, X, Eye, Trash2, Search, Filter, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

const DocumentHub = () => {
  const { state, updateDocuments } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploadProgress, setUploadProgress] = useState({});
  const [analysisQueue, setAnalysisQueue] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const supportedFileTypes = {
    'application/pdf': { ext: 'pdf', icon: '📄', color: 'red' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', icon: '📝', color: 'blue' },
    'text/plain': { ext: 'txt', icon: '📃', color: 'gray' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', icon: '📊', color: 'green' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', icon: '📽️', color: 'orange' }
  };

  const analyzeDocument = async (document) => {
    setAnalysisQueue(prev => [...prev, document.id]);
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const analysis = {
      summary: `This document "${document.name}" contains important information about business operations and strategic planning.`,
      keyPoints: [
        'Strategic alignment with Q4 objectives',
        'Revenue growth opportunities identified',
        'Risk mitigation strategies outlined',
        'Team expansion recommendations'
      ],
      sentiment: 'positive',
      relevanceScore: 0.85,
      extractedEntities: ['Q4 2024', 'Revenue', 'Growth', 'Strategy'],
      suggestedAdvisors: ['CFO', 'Strategic Advisor', 'Growth Expert']
    };

    const updatedDocs = state.documents.map(doc => 
      doc.id === document.id 
        ? { ...doc, analysis, analyzed: true }
        : doc
    );
    
    updateDocuments(updatedDocs);
    setAnalysisQueue(prev => prev.filter(id => id !== document.id));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (!Object.keys(supportedFileTypes).includes(file.type)) {
        alert(`File type not supported: ${file.name}`);
        continue;
      }
      
      if (file.size > 20 * 1024 * 1024) {
        alert(`File too large: ${file.name} (max 20MB)`);
        continue;
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setUploadProgress(prev => ({ ...prev, [docId]: 0 }));
      
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => ({ ...prev, [docId]: i }));
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const newDocument = {
          id: docId,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          content: e.target.result,
          analyzed: false,
          fileType: supportedFileTypes[file.type]
        };

        const updatedDocs = [...state.documents, newDocument];
        updateDocuments(updatedDocs);
        
        setUploadProgress(prev => {
          const { [docId]: _, ...rest } = prev;
          return rest;
        });

        analyzeDocument(newDocument);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = state.documents.filter(doc => doc.id !== docId);
      updateDocuments(updatedDocs);
    }
  };

  const filteredDocuments = state.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.fileType.ext === selectedType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <ModuleContainer title="Document Hub">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Document Management</h2>
              <p className="text-sm text-gray-600 mt-1">Upload and analyze business documents</p>
            </div>
            
            <label className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Documents
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.xlsx,.pptx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="txt">Text</option>
              <option value="xlsx">Excel</option>
              <option value="pptx">PowerPoint</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No documents uploaded yet</p>
              <p className="text-sm mt-2">Upload documents to get AI-powered analysis</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.fileType.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 truncate max-w-[200px]" title={doc.name}>
                          {doc.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    {analysisQueue.includes(doc.id) ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    ) : doc.analyzed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Analysis complete</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleContainer>
  );
};

export default DocumentHub;