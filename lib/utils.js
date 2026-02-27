// Hardcoded admin email for demo
export const ADMIN_EMAIL = 'shairaz102938@gmail.com';

// Product categories
export const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Books',
    'Dorm Essentials',
    'Food',
    'Pre-owned',
    'Others',
];

// Service categories
export const SERVICES = [
    'Tutoring',
    'Design',
    'Coding',
    'Photography',
    'Resume Help',
    'Content Creation',
];

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function getTransactionBadge(type) {
    const badges = {
        cash: { label: 'Cash', color: 'bg-green-500/20 text-green-400' },
        swap: { label: 'Swap', color: 'bg-purple-500/20 text-purple-400' },
        both: { label: 'Cash + Swap', color: 'bg-cyan-500/20 text-cyan-400' },
    };
    return badges[type] || badges.cash;
}

export function getStatusBadge(status) {
    const badges = {
        active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400' },
        sold: { label: 'Sold', color: 'bg-red-500/20 text-red-400' },
        pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
        held: { label: 'Payment Held', color: 'bg-orange-500/20 text-orange-400' },
        admin_approved: { label: 'Admin Approved', color: 'bg-blue-500/20 text-blue-400' },
        completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
        rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
        accepted: { label: 'Accepted', color: 'bg-green-500/20 text-green-400' },
    };
    return badges[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
}
