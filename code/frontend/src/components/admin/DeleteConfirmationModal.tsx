import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { farmAPI } from '../../services/api';

interface DeleteConfirmationModalProps {
  farmId: string;
  farmName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmationModal({ farmId, farmName, onClose, onSuccess }: DeleteConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await farmAPI.deleteFarm(farmId);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting farm:', err);
      setError(err.response?.data?.message || 'Failed to delete farm. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Delete Farm</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-gray-700 font-medium">
              Are you sure you want to delete this farm?
            </p>
            <p className="text-sm font-semibold text-gray-900 break-words">
              {farmName} <span className="text-gray-600">({farmId})</span>
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              This action cannot be undone. All farm data will be permanently deleted.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 disabled:opacity-50 text-gray-800 font-medium rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 disabled:opacity-50 text-gray-800 font-medium rounded-lg transition-all"
          >
             <Trash2 className="w-4 h-4 flex-shrink-0" /> delete
          </button>
        </div>
      </div>
    </div>
  );
}
