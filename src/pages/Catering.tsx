import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Users, Briefcase, PartyPopper, ChevronRight, Check, Calendar, 
  MapPin, Phone, Mail, Upload, Plus, Minus, Utensils, Clock, Star,
  Home, Tent, Building2, TreeDeciduous, X, Info
} from 'lucide-react';
import { DataStore } from '@/data/store';
import { uploadImage } from '@/lib/uploadImage';
import type { CateringPackage, CateringOrder, CateringType } from '@/types';

const CATERING_TYPES: { id: CateringType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'wedding',
    title: 'Wedding Catering',
    description: 'Make your special day unforgettable with our elegant wedding catering services.',
    icon: <Heart className="w-8 h-8" />,
  },
  {
    id: 'corporate',
    title: 'Corporate Catering',
    description: 'Professional catering solutions for meetings, conferences, and company events.',
    icon: <Briefcase className="w-8 h-8" />,
  },
  {
    id: 'private',
    title: 'Private / Social Events',
    description: 'Celebrate birthdays, anniversaries, and special moments with friends and family.',
    icon: <PartyPopper className="w-8 h-8" />,
  },
];

const GUEST_RANGES = ['50-100', '100-200', '200-300', '300+'];
const BUDGET_TIERS = [
  { id: 'silver', name: 'Silver', price: '$45/head' },
  { id: 'gold', name: 'Gold', price: '$75/head' },
  { id: 'platinum', name: 'Platinum', price: '$120/head' },
];
const VENUE_TYPES = [
  { id: 'indoor', name: 'Indoor Hall', icon: <Building2 className="w-5 h-5" /> },
  { id: 'outdoor', name: 'Outdoor Garden', icon: <TreeDeciduous className="w-5 h-5" /> },
  { id: 'marquee', name: 'Marquee/Tent', icon: <Tent className="w-5 h-5" /> },
  { id: 'house', name: 'Private House', icon: <Home className="w-5 h-5" /> },
];
const SERVICE_FORMATS = ['Buffet', 'Box Lunch', 'Sit-Down', 'Food Stations'];
const EVENT_SUBTYPES = ['Birthday', 'Anniversary', 'House Party', 'Graduation', 'Baby Shower', 'Other'];
const CUISINE_STYLES = ['Pakistani', 'Chinese', 'BBQ', 'Continental', 'Mixed/Asian Fusion'];
const RENTAL_ITEMS = ['Tables', 'Chairs', 'Tents', 'Tablecloths', 'Decorative Lighting', 'Dance Floor'];
const DECORATION_ADDONS = ['Floral Centerpieces', 'Table Runners', 'Chair Covers', 'Backdrop', 'Balloon Arch'];

export default function Catering() {
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [selectedType, setSelectedType] = useState<CateringType | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CateringPackage | null>(null);
  const [step, setStep] = useState<'type' | 'package' | 'details' | 'form'>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventLocation: '',
    guestCount: '',
    specialRequests: '',
  });

  // Wedding-specific states
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedDecorations, setSelectedDecorations] = useState<string[]>([]);
  const [tastingDate, setTastingDate] = useState('');

  // Corporate-specific states
  const [serviceFormat, setServiceFormat] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [breakdownTime, setBreakdownTime] = useState('');
  const [recurring, setRecurring] = useState<'one-time' | 'weekly' | 'monthly'>('one-time');

  // Private-specific states
  const [eventSubtype, setEventSubtype] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor'>('indoor');
  const [cuisineStyle, setCuisineStyle] = useState('');
  const [liveCooking, setLiveCooking] = useState(false);
  const [selectedRentals, setSelectedRentals] = useState<string[]>([]);

  // File upload
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadedPackages = DataStore.getCateringPackages();
    setPackages(loadedPackages.filter(p => p.active));
  }, []);

  const handleTypeSelect = (type: CateringType) => {
    setSelectedType(type);
    setStep('package');
  };

  const handlePackageSelect = (pkg: CateringPackage) => {
    setSelectedPackage(pkg);
    setStep('details');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setUploadedPhotos([...uploadedPhotos, url]);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedPackage) return;

    setIsSubmitting(true);

    const newOrder: CateringOrder = {
      id: Date.now().toString(),
      orderNumber: `CAT-${Date.now().toString().slice(-6)}`,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      cateringType: selectedType,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      eventDate: formData.eventDate,
      eventLocation: formData.eventLocation,
      guestCount: parseInt(formData.guestCount) || 0,
      specialRequests: formData.specialRequests,
      photos: uploadedPhotos,
      status: 'pending',
      customQuote: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Type-specific fields
      ...(selectedType === 'wedding' && {
        budgetTier: selectedTier as any,
        decorationAddons: selectedDecorations,
        tastingSessionDate: tastingDate,
      }),
      ...(selectedType === 'corporate' && {
        serviceFormat,
        setupTime,
        breakdownTime,
        recurringBooking: recurring,
      }),
      ...(selectedType === 'private' && {
        eventSubType: eventSubtype,
        indoorOutdoor,
        cuisineStyle,
        liveCooking,
        rentalItems: selectedRentals,
      }),
    };

    DataStore.addCateringOrder(newOrder);
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  const filteredPackages = selectedType 
    ? packages.filter(p => p.cateringType === selectedType)
    : [];

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="section-padding max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-lotus-dark mb-4">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your catering inquiry. Our team will review your request and contact you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-primary">
                Back to Home
              </Link>
              <button 
                onClick={() => {
                  setSubmitSuccess(false);
                  setStep('type');
                  setSelectedType(null);
                  setSelectedPackage(null);
                  setFormData({ name: '', email: '', phone: '', eventDate: '', eventLocation: '', guestCount: '', specialRequests: '' });
                }}
                className="btn-secondary"
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
        <div className="relative z-10 text-center text-white px-4 section-padding">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catering Services</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we bring authentic flavors to your special events
          </p>
        </div>
      </section>

      <div className="section-padding py-12">
        {/* Step 1: Select Catering Type */}
        {step === 'type' && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-lotus-dark mb-4">Select Your Event Type</h2>
              <p className="text-gray-600">Choose the type of catering service you need</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CATERING_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all text-left group"
                >
                  <div className="w-16 h-16 bg-lotus-gold/10 rounded-xl flex items-center justify-center text-lotus-gold mb-6 group-hover:bg-lotus-gold group-hover:text-white transition-colors">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold text-lotus-dark mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-6">{type.description}</p>
                  <span className="inline-flex items-center text-lotus-gold font-medium">
                    Get Started <ChevronRight className="w-5 h-5 ml-1" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Package */}
        {step === 'package' && selectedType && (
          <div className="max-w-5xl mx-auto">
            <button 
              onClick={() => setStep('type')}
              className="text-gray-500 hover:text-lotus-gold mb-6 flex items-center gap-2"
            >
              ← Back to Event Types
            </button>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-lotus-dark mb-4">
                {CATERING_TYPES.find(t => t.id === selectedType)?.title} Packages
              </h2>
              <p className="text-gray-600">Select a package that fits your needs</p>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <p className="text-gray-500">No packages available for this category.</p>
                <button 
                  onClick={() => setStep('details')}
                  className="btn-primary mt-4"
                >
                  Request Custom Quote
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all"
                  >
                    {pkg.gallery[0] && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={pkg.gallery[0]} 
                          alt={pkg.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-lotus-dark mb-2">{pkg.name}</h3>
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-lotus-gold">
                          ${pkg.pricePerHead}
                        </span>
                        <span className="text-gray-500">/person</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {pkg.minGuests}-{pkg.maxGuests} guests
                        </span>
                      </div>

                      <div className="space-y-2 mb-6">
                        {pkg.includedItems.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => handlePackageSelect(pkg)}
                        className="w-full btn-primary"
                      >
                        Select Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Need something custom?</p>
              <button 
                onClick={() => {
                  setSelectedPackage(null);
                  setStep('details');
                }}
                className="btn-secondary"
              >
                Request Custom Quote
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Package Details & Customization */}
        {step === 'details' && selectedType && (
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setStep('package')}
              className="text-gray-500 hover:text-lotus-gold mb-6 flex items-center gap-2"
            >
              ← Back to Packages
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-lotus-dark mb-6">
                Customize Your {selectedPackage?.name || 'Catering Request'}
              </h2>

              {/* Wedding-specific fields */}
              {selectedType === 'wedding' && (
                <div className="space-y-8">
                  {/* Budget Tier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Budget Tier</label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {BUDGET_TIERS.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedTier(tier.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedTier === tier.id 
                              ? 'border-lotus-gold bg-lotus-gold/5' 
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          <div className="font-semibold text-lotus-dark">{tier.name}</div>
                          <div className="text-lotus-gold font-bold">{tier.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Venue Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Venue Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {VENUE_TYPES.map((venue) => (
                        <button
                          key={venue.id}
                          onClick={() => setSelectedVenue(venue.id)}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            selectedVenue === venue.id 
                              ? 'border-lotus-gold bg-lotus-gold/5 text-lotus-gold' 
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          {venue.icon}
                          <span className="text-sm font-medium">{venue.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Decoration Add-ons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Decoration Add-ons</label>
                    <div className="flex flex-wrap gap-3">
                      {DECORATION_ADDONS.map((decoration) => (
                        <label
                          key={decoration}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                            selectedDecorations.includes(decoration)
                              ? 'border-lotus-gold bg-lotus-gold/10'
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDecorations.includes(decoration)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDecorations([...selectedDecorations, decoration]);
                              } else {
                                setSelectedDecorations(selectedDecorations.filter(d => d !== decoration));
                              }
                            }}
                            className="sr-only"
                          />
                          <span className="text-sm">{decoration}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tasting Session */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Book a Tasting Session (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={tastingDate}
                      onChange={(e) => setTastingDate(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                </div>
              )}

              {/* Corporate-specific fields */}
              {selectedType === 'corporate' && (
                <div className="space-y-8">
                  {/* Service Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Service Format</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {SERVICE_FORMATS.map((format) => (
                        <button
                          key={format}
                          onClick={() => setServiceFormat(format)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            serviceFormat === format 
                              ? 'border-lotus-gold bg-lotus-gold/5' 
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          <span className="font-medium">{format}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Setup & Breakdown Times */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Setup Time Required</label>
                      <input
                        type="text"
                        value={setupTime}
                        onChange={(e) => setSetupTime(e.target.value)}
                        placeholder="e.g., 2 hours before"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Breakdown Time</label>
                      <input
                        type="text"
                        value={breakdownTime}
                        onChange={(e) => setBreakdownTime(e.target.value)}
                        placeholder="e.g., 1 hour after"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                      />
                    </div>
                  </div>

                  {/* Recurring Booking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Booking Type</label>
                    <div className="flex gap-4">
                      {(['one-time', 'weekly', 'monthly'] as const).map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                            recurring === type
                              ? 'border-lotus-gold bg-lotus-gold/10'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="recurring"
                            checked={recurring === type}
                            onChange={() => setRecurring(type)}
                            className="sr-only"
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Private Event-specific fields */}
              {selectedType === 'private' && (
                <div className="space-y-8">
                  {/* Event Sub-type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
                    <div className="flex flex-wrap gap-3">
                      {EVENT_SUBTYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setEventSubtype(type)}
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
                            eventSubtype === type 
                              ? 'border-lotus-gold bg-lotus-gold/10 text-lotus-gold' 
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Indoor/Outdoor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Setting</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIndoorOutdoor('indoor')}
                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          indoorOutdoor === 'indoor' 
                            ? 'border-lotus-gold bg-lotus-gold/5 text-lotus-gold' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Building2 className="w-6 h-6" />
                        <span>Indoor</span>
                      </button>
                      <button
                        onClick={() => setIndoorOutdoor('outdoor')}
                        className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          indoorOutdoor === 'outdoor' 
                            ? 'border-lotus-gold bg-lotus-gold/5 text-lotus-gold' 
                            : 'border-gray-200'
                        }`}
                      >
                        <TreeDeciduous className="w-6 h-6" />
                        <span>Outdoor</span>
                      </button>
                    </div>
                  </div>

                  {/* Cuisine Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Cuisine Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CUISINE_STYLES.map((style) => (
                        <button
                          key={style}
                          onClick={() => setCuisineStyle(style)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            cuisineStyle === style 
                              ? 'border-lotus-gold bg-lotus-gold/5' 
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Cooking Station */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="liveCooking"
                      checked={liveCooking}
                      onChange={(e) => setLiveCooking(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <label htmlFor="liveCooking" className="text-gray-700">
                      Add Live Cooking Station (+$500)
                    </label>
                  </div>

                  {/* Rental Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Rental Items Needed</label>
                    <div className="flex flex-wrap gap-3">
                      {RENTAL_ITEMS.map((item) => (
                        <label
                          key={item}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                            selectedRentals.includes(item)
                              ? 'border-lotus-gold bg-lotus-gold/10'
                              : 'border-gray-200 hover:border-lotus-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRentals.includes(item)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRentals([...selectedRentals, item]);
                              } else {
                                setSelectedRentals(selectedRentals.filter(i => i !== item));
                              }
                            }}
                            className="sr-only"
                          />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep('form')}
                className="w-full btn-primary mt-8"
              >
                Continue to Contact Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Form */}
        {step === 'form' && (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setStep('details')}
              className="text-gray-500 hover:text-lotus-gold mb-6 flex items-center gap-2"
            >
              ← Back to Customization
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-lotus-dark mb-6">Contact Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Location / Venue Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests / Notes
                  </label>
                  <textarea
                    rows={4}
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photos (Venue, Inspiration, etc.)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img 
                          src={photo} 
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-lotus-gold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="sr-only"
                      />
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lotus-gold" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50"
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
