'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, Product } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAnnouncements, Announcement } from '../../contexts/AnnouncementsContext';
import { useContact } from '../../contexts/ContactContext';
import { formatNairaPrice } from '../../utils/currency';
import Image from 'next/image';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const { products, addProduct, editProduct, deleteProduct } = useProducts();
  const { announcements, addAnnouncement, editAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { messages, markMessageAsRead, deleteMessage } = useContact();
  const unreadCount = messages.filter((message) => !message.read).length;
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    trending: false,
  });
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', image: '' });
  const [announcementImagePreview, setAnnouncementImagePreview] = useState<string>('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, image: dataUrl });
        setProductImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnnouncementImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAnnouncementForm({ ...announcementForm, image: dataUrl });
        setAnnouncementImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, {
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image,
          description: formData.description,
          trending: formData.trending,
        });
        setEditingProduct(null);
      } else {
        await addProduct({
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image,
          description: formData.description,
          trending: formData.trending,
        });
      }
      setFormData({ name: '', price: '', image: '', description: '', trending: false });
      setProductImagePreview('');
    } catch (error) {
      console.error('Error saving product:', error);
      // You could add error state here to show to user
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      description: product.description,
      trending: product.trending || false,
    });
    setProductImagePreview(product.image);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', image: '', description: '', trending: false });
    setProductImagePreview('');
  };

  const handleAnnouncementSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await editAnnouncement(editingAnnouncement.id, {
          title: announcementForm.title,
          message: announcementForm.message,
          image: announcementForm.image || undefined,
        });
        setEditingAnnouncement(null);
      } else {
        await addAnnouncement({
          title: announcementForm.title,
          message: announcementForm.message,
          image: announcementForm.image || undefined,
        });
      }
      setAnnouncementForm({ title: '', message: '', image: '' });
      setAnnouncementImagePreview('');
    } catch (error) {
      console.error('Error saving announcement:', error);
      // You could add error state here to show to user
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({ title: announcement.title, message: announcement.message, image: announcement.image || '' });
    setAnnouncementImagePreview(announcement.image || '');
  };

  const handleCancelAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', message: '', image: '' });
    setAnnouncementImagePreview('');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Authenticated: <span className="font-semibold text-green-700">{isAuthenticated ? 'Yes' : 'No'}</span></p>
          </div>
          <button
            onClick={() => {
              signOut();
              router.replace('/admin/login');
            }}
            className="rounded-full bg-red-500 px-5 py-2 text-white font-semibold hover:bg-red-600"
          >
            Log Out
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 file:bg-blue-500 file:text-white file:border-0 file:px-3 file:py-1 file:rounded file:cursor-pointer"
              />
              {productImagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <Image
                    src={productImagePreview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="h-40 w-auto rounded border border-gray-300 object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="trending"
                checked={formData.trending}
                onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                className="h-4 w-4 text-blue-500 cursor-pointer"
              />
              <label htmlFor="trending" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                Mark as Trending Product (appears in homepage slideshow)
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <Image src={product.image} alt={product.name} width={64} height={64} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.trending && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Trending</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{formatNairaPrice(product.price)}</p>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Customer Messages</h2>
              <p className="text-sm text-gray-600">{messages.length} messages · {unreadCount} unread</p>
            </div>
          </div>
          {messages.length === 0 ? (
            <p className="text-gray-600">No messages yet. Incoming contact form submissions will appear here for review.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-gray-200 p-4 shadow-sm bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                      <h3 className="text-lg font-semibold text-gray-800 mt-2">{msg.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">From {msg.name} • {msg.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!msg.read && (
                        <span className="rounded-full bg-emerald-600 text-white text-xs uppercase px-2 py-1">New</span>
                      )}
                      <button
                        type="button"
                        onClick={() => markMessageAsRead(msg.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessage(msg.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 rounded-lg shadow-2xl border border-green-500">
          <h2 className="text-xl font-semibold mb-4 text-green-300">Announcements</h2>
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-green-200">Title</label>
              <input
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                className="mt-1 block w-full border border-green-500 bg-black text-green-100 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-200">Message</label>
              <textarea
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                className="mt-1 block w-full border border-green-500 bg-black text-green-100 rounded-md shadow-sm p-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-200">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAnnouncementImageUpload}
                className="mt-1 block w-full border border-green-500 bg-black text-green-100 rounded-md shadow-sm p-2 file:bg-green-600 file:text-black file:border-0 file:px-3 file:py-1 file:rounded file:cursor-pointer"
              />
              {announcementImagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-green-300 mb-2">Preview:</p>
                  <Image
                    src={announcementImagePreview}
                    alt="Preview"
                    width={200}
                    height={100}
                    className="h-24 w-auto rounded border border-green-500 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="bg-green-600 text-black px-4 py-2 rounded hover:bg-green-500"
              >
                {editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
              </button>
              {editingAnnouncement && (
                <button
                  type="button"
                  onClick={handleCancelAnnouncement}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {announcements.length === 0 ? (
            <p className="text-green-200">No announcements yet. Add an epic message and optional image to hype up the shop.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-green-700 bg-slate-950 p-4 shadow-inner">
                  {announcement.image && (
                    <Image
                      src={announcement.image}
                      alt={announcement.title}
                      width={400}
                      height={192}
                      className="mb-4 h-48 w-full rounded object-cover border border-green-700"
                    />
                  )}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-green-200 text-lg">{announcement.title}</h3>
                      <p className="text-sm text-green-100 mt-2">{announcement.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}