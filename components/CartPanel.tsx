'use client';

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { formatNairaPrice } from '../utils/currency';
import Image from 'next/image';

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
}

interface DeliveryDetails {
  name: string;
  age: string;
  sex: string;
  location: string;
  phone: string;
}

export default function CartPanel({ open, onClose }: CartPanelProps) {
  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    name: '',
    age: '',
    sex: '',
    location: '',
    phone: '',
  });

  const createWhatsAppLink = (details: DeliveryDetails) => {
    const phone = '2349061889700'; // WhatsApp support number
    const lines = [
      'Hello GGHub, I would like to place an order.',
      '',
      '📋 DELIVERY DETAILS:',
      `Name: ${details.name}`,
      `Age: ${details.age}`,
      `Sex: ${details.sex}`,
      `Location: ${details.location}`,
      `Phone: ${details.phone}`,
      '',
      '🛒 ORDER ITEMS:',
      ...cartItems.map((item) =>
        `- ${item.product.name} x${item.quantity} @ ${formatNairaPrice(item.product.price)} = ${formatNairaPrice(
          item.product.price * item.quantity,
        )}`,
      ),
      '',
      `💰 TOTAL: ${formatNairaPrice(cartTotal)}`,
      '',
      'Please confirm receipt and payment details.',
    ];

    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${phone}?text=${text}`;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckoutForm(true);
  };

  const handlePlaceOrder = () => {
    if (!deliveryDetails.name || !deliveryDetails.age || !deliveryDetails.sex || !deliveryDetails.location || !deliveryDetails.phone) {
      alert('Please fill in all delivery details');
      return;
    }
    const url = createWhatsAppLink(deliveryDetails);
    window.open(url, '_blank');
    setShowCheckoutForm(false);
    clearCart();
    onClose();
  };

  const handleDetailChange = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-xl transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Checkout Form */}
      {showCheckoutForm ? (
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Delivery Details</h2>
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                value={deliveryDetails.name}
                onChange={(e) => handleDetailChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Age *</label>
              <input
                type="number"
                value={deliveryDetails.age}
                onChange={(e) => handleDetailChange('age', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Sex *</label>
              <select
                value={deliveryDetails.sex}
                onChange={(e) => handleDetailChange('sex', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location/Address *</label>
              <textarea
                value={deliveryDetails.location}
                onChange={(e) => handleDetailChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                placeholder="Enter your delivery location"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number *</label>
              <input
                type="tel"
                value={deliveryDetails.phone}
                onChange={(e) => handleDetailChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <div className="p-4 border-t space-y-2">
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-green-600 text-white px-4 py-3 rounded font-semibold hover:bg-green-700"
            >
              Place Order on WhatsApp
            </button>
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        // Cart View
        <>
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <p className="text-sm text-gray-600">{cartCount} item{cartCount === 1 ? '' : 's'}</p>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              Close
            </button>
          </div>
          <div className="bg-blue-50 border-b border-blue-100 p-4">
            <p className="text-sm text-gray-600">Order total for all goods</p>
            <p className="text-2xl font-bold text-blue-700">{formatNairaPrice(cartTotal)}</p>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            {cartItems.length === 0 ? (
              <div className="text-gray-600">Your cart is empty. Add products to see them here.</div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-start border-b pb-4">
                  <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Unit price: {formatNairaPrice(item.product.price)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-lg font-semibold hover:bg-gray-300"
                      >
                        -
                      </button>
                      <div className="inline-flex min-w-[3rem] items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        Qty {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-lg font-semibold hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">Item total: {formatNairaPrice(item.product.price * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{formatNairaPrice(cartTotal)}</span>
            </div>
            <button
              onClick={clearCart}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded mb-2 hover:bg-gray-300"
            >
              Clear Cart
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}