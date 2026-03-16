import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

// Layout
import MainLayout from '@/components/ui-custom/MainLayout';

// User Pages
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Catering from '@/pages/Catering';
import Locations from '@/pages/Locations';
import Story from '@/pages/Story';
import Events from '@/pages/Events';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Checkout from '@/pages/Checkout';
import OrderConfirmed from '@/pages/OrderConfirmed';
import OrderTracking from '@/pages/OrderTracking';
import Profile from '@/pages/Profile';
import Sitemap from '@/pages/Sitemap';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

// Admin Pages
import AdminLayout from '@/admin/AdminLayout';
import AdminLogin from '@/admin/Login';
import AdminDashboard from '@/admin/Dashboard';
import AdminMenu from '@/admin/Menu';
import AdminCategories from '@/admin/Categories';
import AdminLocations from '@/admin/Locations';
import AdminTestimonials from '@/admin/Testimonials';
import AdminGallery from '@/admin/Gallery';
import AdminContent from '@/admin/Content';
import AdminSettings from '@/admin/Settings';
import AdminOrders from '@/admin/Orders';
import AdminOrderDetail from '@/admin/OrderDetail';
import AdminAnalytics from '@/admin/Analytics';
import AdminUsers from '@/admin/Users';
import AdminDelivery from '@/admin/Delivery';
import AdminLoyalty from '@/admin/Loyalty';
import AdminPromos from '@/admin/Promos';
import AdminReviews from '@/admin/Reviews';
import AdminEvents from '@/admin/Events';
import AdminCatering from '@/admin/Catering';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('admin_jwt');
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function App() {
  useEffect(() => {
    // Data now initialized from database
  }, []);

  return (
    <AuthProvider>
      <Router>
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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id/confirmed" element={<OrderConfirmed />} />
            <Route path="/order/:id/track" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />

            {/* Utility pages */}
            <Route path="/sitemap" element={<Sitemap />} />
            
            {/* Static pages */}
            <Route path="/careers" element={<div className="pt-32 pb-20 text-center">We're Hiring - Coming Soon</div>} />
            <Route path="/gift-cards" element={<div className="pt-32 pb-20 text-center">Gift Cards - Coming Soon</div>} />
            <Route path="/contact" element={<div className="pt-32 pb-20 text-center">Contact Us - Coming Soon</div>} />
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
