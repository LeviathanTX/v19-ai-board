import React, { useState } from 'react';
import { Upload, FileText, X, Eye, Trash2, Search, Filter, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import ModuleContainer from '../components/ModuleContainer';

const DocumentHub = () => {
  const { state, updateDocuments, addDocument, deleteDocument, getDocumentContent } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploadProgress, setUploadProgress] = useState({});
  const [analysisQueue, setAnalysisQueue] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

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
      keyInsights: [
        'Market expansion opportunities in APAC region',
        'Cost optimization through automation',
        'Customer retention strategies showing 25% improvement'
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

        // Use the new addDocument method that saves to IndexedDB
        await addDocument(newDocument);
        
        setUploadProgress(prev => {
          const { [docId]: _, ...rest } = prev;
          return rest;
        });

        // Analyze the document (without content to save space)
        const { content, ...docMetadata } = newDocument;
        analyzeDocument(docMetadata);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(docId);
    }
  };

  const handlePreview = async (doc) => {
    setPreviewDoc(doc);
    setLoadingContent(true);
    setPreviewContent(null);
    
    // Fetch content from IndexedDB when preview is requested
    try {
      const fullDoc = await getDocumentContent(doc.id);
      if (fullDoc && fullDoc.content) {
        setPreviewContent(fullDoc.content);
      } else {
        // If no content in IndexedDB, show a message
        console.log('No content found in IndexedDB for document:', doc.id);
        setPreviewContent(null);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
      setPreviewContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewContent(null);
    setLoadingContent(false);
  };

  const filteredDocuments = state.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.fileType?.ext === selectedType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
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
                      <span className="text-2xl">{doc.fileType?.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate" title={doc.name}>
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
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Not analyzed</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(doc)}
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

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{previewDoc.fileType?.icon || '📄'}</span>
                <div>
                  <h3 className="font-semibold text-lg">{previewDoc.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(previewDoc.size)} • {new Date(previewDoc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {previewDoc.analysis && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">AI Analysis</h4>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-900 mb-3">{previewDoc.analysis.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="font-medium text-sm text-blue-900 mb-2">Key Points:</p>
                        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                          {previewDoc.analysis.keyPoints?.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {previewDoc.analysis.keyInsights && (
                        <div>
                          <p className="font-medium text-sm text-blue-900 mb-2">Key Insights:</p>
                          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                            {previewDoc.analysis.keyInsights.map((insight, i) => (
                              <li key={i}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="font-medium text-sm text-blue-900 mb-2">Suggested Advisors:</p>
                      <div className="flex flex-wrap gap-2">
                        {previewDoc.analysis.suggestedAdvisors?.map((advisor, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {advisor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-lg mb-3">Document Content</h4>
                {loadingContent ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p>Loading document content...</p>
                  </div>
                ) : previewContent ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {previewDoc.fileType?.ext === 'txt' ? (
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {(() => {
                          try {
                            return atob(previewContent.split(',')[1]);
                          } catch (e) {
                            return 'Unable to decode document content';
                          }
                        })()}
                      </pre>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Full preview not available for {previewDoc.fileType?.ext?.toUpperCase()} files</p>
                        <p className="text-sm mt-2">Download the file to view its full contents</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          Document content not available. This document may have been uploaded before content storage was implemented.
                        </p>
                        <p className="text-sm text-yellow-800 mt-2">
                          Please re-upload the document to enable content preview.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
};

export default DocumentHub;