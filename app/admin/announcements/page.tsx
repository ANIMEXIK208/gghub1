'use client';

import React, { useState } from 'react';
import { useAnnouncements, Announcement } from '@/contexts/AnnouncementsContext';
import AdminAnnouncementForm from '@/components/AdminAnnouncementForm';
import Image from 'next/image';

export default function AdminAnnouncementsPage() {
  const { announcements, loading, deleteAnnouncement } = useAnnouncements();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAnnouncement(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-300">📢 Announcement Management</h1>
          <p className="text-purple-200/70 mt-2">Total Announcements: {announcements.length}</p>
        </div>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowForm(true);
          }}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors"
        >
          📝 Add New Announcement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <AdminAnnouncementForm
              announcement={editingAnnouncement || undefined}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-slate-950 border border-purple-600/30 rounded-2xl p-6">
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-purple-600/30 rounded-lg text-purple-100 placeholder-purple-500/50 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Announcements Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-950 border border-purple-600/30 rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-purple-300 mt-4">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-slate-950 border border-purple-600/30 rounded-2xl p-12 text-center">
            <p className="text-purple-200/70 text-lg">No announcements found</p>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setShowForm(true);
              }}
              className="mt-4 px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500"
            >
              📝 Add First Announcement
            </button>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <div
              key={announcement.id}
              className="bg-slate-950 border border-purple-600/30 rounded-2xl p-6 hover:border-purple-600/50 transition-colors"
            >
              <div className="flex gap-6">
                {/* Image */}
                {announcement.image && (
                  <div className="flex-shrink-0">
                    <Image
                      src={announcement.image}
                      alt={announcement.title}
                      width={150}
                      height={150}
                      className="rounded-lg border border-purple-600/30"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{announcement.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold text-purple-300">{announcement.title}</h3>
                        <p className="text-sm text-purple-200/70">ID: {announcement.id}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-purple-200 mb-4 line-clamp-2">{announcement.message}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/40 transition-colors font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(announcement.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/40 transition-colors font-semibold"
                    >
                      🗑️ Delete
                    </button>
                    {deleteConfirm === announcement.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-slate-700 text-purple-300 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-2xl p-6">
          <p className="text-purple-300 text-sm font-semibold">Total Announcements</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">{announcements.length}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-600/30 rounded-2xl p-6">
          <p className="text-pink-300 text-sm font-semibold">With Images</p>
          <p className="text-4xl font-bold text-pink-400 mt-2">{announcements.filter(a => a.image).length}</p>
        </div>
      </div>
    </div>
  );
}
