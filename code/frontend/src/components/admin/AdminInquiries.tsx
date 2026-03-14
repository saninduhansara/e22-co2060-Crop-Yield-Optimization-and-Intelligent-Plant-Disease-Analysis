import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { inquiryAPI } from '../../services/api';

export function AdminInquiries() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('all');

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

    const totalInquiries = inquiries.length;
    const pendingCount = inquiries.filter((i) => i.status === 'Pending').length;
    const resolvedCount = inquiries.filter((i) => i.status === 'Resolved').length;
    const pendingRate = totalInquiries > 0
        ? Math.round((pendingCount / totalInquiries) * 100)
        : 0;

    const resolutionRate = totalInquiries > 0
        ? Math.round((resolvedCount / totalInquiries) * 100)
        : 0;

    const now = new Date();
    const todayDateKey = now.toDateString();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const currentWindowStart = new Date(now.getTime() - oneWeekMs);
    const previousWindowStart = new Date(now.getTime() - 2 * oneWeekMs);

    const inDateRange = (dateValue: string, start: Date, end: Date) => {
        const date = new Date(dateValue);
        return !Number.isNaN(date.getTime()) && date >= start && date < end;
    };

    const newTodayCount = inquiries.filter((inq) => {
        const createdDate = new Date(inq.createdAt);
        return !Number.isNaN(createdDate.getTime()) && createdDate.toDateString() === todayDateKey;
    }).length;

    const pendingAvgResponseHours = pendingCount > 0
        ? Math.round(
            inquiries
                .filter((inq) => inq.status === 'Pending')
                .reduce((sum, inq) => {
                    const createdDate = new Date(inq.createdAt);
                    if (Number.isNaN(createdDate.getTime())) return sum;
                    const hours = Math.max(0, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
                    return sum + hours;
                }, 0) / pendingCount
        )
        : 0;

    const trendPercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const totalCurrentWeek = inquiries.filter((inq) =>
        inDateRange(inq.createdAt, currentWindowStart, now)
    ).length;
    const totalPreviousWeek = inquiries.filter((inq) =>
        inDateRange(inq.createdAt, previousWindowStart, currentWindowStart)
    ).length;
    const totalTrend = trendPercentage(totalCurrentWeek, totalPreviousWeek);

    const pendingCurrentWeek = inquiries.filter((inq) =>
        inq.status === 'Pending' && inDateRange(inq.createdAt, currentWindowStart, now)
    ).length;
    const pendingPreviousWeek = inquiries.filter((inq) =>
        inq.status === 'Pending' && inDateRange(inq.createdAt, previousWindowStart, currentWindowStart)
    ).length;
    const pendingTrendRaw = trendPercentage(pendingCurrentWeek, pendingPreviousWeek);

    const resolvedCurrentWeek = inquiries.filter((inq) =>
        inq.status === 'Resolved' && inDateRange(inq.createdAt, currentWindowStart, now)
    ).length;
    const resolvedPreviousWeek = inquiries.filter((inq) =>
        inq.status === 'Resolved' && inDateRange(inq.createdAt, previousWindowStart, currentWindowStart)
    ).length;
    const resolvedTrend = trendPercentage(resolvedCurrentWeek, resolvedPreviousWeek);

    const filteredInquiries = inquiries.filter((inq) => {
        if (activeFilter === 'pending') return inq.status === 'Pending';
        if (activeFilter === 'resolved') return inq.status === 'Resolved';
        return true;
    });

    const renderTrend = (trend: number) => {
        const isIncrease = trend >= 0;
        const arrow = isIncrease ? '↑' : '↓';
        const pillClass = isIncrease
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600';

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pillClass}`}>
                {arrow} {Math.abs(trend)}% this week
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Farmer Inquiries</h2>
                <p className="text-gray-600">Review and manage support requests from farmers.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Inquiries Card */}
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`relative min-h-[120px] overflow-hidden text-left rounded-xl px-6 py-5 border transition-all duration-200 ease-out cursor-pointer bg-white ${
                        activeFilter === 'all'
                            ? 'border-gray-300 shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                            : 'border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                    }`}
                    style={{ borderWidth: '1px' }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-blue-700" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Total Inquiries</p>
                    </div>
                    <p className="text-4xl leading-tight font-bold text-gray-900 mb-2">{totalInquiries}</p>
                    <div className="flex items-center justify-between gap-2 mb-3">
                        {renderTrend(totalTrend)}
                        <p className="text-xs text-gray-500">{newTodayCount} new today</p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" style={{ borderRadius: '0 0 12px 12px' }} />
                </button>

                {/* Pending Action Card */}
                <button
                    onClick={() => setActiveFilter('pending')}
                    className={`relative min-h-[120px] overflow-hidden text-left px-6 py-5 border transition-all duration-200 ease-out cursor-pointer bg-white ${
                        activeFilter === 'pending'
                            ? 'border-gray-300 shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                            : 'border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                    }`}
                    style={{
                        borderWidth: '1px',
                        borderLeft: '3px solid #F59E0B',
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-700" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Pending Action</p>
                    </div>
                    <p className="text-4xl leading-tight font-bold text-gray-900 mb-2">{pendingCount}</p>
                    <div className="flex items-center justify-between gap-2 mb-3">
                        {renderTrend(pendingTrendRaw)}
                        <p className="text-xs text-gray-500">
                            {pendingCount === 0 ? 'All clear' : `Avg. ${pendingAvgResponseHours}h response time`}
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" style={{ borderRadius: '0 0 12px 12px' }} />
                </button>

                {/* Resolved Card */}
                <button
                    onClick={() => setActiveFilter('resolved')}
                    className={`relative min-h-[120px] overflow-hidden text-left rounded-xl px-6 py-5 border transition-all duration-200 ease-out cursor-pointer bg-white ${
                        activeFilter === 'resolved'
                            ? 'border-gray-300 shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                            : 'border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
                    }`}
                    style={{ borderWidth: '1px' }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-700" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Resolved</p>
                    </div>
                    <p className="text-4xl leading-tight font-bold text-gray-900 mb-2">{resolvedCount}</p>
                    <div className="flex items-center justify-between gap-2 mb-3">
                        {renderTrend(resolvedTrend)}
                        <p className="text-xs text-gray-500">{resolutionRate}% resolution rate</p>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-green-600" style={{ borderRadius: '0 0 12px 12px' }} />
                </button>
            </div>

            {/* Inquiries List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {activeFilter === 'all' ? 'Recent Submissions' : activeFilter === 'pending' ? 'Pending Inquiries' : 'Resolved Inquiries'}
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    ) : filteredInquiries.length > 0 ? (
                        filteredInquiries.map((inq) => {
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
                            <p className="text-gray-500">
                                {activeFilter === 'all' ? 'No inquiries found.' : 'No inquiries match this filter.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
