import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  List,
  MapPin,
  Star,
  Image,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingBag,
  BarChart3,
  Users,
  Truck,
  Gift,
  Tag,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { DataStore } from '@/data/store';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Delivery', href: '/admin/delivery', icon: Truck },
  { name: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Categories', href: '/admin/categories', icon: List },
  { name: 'Promos', href: '/admin/promos', icon: Tag },
  { name: 'Loyalty', href: '/admin/loyalty', icon: Gift },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Locations', href: '/admin/locations', icon: MapPin },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'Gallery', href: '/admin/gallery', icon: Image },
  { name: 'Site Content', href: '/admin/content', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    DataStore.logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-lotus-dark">
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileSidebarOpen(false)}>
          <div className="w-10 h-10 bg-lotus-gold rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-lg font-['Playfair_Display'] text-white">Admin</span>
        </Link>
        {/* Close button on mobile only */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-lotus-gold text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex">
      {/* ── Desktop Sidebar: fixed, always visible ≥ 1024px ── */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar: overlay drawer < 1024px ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar drawer */}
          <aside className="relative w-64 h-full overflow-y-auto shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center gap-2 text-sm">
                <Link to="/admin" className="text-gray-500 hover:text-lotus-gold">
                  Admin
                </Link>
                {location.pathname !== '/admin' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-lotus-dark font-medium">
                      {navItems.find((item) => isActive(item.href) && item.href !== '/admin')?.name || 'Page'}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lotus-gold hover:underline"
              >
                View Website
              </a>
            </div>
          </div>
        </header>

        {/* Page Content — scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
