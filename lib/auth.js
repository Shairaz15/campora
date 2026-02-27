// Hardcoded auth system for hackathon demo
// No Supabase auth needed — just cookies + hardcoded users

const DEMO_USERS = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'shairaz102938@gmail.com',
        password: 'admin123',
        name: 'Shairaz (Admin)',
        role: 'admin',
        phone: '8618136168',
        semester: '4',
        department: 'CSE',
        section: 'H',
        graduation_year: 2028,
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'suhaim10293847@gmail.com',
        password: 'student123',
        name: 'Suhaim',
        role: 'student',
        phone: '9876543210',
        semester: '4',
        department: 'CSE',
        section: 'H',
        graduation_year: 2028,
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'sashank10293847@gmail.com',
        password: 'student123',
        name: 'Sashank',
        role: 'student',
        phone: '9876543211',
        semester: '4',
        department: 'ECE',
        section: 'A',
        graduation_year: 2028,
    },
];

export function getDemoUsers() {
    return DEMO_USERS;
}

export function findUserByEmail(email) {
    return DEMO_USERS.find((u) => u.email === email) || null;
}

export function findUserById(id) {
    return DEMO_USERS.find((u) => u.id === id) || null;
}

export function validateLogin(email, password) {
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
    return user || null;
}

// Cookie helpers (client-side)
export function setAuthCookie(userId) {
    document.cookie = `campora_user=${userId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthCookie() {
    document.cookie = 'campora_user=; path=/; max-age=0';
}

export function getAuthCookie() {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/campora_user=([^;]+)/);
    return match ? match[1] : null;
}

export function getCurrentUser() {
    const userId = getAuthCookie();
    if (!userId) return null;
    return findUserById(userId);
}
