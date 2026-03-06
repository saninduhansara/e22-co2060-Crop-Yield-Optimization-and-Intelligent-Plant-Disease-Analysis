import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { inquiryAPI } from '../../services/api';

export function AdminInquiries() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const data = await inquiryAPI.getAllInquiries();
            setInquiries(data.inquiries || []);
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
            toast.error("Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            setResolvingId(id);
            const updated = await inquiryAPI.updateStatus(id, newStatus);
            setInquiries(
                inquiries.map((inq) => (inq._id === id ? updated : inq))
            );
            toast.success(`Inquiry marked as ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update inquiry status");
        } finally {
            setResolvingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved':
                return 'bg-green-100 text-green-700';
            case 'Reviewed':
                return 'bg-blue-100 text-blue-700';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Resolved':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'Reviewed':
                return <Clock className="w-4 h-4" />;
            case 'Pending':
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Farmer Inquiries</h2>
                <p className="text-gray-600">Review and manage support requests from farmers.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Inquiries</p>
                            <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Action</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inquiries.filter((i) => i.status === 'Pending').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inquiries.filter((i) => i.status === 'Resolved').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inquiries List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Submissions</h3>
                </div>
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    ) : inquiries.length > 0 ? (
                        inquiries.map((inq) => {
                            let displaySubject = inq.subject;
                            let displayCategory = "Support";
                            const match = inq.subject.match(/^\[(.*?)\] (.*)$/);
                            if (match) {
                                displayCategory = match[1];
                                displaySubject = match[2];
                            }

                            const farmerName = inq.farmer ? `${inq.farmer.firstName} ${inq.farmer.lastName}` : "Unknown Farmer";
                            const farmerDistrict = inq.farmer?.district || "Unknown District";

                            return (
                                <div key={inq._id} className="border border-gray-200 rounded-lg p-5 hover:border-green-300 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                    {displayCategory}
                                                </span>
                                                <h4 className="font-semibold text-gray-900">{displaySubject}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>From: <strong>{farmerName}</strong></span>
                                                <span>•</span>
                                                <span>{farmerDistrict}</span>
                                                <span>•</span>
                                                <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(inq.status)}`}>
                                                {getStatusIcon(inq.status)}
                                                {inq.status}
                                            </div>

                                            {/* Action Dropdown Alternative using Select for simplicity */}
                                            <select
                                                value={inq.status}
                                                onChange={(e) => handleStatusUpdate(inq._id, e.target.value)}
                                                disabled={resolvingId === inq._id}
                                                className="text-sm border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="Pending">Mark Pending</option>
                                                <option value="Reviewed">Mark Reviewed</option>
                                                <option value="Resolved">Mark Resolved</option>
                                            </select>

                                            {resolvingId === inq._id && <Loader2 className="w-4 h-4 text-green-600 animate-spin" />}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-wrap">
                                        {inq.message}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No inquiries found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
