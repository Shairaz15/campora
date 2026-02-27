import Navbar from '@/components/Navbar';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen gradient-bg">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-6 page-enter">
                {children}
            </main>
        </div>
    );
}
