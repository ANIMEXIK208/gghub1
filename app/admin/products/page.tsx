'use client';

import React, { useState, Suspense } from 'react';
import { useProducts, Product } from '@/contexts/ProductContext';
import AdminProductForm from '@/components/AdminProductForm';
import Image from 'next/image';

export default function AdminProductsPage() {
  const { products, loading, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Accessories', 'Peripherals', 'Audio', 'Displays', 'Furniture', 'Systems', 'Controllers'];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-300">🛍️ Product Management</h1>
          <p className="text-green-200/70 mt-2">Total Products: {products.length}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 text-slate-900 font-bold rounded-lg hover:bg-green-500 transition-colors"
        >
          ➕ Add New Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <AdminProductForm
              product={editingProduct || undefined}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-slate-950 border border-green-600/30 rounded-2xl p-6 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-green-600/30 rounded-lg text-green-100 placeholder-green-500/50 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-colors ${
                filterCategory === category
                  ? 'bg-green-600 text-slate-900'
                  : 'bg-slate-800 text-green-300 hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-green-600/30 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-green-300 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-green-200/70 text-lg">No products found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-green-600 text-slate-900 font-bold rounded-lg hover:bg-green-500"
            >
              ➕ Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-green-600/30">
                <tr>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Image</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Price</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Rating</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-green-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-600/20">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-300">{product.name}</div>
                      <div className="text-sm text-green-200/70">{product.description.substring(0, 30)}...</div>
                    </td>
                    <td className="px-6 py-4 text-green-200">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-green-300">₦{product.price}</td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400">{'⭐'.repeat(Math.round(product.rating || 4.5))}</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.trending ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600/20 border border-yellow-600/50 rounded-full text-yellow-300 text-sm font-semibold">
                          ⭐ Trending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 border border-green-600/30 rounded-full text-green-300 text-sm">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/40 transition-colors font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/40 transition-colors font-semibold"
                      >
                        🗑️ Delete
                      </button>
                      {deleteConfirm === product.id && (
                        <div className="inline-flex gap-2 ml-2">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-sm font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-slate-700 text-green-300 rounded text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-2xl p-6">
          <p className="text-blue-300 text-sm font-semibold">Total Products</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-600/30 rounded-2xl p-6">
          <p className="text-yellow-300 text-sm font-semibold">Trending Items</p>
          <p className="text-4xl font-bold text-yellow-400 mt-2">{products.filter(p => p.trending).length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-2xl p-6">
          <p className="text-green-300 text-sm font-semibold">Avg Rating</p>
          <p className="text-4xl font-bold text-green-400 mt-2">
            {(products.reduce((sum, p) => sum + (p.rating || 4.5), 0) / products.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
