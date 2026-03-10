import { useState } from 'react';
import { Send, Check, Users, Calendar, MapPin, Truck, UtensilsCrossed, Loader2, AlertCircle } from 'lucide-react';
import { sendCateringEmails } from '@/lib/emailService';

export default function Catering() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '',
    serviceType: 'delivery',
    address: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      guests: '',
      serviceType: 'delivery',
      address: '',
      message: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendError(null);

    const { customerSent, adminSent, error } = await sendCateringEmails(formData);

    setIsSending(false);

    if (!customerSent && !adminSent) {
      // Both failed — show error, keep form data so user can retry
      setSendError(
        'We could not send your request right now. Please try again or contact us directly.'
      );
      return;
    }

    // At least one email went through — treat as success
    if (error) {
      console.warn('Partial email send failure:', error);
    }

    setIsSubmitted(true);
    resetForm();
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555244162-803279f50793?w=1920)' }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center text-white px-4 section-padding max-w-3xl mx-auto">
          <h1 className="heading-lg mb-4">Indian Food Catering in Miami</h1>
          <p className="text-lg opacity-90">
            Make your event unforgettable with Golden Lotus Catering! We offer a diverse menu of
            authentic Indian dishes, including live dosa and chaat stations, adding excitement
            and flavor to any celebration.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="section-padding">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <UtensilsCrossed className="w-8 h-8" />, title: 'Live Stations', desc: 'Dosa & Chaat stations' },
              { icon: <Users className="w-8 h-8" />, title: 'Any Group Size', desc: 'From 10 to 500+ guests' },
              { icon: <Calendar className="w-8 h-8" />, title: 'Any Occasion', desc: 'Weddings, parties, corporate' },
              { icon: <Truck className="w-8 h-8" />, title: 'Full Service', desc: 'Setup, service & cleanup' },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-lotus-cream rounded-xl">
                <div className="text-lotus-gold mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-lotus-dark mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catering Form */}
      <section className="py-12 lg:py-20">
        <div className="section-padding">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
              <h2 className="heading-sm text-lotus-dark mb-2 text-center">Catering</h2>
              <p className="text-gray-600 text-center mb-8">
                Please complete the form below to send us a catering request. We'll get back to you quickly!
              </p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-lotus-dark mb-2">Request Sent! 🎉</h3>
                  <p className="text-gray-600 mb-2">Your catering request has been submitted successfully.</p>
                  <p className="text-sm text-gray-500">A confirmation email has been sent to your inbox. Our team will follow up within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {sendError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{sendError}</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                        placeholder="(305) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                        min="10"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                        placeholder="Approximate number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                      >
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                        <option value="full-service">Full Service On-Site</option>
                      </select>
                    </div>
                  </div>

                  {(formData.serviceType === 'delivery' || formData.serviceType === 'full-service') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                        placeholder="Enter delivery address"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
                      placeholder="Tell us about your event, dietary requirements, menu preferences..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Catering Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-3xl mx-auto">
          <h2 className="heading-md mb-4">Need Help Planning Your Event?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our catering specialists are here to help you create the perfect menu for your occasion.
            Contact us directly for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:3057917755" className="btn-outline inline-flex items-center justify-center gap-2">
              Call (305) 791-7755
            </a>
            <a href="mailto:golden_lotusmiami@gmail.com" className="btn-outline inline-flex items-center justify-center gap-2">
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
