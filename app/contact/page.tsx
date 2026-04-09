'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useContact } from '../../contexts/ContactContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { addMessage } = useContact();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save the message for admin review
      addMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-green-900/20">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              GGHub
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-green-300 hover:text-green-100 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-green-300 hover:text-green-100 transition-colors">
                About
              </Link>
              <Link href="/#products" className="text-green-300 hover:text-green-100 transition-colors">
                Products
              </Link>
              <Link href="/#games" className="text-green-300 hover:text-green-100 transition-colors">
                Games
              </Link>
              <Link href="/account" className="text-green-300 hover:text-green-100 transition-colors">
                Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-green-100 mb-6">Contact Us</h1>
            <p className="text-xl text-green-300 max-w-2xl mx-auto">
              Need help with an order, account, or product question? We are here to provide clear support and fast service.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/80 backdrop-blur-sm rounded-3xl border border-green-500/30 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-green-100">Send Us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-green-200 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-green-200 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-green-200 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="account-help">Account Help</option>
                    <option value="order-issue">Order Issue</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-green-200 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-900/50 border border-green-500/30 rounded-2xl text-green-200 text-center">
                    ✅ Message sent successfully! We&apos;ll get back to you within 24 hours.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-900/50 border border-red-500/30 rounded-2xl text-red-200 text-center">
                    ❌ Failed to send message. Please try again or contact us directly.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-black/80 backdrop-blur-sm rounded-3xl border border-green-500/30 p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-green-100">Get in Touch</h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h3 className="font-semibold text-green-100">Email Support</h3>
                      <p className="text-green-300 text-sm"><a href="mailto:gghub.support@gmail.com" className="hover:text-green-100 transition-colors">gghub.support@gmail.com</a></p>
                      <p className="text-green-400 text-xs mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📱</div>
                    <div>
                      <h3 className="font-semibold text-green-100">Phone Support</h3>
                      <p className="text-green-300 text-sm"><a href="tel:+2349061889700" className="hover:text-green-100 transition-colors">+234 906 188 9700</a></p>
                      <p className="text-green-400 text-xs mt-1">Available 9 AM - 9 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">💬</div>
                    <div>
                      <h3 className="font-semibold text-green-100">WhatsApp Chat</h3>
                      <p className="text-green-300 text-sm"><a href="https://wa.me/2349061889700" target="_blank" rel="noopener noreferrer" className="hover:text-green-100 transition-colors">Chat with us on WhatsApp</a></p>
                      <p className="text-green-400 text-xs mt-1">Quick responses and direct support</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📱</div>
                    <div>
                      <h3 className="font-semibold text-green-100">Social Media</h3>
                      <p className="text-green-300 text-sm">Follow us for updates</p>
                      <div className="flex space-x-3 mt-2">
                        <a href="https://x.com/boomdaddy001" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                          <span className="sr-only">X</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                        <a href="https://www.instagram.com/gghub.official?igsh=cThrNzJ0b3p4N2Ji" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                          <span className="sr-only">Instagram</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.428.403.58.214 1.005.472 1.445.912.44.44.698.865.912 1.445.163.458.349 1.258.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.428-.214.58-.472 1.005-.912 1.445-.44.44-.865.698-1.445.912-.458.163-1.258.349-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.428-.403-.58-.214-1.005-.472-1.445-.912-.44-.44-.698-.865-.912-1.445-.163-.458-.349-1.258-.403-2.428C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.428.214-.58.472-1.005.912-1.445.44-.44.865-.698 1.445-.912.458-.163 1.258-.349 2.428-.403C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.736 0 8.332.014 7.052.072 5.777.129 4.705.31 3.802.635 2.83 1.005 2.05 1.448 1.312 2.186.576 2.924.132 3.705-.238 4.677c-.325.903-.506 1.975-.563 3.25C-1.008 8.332-.994 8.736-.994 12s.014 3.668.072 4.948c.057 1.275.238 2.347.563 3.25.37.972.814 1.753 1.552 2.491.738.738 1.519 1.182 2.491 1.552.903.325 1.975.506 3.25.563C8.332 23.986 8.736 24 12 24s3.668-.014 4.948-.072c1.275-.057 2.347-.238 3.25-.563.972-.37 1.753-.814 2.491-1.552.738-.738 1.182-1.519 1.552-2.491.325-.903.506-1.975.563-3.25C23.986 15.668 24 15.263 24 12s-.014-3.668-.072-4.948c-.057-1.275-.238-2.347-.563-3.25-.37-.972-.814-1.753-1.552-2.491-.738-.738-1.519-1.182-2.491-1.552-.903-.325-1.975-.506-3.25-.563C15.668.014 15.264 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                          </svg>
                        </a>
                        <a href="https://www.tiktok.com/@bignelz.exe?_r=1&_d=f13fihk2585009&sec_uid=MS4wLjABAAAAWzB9rG2FEsJK1kucQhkpV986GVLsAsNY8fscAk7lAMOKyzvvidTbvevUo0jP2fpJ&share_author_id=7523322473200124950&sharer_language=en&source=h5_m&u_code=el6laige97jfcc&timestamp=1775720008&user_id=7523322473200124950&sec_user_id=MS4wLjABAAAAWzB9rG2FEsJK1kucQhkpV986GVLsAsNY8fscAk7lAMOKyzvvidTbvevUo0jP2fpJ&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7625533682771085078&share_link_id=dc7cb79a-e2c6-4975-82ef-45f6ebb0f193&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                          <span className="sr-only">TikTok</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.002 2.002c2.69 0 4.88 2.191 4.88 4.881 0 1.827-.996 3.408-2.469 4.346v1.796a3.976 3.976 0 01-6.52 3.167A3.978 3.978 0 016.48 8.88a3.979 3.979 0 013.255-3.889V2.002h2.267zm0 2.698v2.548a1.246 1.246 0 01-.556.1c-.688 0-1.248-.56-1.248-1.247 0-.688.56-1.248 1.248-1.248.185 0 .364.042.556.1zm2.435 7.896a1.646 1.646 0 011.646 1.646v3.62a1.646 1.646 0 01-1.646 1.646 1.646 1.646 0 01-1.646-1.646v-2.072a3.062 3.062 0 01-2.147.961 3.07 3.07 0 01-3.065-3.066 3.073 3.073 0 013.065-3.066c.756 0 1.459.274 2.01.732V12.596z"/>
                          </svg>
                        </a>
                        <a href="https://youtube.com/@gghub.official?si=9ZjofAbTxF-cO5YL" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                          <span className="sr-only">YouTube</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-black/80 backdrop-blur-sm rounded-3xl border border-green-500/30 p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-green-100">Frequently Asked Questions</h2>

                <div className="space-y-4">
                  <div className="border-b border-green-500/20 pb-4">
                    <h3 className="font-semibold text-green-100 mb-2">How do I track my order?</h3>
                    <p className="text-green-300 text-sm">Check your account dashboard or contact support with your order number.</p>
                  </div>

                  <div className="border-b border-green-500/20 pb-4">
                    <h3 className="font-semibold text-green-100 mb-2">What&apos;s your return policy?</h3>
                    <p className="text-green-300 text-sm">30-day returns on unused items. Contact us to initiate a return.</p>
                  </div>

                  <div className="border-b border-green-500/20 pb-4">
                    <h3 className="font-semibold text-green-100 mb-2">Do you offer warranty?</h3>
                    <p className="text-green-300 text-sm">Yes, all products come with manufacturer warranty. Gaming accessories have 1-year coverage.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-100 mb-2">How do I reset my password?</h3>
                    <p className="text-green-300 text-sm">Use the &quot;Forgot Password&quot; link on the login page or contact support.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}