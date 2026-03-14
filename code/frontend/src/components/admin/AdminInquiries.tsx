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

    const renderTrend = (trend: number, cardType: 'total' | 'pending' | 'resolved') => {
        const isIncrease = trend >= 0;
        const arrow = isIncrease ? '↑' : '↓';
        
        let pillStyle = {};
        if (cardType === 'total') {
            pillStyle = { background: '#DBEAFE', color: '#1E40AF' };
        } else if (cardType === 'pending') {
            pillStyle = { background: '#FFEDD5', color: '#9A3412' };
        } else {
            pillStyle = { background: '#DCFCE7', color: '#166534' };
        }

        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ ...pillStyle, borderRadius: '999px' }}>
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
                    className="relative min-h-[120px] text-left cursor-pointer transition-all duration-[250ms] ease-out"
                    style={{
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        border: '1px solid #BFDBFE',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: activeFilter === 'all' ? '0 12px 28px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transform: activeFilter === 'all' ? 'translateY(-6px)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                        if (activeFilter !== 'all') {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeFilter !== 'all') {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                        }
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '10px',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Mail style={{ width: '20px', height: '20px', color: '#1D4ED8' }} />
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#3B82F6' }}>Total Inquiries</p>
                    </div>
                    <p style={{ fontSize: '38px', fontWeight: '700', color: '#1D4ED8', marginBottom: '8px', lineHeight: '1' }}>{totalInquiries}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                        {renderTrend(totalTrend, 'total')}
                        <p style={{ fontSize: '12px', color: '#3B82F6' }}>{newTodayCount} new today</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.6)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                borderRadius: '999px',
                                background: '#3B82F6',
                                width: '100%'
                            }} />
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: '600', minWidth: '32px', textAlign: 'right', color: '#1D4ED8' }}>100%</p>
                    </div>
                </button>

                {/* Pending Action Card */}
                <button
                    onClick={() => setActiveFilter('pending')}
                    className="relative min-h-[120px] text-left cursor-pointer transition-all duration-[250ms] ease-out"
                    style={{
                        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                        border: '1px solid #FED7AA',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: activeFilter === 'pending' ? '0 12px 28px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transform: activeFilter === 'pending' ? 'translateY(-6px)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                        if (activeFilter !== 'pending') {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                            e.currentTarget.style.borderColor = '#FED7AA';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeFilter !== 'pending') {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = '#FED7AA';
                        }
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '10px',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <AlertCircle style={{ width: '20px', height: '20px', color: '#C2410C' }} />
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#EA580C' }}>Pending Action</p>
                    </div>
                    <p style={{ fontSize: '38px', fontWeight: '700', color: '#C2410C', marginBottom: '8px', lineHeight: '1' }}>{pendingCount}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                        {renderTrend(pendingTrendRaw, 'pending')}
                        <p style={{ fontSize: '12px', color: '#EA580C' }}>
                            {pendingCount === 0 ? 'All clear' : `Avg. ${pendingAvgResponseHours}h response time`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.6)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                borderRadius: '999px',
                                background: '#F97316',
                                width: totalInquiries > 0 ? `${(pendingCount / totalInquiries) * 100}%` : '0%'
                            }} />
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: '600', minWidth: '32px', textAlign: 'right', color: '#C2410C' }}>
                            {totalInquiries > 0 ? Math.round((pendingCount / totalInquiries) * 100) : 0}%
                        </p>
                    </div>
                </button>

                {/* Resolved Card */}
                <button
                    onClick={() => setActiveFilter('resolved')}
                    className="relative min-h-[120px] text-left cursor-pointer transition-all duration-[250ms] ease-out"
                    style={{
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                        border: '1px solid #BBF7D0',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: activeFilter === 'resolved' ? '0 12px 28px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transform: activeFilter === 'resolved' ? 'translateY(-6px)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                        if (activeFilter !== 'resolved') {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                            e.currentTarget.style.borderColor = '#BBF7D0';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeFilter !== 'resolved') {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = '#BBF7D0';
                        }
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '10px',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#15803D' }} />
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#16A34A' }}>Resolved</p>
                    </div>
                    <p style={{ fontSize: '38px', fontWeight: '700', color: '#15803D', marginBottom: '8px', lineHeight: '1' }}>{resolvedCount}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                        {renderTrend(resolvedTrend, 'resolved')}
                        <p style={{ fontSize: '12px', color: '#16A34A' }}>{resolutionRate}% resolution rate</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.6)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                borderRadius: '999px',
                                background: '#22C55E',
                                width: totalInquiries > 0 ? `${(resolvedCount / totalInquiries) * 100}%` : '0%'
                            }} />
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: '600', minWidth: '32px', textAlign: 'right', color: '#15803D' }}>
                            {totalInquiries > 0 ? Math.round((resolvedCount / totalInquiries) * 100) : 0}%
                        </p>
                    </div>
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
