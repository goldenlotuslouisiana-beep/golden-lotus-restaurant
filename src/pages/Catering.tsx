import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, ArrowRight, ChevronLeft, ChevronRight,
  Utensils, Leaf, Clock, Award, MapPin, Users
} from 'lucide-react';
import type { CateringPackage, CateringInquiry } from '@/types';

const WHY_CHOOSE_US = [
  { icon: <Utensils className="w-6 h-6" />, title: 'Authentic Recipes', desc: 'Traditional family recipes passed down generations' },
  { icon: <Leaf className="w-6 h-6" />, title: 'Fresh Ingredients', desc: 'Daily sourced fresh vegetables and premium meats' },
  { icon: <Clock className="w-6 h-6" />, title: 'On-Time Service', desc: 'Punctual delivery and setup for your event' },
  { icon: <Award className="w-6 h-6" />, title: 'Award Winning', desc: 'Voted best Indian catering in Alexandria 2024' },
];

export default function Catering() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CateringPackage | null>(null);
  const [step, setStep] = useState<'browse' | 'form'>('browse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventType: '',
    venueType: 'delivery' as 'delivery' | 'pickup' | 'on-site',
    venueAddress: '',
    dietaryRequirements: '',
    specialRequests: '',
    budgetRange: '',
    needStaffing: false,
    needRentals: false,
  });

  useEffect(() => {
    fetch('/api/menu?action=catering-packages')
      .then(r => r.json())
      .then(data => {
        const activePackages = data
          .filter((p: CateringPackage) => p.active)
          .sort((a: CateringPackage, b: CateringPackage) => a.order - b.order);
        setPackages(activePackages);
      })
      .catch(err => console.error('Error loading catering packages:', err));
  }, []);

  const handlePackageSelect = (pkg: CateringPackage) => {
    setSelectedPackage(pkg);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomRequest = () => {
    setSelectedPackage(null);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const inquiryNumber = `CAT-${Date.now().toString().slice(-6)}`;
    
    const newInquiry: CateringInquiry = {
      id: Date.now().toString(),
      inquiryNumber,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      eventType: formData.eventType || 'General Event',
      eventDate: `${formData.eventDate}T${formData.eventTime || '12:00'}`,
      guestCount: parseInt(formData.guestCount) || 0,
      venueType: formData.venueType,
      venueAddress: formData.venueAddress,
      packageId: selectedPackage?.id,
      packageName: selectedPackage?.name,
      customRequest: !selectedPackage,
      dietaryRequirements: formData.dietaryRequirements,
      specialRequests: formData.specialRequests,
      budgetRange: formData.budgetRange,
      needStaffing: formData.needStaffing,
      needRentals: formData.needRentals,
      status: 'new',
      priority: parseInt(formData.guestCount) > 100 ? 'high' : 'medium',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/admin?action=save-catering-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      });
      if (!res.ok) throw new Error('Failed to submit inquiry');
    } catch (err) {
      console.error('Error submitting catering inquiry:', err);
    }
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  const nextImage = (pkgId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (pkgId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
            <p className="text-gray-600 mb-2">
              Thank you for your catering inquiry. Our team will review your request and contact you within 24 hours.
            </p>
            <p className="text-lotus-gold font-medium mb-6">
              Your reference number: {`CAT-${Date.now().toString().slice(-6)}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="px-6 py-3 bg-lotus-gold text-white rounded-xl font-semibold hover:bg-lotus-gold-dark transition-colors">
                Back to Home
              </Link>
              <button 
                onClick={() => {
                  setSubmitSuccess(false);
                  setStep('browse');
                  setSelectedPackage(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    eventDate: '',
                    eventTime: '',
                    guestCount: '',
                    eventType: '',
                    venueType: 'delivery',
                    venueAddress: '',
                    dietaryRequirements: '',
                    specialRequests: '',
                    budgetRange: '',
                    needStaffing: false,
                    needRentals: false,
                  });
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-lotus-gold to-orange-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Catering Services</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we bring authentic Indian flavors to your events in Alexandria, Louisiana.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {step === 'browse' ? (
          <>
            {/* Package Grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Choose Your Catering Package</h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                Select from our curated packages or request a custom quote tailored to your specific needs.
              </p>
              
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
                    {/* Image Gallery */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img 
                        src={pkg.images[currentImageIndex[pkg.id] || 0]} 
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                      />
                      {pkg.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); prevImage(pkg.id, pkg.images.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nextImage(pkg.id, pkg.images.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {pkg.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${idx === (currentImageIndex[pkg.id] || 0) ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                        <span className="text-2xl font-bold text-lotus-gold">${pkg.pricePerPerson}</span>
                        <span className="text-gray-500 text-sm">/person</span>
                      </div>
                      {pkg.featured && (
                        <div className="absolute top-4 left-4 bg-lotus-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    {/* Package Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                      {pkg.subtitle && <p className="text-lotus-gold text-sm mb-2">{pkg.subtitle}</p>}
                      <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                      
                      {/* Guest Range */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Users className="w-4 h-4" />
                        <span>Min {pkg.minGuests} - Max {pkg.maxGuests} guests</span>
                      </div>

                      {/* Menu Items Preview */}
                      <div className="flex-1 mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Menu Highlights</p>
                        <div className="space-y-3">
                          {pkg.menuItems.slice(0, 3).map((section, idx) => (
                            <div key={idx}>
                              <p className="text-sm font-medium text-gray-700">{section.category}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{section.items.slice(0, 3).join(', ')}...</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button 
                        onClick={() => handlePackageSelect(pkg)}
                        className="w-full bg-lotus-gold text-white py-3 rounded-xl font-semibold hover:bg-lotus-gold-dark transition-colors flex items-center justify-center gap-2"
                      >
                        Select Package <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Custom Package Option */}
                <div className="bg-gradient-to-br from-lotus-gold to-orange-600 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col text-white">
                  <div className="relative h-64 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 text-center p-6">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Custom Package</h3>
                      <p className="text-white/90">Create your perfect menu</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-white/90 text-sm mb-6">
                      Have specific requirements? Let us create a custom catering package tailored to your event, dietary needs, and budget.
                    </p>
                    
                    <div className="flex-1 mb-6 space-y-3">
                      {['Fully customizable menu', 'Flexible guest count', 'Dietary accommodations', 'Personal consultation', 'Competitive pricing'].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-white flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleCustomRequest}
                      className="w-full bg-white text-lotus-gold py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Request Custom Quote <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gradient-to-br from-lotus-cream to-white rounded-3xl p-8 md:p-12 mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
                Why Choose Golden Lotus Catering?
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {WHY_CHOOSE_US.map((item, idx) => (
                  <div key={idx} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-lotus-gold/10 rounded-xl flex items-center justify-center text-lotus-gold mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Form Section */
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setStep('browse')}
              className="text-gray-500 hover:text-lotus-gold mb-6 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Packages
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Selected Package Summary */}
              {selectedPackage ? (
                <div className="bg-lotus-cream rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedPackage.featuredImage || selectedPackage.images[0]} 
                      alt={selectedPackage.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Selected Package</p>
                      <p className="font-bold text-gray-900">{selectedPackage.name}</p>
                      <p className="text-sm text-lotus-gold">${selectedPackage.pricePerPerson}/person • Min {selectedPackage.minGuests} guests</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep('browse')}
                    className="text-sm text-gray-500 hover:text-lotus-gold underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-lotus-gold/10 to-orange-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lotus-gold rounded-full flex items-center justify-center text-white">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Custom Package Request</p>
                      <p className="text-sm text-gray-600">Tell us your requirements and we'll create a custom quote</p>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Catering Request</h2>
              <p className="text-gray-600 mb-8">Please complete the form below to send us a catering request. We'll get back to you quickly!</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(318) 555-0123"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                {/* Event Details */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                    <input
                      type="number"
                      required
                      min={selectedPackage?.minGuests || 10}
                      placeholder="Approximate count"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <input
                    type="text"
                    placeholder="e.g., Wedding, Corporate Lunch, Birthday Party"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                {/* Venue Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'delivery', label: 'Delivery', icon: <MapPin className="w-5 h-5" /> },
                      { value: 'pickup', label: 'Pickup', icon: <Utensils className="w-5 h-5" /> },
                      { value: 'on-site', label: 'On-Site Service', icon: <Users className="w-5 h-5" /> },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.venueType === option.value
                            ? 'border-lotus-gold bg-lotus-gold/5 text-lotus-gold'
                            : 'border-gray-200 hover:border-lotus-gold/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="venueType"
                          value={option.value}
                          checked={formData.venueType === option.value}
                          onChange={(e) => setFormData({ ...formData, venueType: e.target.value as any })}
                          className="sr-only"
                        />
                        {option.icon}
                        <span className="font-medium text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.venueType === 'delivery' || formData.venueType === 'on-site') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Address</label>
                    <textarea
                      rows={2}
                      placeholder="Enter complete address for delivery or event venue"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
                    />
                  </div>
                )}

                {/* Additional Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.needStaffing}
                      onChange={(e) => setFormData({ ...formData, needStaffing: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <div>
                      <p className="font-medium">Need Service Staff</p>
                      <p className="text-sm text-gray-500">Servers for buffet/setup</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.needRentals}
                      onChange={(e) => setFormData({ ...formData, needRentals: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <div>
                      <p className="font-medium">Need Equipment Rentals</p>
                      <p className="text-sm text-gray-500">Tables, chairs, linens, etc.</p>
                    </div>
                  </label>
                </div>

                {/* Budget & Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  >
                    <option value="">Select your budget range</option>
                    <option value="Under $1,000">Under $1,000</option>
                    <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000+">$10,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g., Vegetarian, Gluten-free, Allergies, etc."
                    value={formData.dietaryRequirements}
                    onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your event, menu preferences, special requests..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-lotus-gold text-white py-4 rounded-xl font-semibold hover:bg-lotus-gold-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Catering Request'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
