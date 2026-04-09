'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-green-600 text-green-300">
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white animate-neon-flicker">🎮 GGHub</h3>
            <p className="text-green-400 text-sm leading-relaxed">
              Your destination for premium gaming accessories with clear service and dependable support.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/boomdaddy001" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                <span className="sr-only">X</span>
                <svg className="h-6 w-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/gghub.official?igsh=cThrNzJ0b3p4N2Ji" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.428.403.58.214 1.005.472 1.445.912.44.44.698.865.912 1.445.163.458.349 1.258.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.428-.214.58-.472 1.005-.912 1.445-.44.44-.865.698-1.445.912-.458.163-1.258.349-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.428-.403-.58-.214-1.005-.472-1.445-.912-.44-.44-.698-.865-.912-1.445-.163-.458-.349-1.258-.403-2.428C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.428.214-.58.472-1.005.912-1.445.44-.44.865-.698 1.445-.912.458-.163 1.258-.349 2.428-.403C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.736 0 8.332.014 7.052.072 5.777.129 4.705.31 3.802.635 2.83 1.005 2.05 1.448 1.312 2.186.576 2.924.132 3.705-.238 4.677c-.325.903-.506 1.975-.563 3.25C-1.008 8.332-.994 8.736-.994 12s.014 3.668.072 4.948c.057 1.275.238 2.347.563 3.25.37.972.814 1.753 1.552 2.491.738.738 1.519 1.182 2.491 1.552.903.325 1.975.506 3.25.563C8.332 23.986 8.736 24 12 24s3.668-.014 4.948-.072c1.275-.057 2.347-.238 3.25-.563.972-.37 1.753-.814 2.491-1.552.738-.738 1.182-1.519 1.552-2.491.325-.903.506-1.975.563-3.25C23.986 15.668 24 15.263 24 12s-.014-3.668-.072-4.948c-.057-1.275-.238-2.347-.563-3.25-.37-.972-.814-1.753-1.552-2.491-.738-.738-1.519-1.182-2.491-1.552-.903-.325-1.975-.506-3.25-.563C15.668.014 15.264 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@bignelz.exe?_r=1&_d=f13fihk2585009&sec_uid=MS4wLjABAAAAWzB9rG2FEsJK1kucQhkpV986GVLsAsNY8fscAk7lAMOKyzvvidTbvevUo0jP2fpJ&share_author_id=7523322473200124950&sharer_language=en&source=h5_m&u_code=el6laige97jfcc&timestamp=1775720008&user_id=7523322473200124950&sec_user_id=MS4wLjABAAAAWzB9rG2FEsJK1kucQhkpV986GVLsAsNY8fscAk7lAMOKyzvvidTbvevUo0jP2fpJ&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7625533682771085078&share_link_id=dc7cb79a-e2c6-4975-82ef-45f6ebb0f193&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                <span className="sr-only">TikTok</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.002 2.002c2.69 0 4.88 2.191 4.88 4.881 0 1.827-.996 3.408-2.469 4.346v1.796a3.976 3.976 0 01-6.52 3.167A3.978 3.978 0 016.48 8.88a3.979 3.979 0 013.255-3.889V2.002h2.267zm0 2.698v2.548a1.246 1.246 0 01-.556.1c-.688 0-1.248-.56-1.248-1.247 0-.688.56-1.248 1.248-1.248.185 0 .364.042.556.1zm2.435 7.896a1.646 1.646 0 011.646 1.646v3.62a1.646 1.646 0 01-1.646 1.646 1.646 1.646 0 01-1.646-1.646v-2.072a3.062 3.062 0 01-2.147.961 3.07 3.07 0 01-3.065-3.066 3.073 3.073 0 013.065-3.066c.756 0 1.459.274 2.01.732V12.596z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@gghub.official?si=9ZjofAbTxF-cO5YL" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-green-400 hover:text-green-300 transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-green-400 hover:text-green-300 transition-colors">About</Link></li>
              <li><a href="#products" className="text-green-400 hover:text-green-300 transition-colors">Products</a></li>
              <li><a href="#games" className="text-green-400 hover:text-green-300 transition-colors">Games</a></li>
              <li><Link href="/contact" className="text-green-400 hover:text-green-300 transition-colors">Contact</Link></li>
              <li><Link href="/account" className="text-green-400 hover:text-green-300 transition-colors">Account</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-green-400 hover:text-green-300 transition-colors">Contact Us</Link></li>
              <li><a href="#" className="text-green-400 hover:text-green-300 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-green-400 hover:text-green-300 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-green-400 hover:text-green-300 transition-colors">Returns</a></li>
              <li><a href="#" className="text-green-400 hover:text-green-300 transition-colors">Warranty</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-green-400 text-sm mb-4">Get the latest gaming gear drops and exclusive offers.</p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-slate-800 border border-green-600 rounded-md text-green-100 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="w-full bg-green-600 text-black px-4 py-2 rounded-md font-semibold hover:bg-green-500 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-green-600 mt-8 pt-8 text-center">
          <p className="text-green-400 text-sm">
            © 2026 GGHub. All rights reserved. Built for gamers with reliable support.
          </p>
        </div>
      </div>
    </footer>
  );
}