import { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Eye, Users, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.allSettled([
        api.get('/admin/pending'),
        api.get('/admin/all')
      ]);

      if (pendingRes.status === 'fulfilled')
        setPendingTrainers(pendingRes.value.data.trainers || []);
      if (allRes.status === 'fulfilled')
        setAllTrainers(allRes.value.data.trainers || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (trainerId) => {
    setActionLoading(trainerId + '_approve');
    try {
      await api.post(`/admin/approve/${trainerId}`);
      toast.success('Trainer approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve trainer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal + '_reject');
    try {
      await api.post(`/admin/reject/${rejectModal}`, {
        reason: rejectReason || 'Does not meet requirements'
      });
      toast.success('Trainer rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject trainer');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const displayList = tab === 'pending' ? pendingTrainers : allTrainers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage trainer verifications</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{pendingTrainers.length}</p>
          <p className="text-sm text-gray-500">Pending Review</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{allTrainers.length}</p>
          <p className="text-sm text-gray-500">Total Trainers</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {allTrainers.filter(t => t.verification_status === 'approved').length}
          </p>
          <p className="text-sm text-gray-500">Verified Trainers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({pendingTrainers.length})
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Trainers ({allTrainers.length})
        </button>
      </div>

      {/* Trainer list */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-400">
            {tab === 'pending' ? 'No pending verifications' : 'No trainers found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((trainer) => (
            <div key={trainer.trainer_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                {/* Trainer info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {trainer.User?.profile_image_url ? (
                      <img
                        src={trainer.User.profile_image_url}
                        alt=""
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">
                        {trainer.User?.first_name?.[0] || 'T'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {trainer.User?.first_name} {trainer.User?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{trainer.User?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied: {trainer.User?.created_at ? new Date(trainer.User.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge(trainer.verification_status)}`}>
                  {trainer.verification_status || 'unknown'}
                </span>
              </div>

              {/* Rejection reason */}
              {trainer.verification_status === 'rejected' && trainer.rejection_reason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Rejection reason: </span>
                    {trainer.rejection_reason}
                  </p>
                </div>
              )}

              {/* Document Link - FIXED TAG BELOW */}
              {trainer.document_url ? (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Verification Document</span>
                  </div>
                  <a 
                    href={trainer.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View Document
                  </a>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-700">No document uploaded yet</p>
                </div>
              )}

              {/* Action buttons */}
              {(trainer.verification_status === 'pending' || trainer.verification_status === 'submitted') && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(trainer.trainer_id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {actionLoading === trainer.trainer_id + '_approve' ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => {
                      setRejectModal(trainer.trainer_id);
                      setRejectReason('');
                    }}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal - Changed to fixed and better centering */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Trainer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection so the trainer knows what to fix.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="e.g. Certificate appears expired..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;