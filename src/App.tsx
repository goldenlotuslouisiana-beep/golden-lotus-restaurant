import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';

// Layout
import MainLayout from '@/components/ui-custom/MainLayout';

// User Pages
const Home = lazy(() => import('@/pages/Home'));
const Menu = lazy(() => import('@/pages/Menu'));
const Catering = lazy(() => import('@/pages/Catering'));
const Locations = lazy(() => import('@/pages/Locations'));
const Story = lazy(() => import('@/pages/Story'));
const Events = lazy(() => import('@/pages/Events'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderConfirmed = lazy(() => import('@/pages/OrderConfirmed'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const Profile = lazy(() => import('@/pages/Profile'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));

// Admin Pages
import AdminLayout from '@/admin/AdminLayout';
const AdminLogin = lazy(() => import('@/admin/Login'));
const AdminDashboard = lazy(() => import('@/admin/Dashboard'));
const AdminMenu = lazy(() => import('@/admin/Menu'));
const AdminCategories = lazy(() => import('@/admin/Categories'));
const AdminLocations = lazy(() => import('@/admin/Locations'));
const AdminTestimonials = lazy(() => import('@/admin/Testimonials'));
const AdminGallery = lazy(() => import('@/admin/Gallery'));
const AdminContent = lazy(() => import('@/admin/Content'));
const AdminSettings = lazy(() => import('@/admin/Settings'));
const AdminOrders = lazy(() => import('@/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/admin/OrderDetail'));
const AdminAnalytics = lazy(() => import('@/admin/Analytics'));
const AdminUsers = lazy(() => import('@/admin/Users'));
const AdminDelivery = lazy(() => import('@/admin/Delivery'));
const AdminLoyalty = lazy(() => import('@/admin/Loyalty'));
const AdminPromos = lazy(() => import('@/admin/Promos'));
const AdminReviews = lazy(() => import('@/admin/Reviews'));
const AdminEvents = lazy(() => import('@/admin/Events'));
const AdminCatering = lazy(() => import('@/admin/Catering'));
const AdminHomePage = lazy(() => import('@/admin/HomePage'));
const AdminPagesManager = lazy(() => import('@/admin/PagesManager'));
const Contact = lazy(() => import('@/pages/Contact'));

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('admin_jwt');
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense
        fallback={
          <div style={{
            minHeight: '100vh',
            background: '#F9F4EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <style>{`
              @keyframes _spin { to { transform: rotate(360deg); } }
            `}</style>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid #EDE3D2',
              borderTopColor: '#B8853A',
              borderRadius: '50%',
              animation: '_spin 0.8s linear infinite',
            }} />
          </div>
        }
      >
          <Routes>
            {/* User Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/story" element={<Story />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id/confirmed" element={<OrderConfirmed />} />
              <Route path="/order/:id/track" element={<OrderTracking />} />
              <Route path="/profile" element={<Profile />} />

              {/* Utility pages */}
              <Route path="/sitemap" element={<Sitemap />} />

              {/* Static pages */}
              <Route path="/careers" element={<div className="pt-32 pb-20 text-center">We're Hiring - Coming Soon</div>} />
              <Route path="/gift-cards" element={<div className="pt-32 pb-20 text-center">Gift Cards - Coming Soon</div>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/accessibility" element={<div className="pt-32 pb-20 text-center">Accessibility - Coming Soon</div>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="locations" element={<AdminLocations />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="delivery" element={<AdminDelivery />} />
              <Route path="loyalty" element={<AdminLoyalty />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="catering" element={<AdminCatering />} />
              <Route path="home" element={<AdminHomePage />} />
              <Route path="pages" element={<AdminPagesManager />} />
            </Route>
          </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
