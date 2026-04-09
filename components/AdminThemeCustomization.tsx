'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeCustomizationForm } from '@/types/admin';

export const AdminThemeCustomization: React.FC = () => {
  const { theme, loading, error, updateTheme, resetTheme, previewTheme, clearError } = useTheme();

  const [formData, setFormData] = useState<ThemeCustomizationForm>({
    primary_color: theme?.primary_color || '#6366f1',
    secondary_color: theme?.secondary_color || '#1e293b',
    accent_color: theme?.accent_color || '#ec4899',
    font_family: theme?.font_family || 'Inter',
    layout_template: theme?.layout_template || 'default',
    dark_mode: theme?.dark_mode ?? true,
    sidebar_position: theme?.sidebar_position || 'left',
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleColorChange = (colorKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
    previewTheme({ [colorKey]: value });
  };

  const handleSelectChange = (
    key: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    previewTheme({ [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitError(null);
      await updateTheme(formData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update theme';
      setSubmitError(errorMessage);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset the theme to default settings?'
      )
    ) {
      try {
        setSubmitError(null);
        await resetTheme();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to reset theme';
        setSubmitError(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-gray-400">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Theme Customization</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
        >
          Reset to Default
        </button>
      </div>

      {(error || submitError) && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex justify-between items-start">
          <span>Error: {error || submitError}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Colors Section */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">🎨 Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'primary_color', label: 'Primary Color', desc: 'Main brand color' },
              { key: 'secondary_color', label: 'Secondary Color', desc: 'Background color' },
              { key: 'accent_color', label: 'Accent Color', desc: 'Highlight color' },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {label}
                </label>
                <p className="text-xs text-gray-400 mb-2">{desc}</p>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={
                      formData[key as keyof ThemeCustomizationForm] as string
                    }
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer border border-slate-600"
                  />
                  <input
                    type="text"
                    value={
                      formData[key as keyof ThemeCustomizationForm] as string
                    }
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">✍️ Typography</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Family
            </label>
            <select
              value={formData.font_family || 'Inter'}
              onChange={(e) =>
                handleSelectChange('font_family', e.target.value)
              }
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Ubuntu">Ubuntu</option>
              <option value="Fira Sans">Fira Sans</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>
        </div>

        {/* Layout Section */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">📐 Layout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Layout Template
              </label>
              <select
                value={formData.layout_template || 'default'}
                onChange={(e) =>
                  handleSelectChange('layout_template', e.target.value)
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="default">Default</option>
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sidebar Position
              </label>
              <select
                value={formData.sidebar_position || 'left'}
                onChange={(e) =>
                  handleSelectChange('sidebar_position', e.target.value)
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">🌙 Appearance</h3>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="dark_mode"
              checked={formData.dark_mode ?? true}
              onChange={(e) =>
                handleSelectChange('dark_mode', e.target.checked)
              }
              className="w-5 h-5 cursor-pointer"
            />
            <label htmlFor="dark_mode" className="text-gray-300">
              Dark Mode{' '}
              <span className="text-sm text-gray-500">
                (Recommended for gaming aesthetic)
              </span>
            </label>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">👁️ Preview</h3>
          <div
            style={{
              backgroundColor: formData.secondary_color,
            }}
            className="p-6 rounded-lg"
          >
            <button
              style={{
                backgroundColor: formData.primary_color,
              }}
              className="px-4 py-2 text-white rounded-lg transition"
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: formData.accent_color,
              }}
              className="px-4 py-2 text-white rounded-lg transition ml-3"
            >
              Accent Button
            </button>
            <p
              style={{
                fontFamily: formData.font_family,
              }}
              className="text-white mt-4"
            >
              This is how your text will look with the{' '}
              <strong>{formData.font_family}</strong> font family.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
          >
            💾 Save Theme
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                primary_color: '#6366f1',
                secondary_color: '#1e293b',
                accent_color: '#ec4899',
                font_family: 'Inter',
                layout_template: 'default',
                dark_mode: true,
                sidebar_position: 'left',
              });
              previewTheme({
                primary_color: '#6366f1',
                secondary_color: '#1e293b',
                accent_color: '#ec4899',
              });
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Theme Info */}
      <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 text-blue-100">
        <p className="text-sm">
          💡 <strong>Tip:</strong> Your theme preferences are saved to your profile and will be
          applied across all admin pages.
        </p>
      </div>
    </div>
  );
};
