'use client';

import React, { useState } from 'react';
import { useAnnouncements, Announcement } from '@/contexts/AnnouncementsContext';
import { uploadAnnouncementImage } from '@/utils/supabase/storage';
import Image from 'next/image';

interface AnnouncementFormProps {
  announcement?: Announcement;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AnnouncementForm({
  announcement,
  onClose,
  onSuccess,
}: AnnouncementFormProps) {
  const { addAnnouncement, editAnnouncement } = useAnnouncements();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    message: announcement?.message || '',
    emoji: announcement?.emoji || '📢',
    image: announcement?.image || '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(
    announcement?.image || null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError('');

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const imageUrl = await uploadAnnouncementImage(file);
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
      }));
      setPreviewImage(imageUrl);
      setSuccess('✅ Image uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`❌ Image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.title) {
        throw new Error('Announcement title is required');
      }
      if (!formData.message) {
        throw new Error('Announcement message is required');
      }

      const announcementData = {
        title: formData.title,
        message: formData.message,
        emoji: formData.emoji,
        image: formData.image,
      };

      if (announcement) {
        await editAnnouncement(announcement.id, announcementData);
        setSuccess('✅ Announcement updated successfully');
      } else {
        await addAnnouncement(announcementData);
        setSuccess('✅ Announcement added successfully');
      }

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'An error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const emojis = ['📢', '🎉', '⭐', '🔥', '✨', '🚀', '🎮', '💝', '🏆', '❤️'];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-purple-600/30 rounded-2xl p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-purple-300 mb-6">
        {announcement ? '✏️ Edit Announcement' : '📝 Add New Announcement'}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-purple-600/20 border border-purple-600/50 rounded-lg text-purple-300">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-purple-300 font-semibold mb-2">Announcement Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-slate-800 border border-purple-600/30 rounded-lg text-purple-100 placeholder-purple-500/50 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="New sale, update, etc."
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-purple-300 font-semibold mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-purple-600/30 rounded-lg text-purple-100 placeholder-purple-500/50 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="Detailed announcement message..."
          />
        </div>

        {/* Emoji Picker */}
        <div>
          <label className="block text-purple-300 font-semibold mb-2">Select Emoji</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                className={`text-3xl p-2 rounded-lg transition-colors ${
                  formData.emoji === emoji
                    ? 'bg-purple-600'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-purple-200/70 text-sm mt-2">Selected: {formData.emoji}</p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-purple-300 font-semibold mb-2">Announcement Image (Optional)</label>
          <div className="border-2 border-dashed border-purple-600/30 rounded-lg p-6 text-center hover:border-purple-600/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imageUploading ? (
                <div className="text-purple-300">📤 Uploading...</div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-purple-300 font-semibold">Click to upload or drag and drop</p>
                  <p className="text-purple-200/70 text-sm">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </label>
          </div>

          {previewImage && (
            <div className="mt-4">
              <p className="text-purple-300 font-semibold mb-2">Preview:</p>
              <Image
                src={previewImage}
                alt="Preview"
                width={200}
                height={200}
                className="rounded-lg border border-purple-600/30"
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading || imageUploading}
          className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '⏳ Saving...' : announcement ? '✏️ Update Announcement' : '📝 Add Announcement'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 text-purple-300 font-bold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
