import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Award, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerificationUpload = () => {
  const [documents, setDocuments] = useState([
    { type: 'certification', label: 'Fitness Certification', status: 'pending', file: null },
    { type: 'insurance', label: 'Liability Insurance', status: 'pending', file: null },
    { type: 'id_proof', label: 'Government ID', status: 'pending', file: null }
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (type, file) => {
    setDocuments(docs => docs.map(doc => 
      doc.type === type ? { ...doc, file } : doc
    ));
  };

  const handleSubmit = async (docType) => {
    const doc = documents.find(d => d.type === docType);
    if (!doc.file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      // First upload to cloud storage
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('type', 'verification');
      
      const uploadRes = await api.post('/uploads/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Then submit verification request
      await api.post('/trainers/verification', {
        document_type: docType,
        document_url: uploadRes.data.url,
        document_number: doc.documentNumber || '',
        issued_by: doc.issuedBy || ''
      });

      setDocuments(docs => docs.map(d => 
        d.type === docType ? { ...d, status: 'submitted' } : d
      ));

      toast.success(`${doc.label} submitted for verification`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
        return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trainer Verification</h1>
        <p className="text-gray-600 mt-2">
          Complete verification to unlock all platform features and build trust with clients.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Why get verified?</h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Appear higher in search results</li>
              <li>• Get a verified badge on your profile</li>
              <li>• Access premium client matching</li>
              <li>• Higher earning potential</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className="space-y-6">
        {documents.map((doc) => (
          <div key={doc.type} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(doc.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.label}</h3>
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{doc.status}</span>
                  </p>
                </div>
              </div>
              {doc.status === 'approved' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>

            {doc.status !== 'approved' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.type, e.target.files[0])}
                    className="hidden"
                    id={`file-${doc.type}`}
                  />
                  <label
                    htmlFor={`file-${doc.type}`}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {doc.file ? doc.file.name : 'Click to upload document'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG, or PNG up to 10MB
                    </span>
                  </label>
                </div>

                {doc.file && (
                  <button
                    onClick={() => handleSubmit(doc.type)}
                    disabled={uploading}
                    className="w-full btn-primary flex justify-center items-center"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Verification Info */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-2">How verification works</h4>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Upload your documents securely</li>
          <li>Our AI system reviews for authenticity (instant)</li>
          <li>Human review for final approval (24-48 hours)</li>
          <li>Get notified when verified</li>
        </ol>
      </div>
    </div>
  );
};

export default VerificationUpload;