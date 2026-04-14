import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminFetch } from '../../utils';

interface Settings {
  freeShippingThreshold: number;
  shippingCharge: number;
  taxRate: number;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    freeShippingThreshold: 299,
    shippingCharge: 49,
    taxRate: 0,
    storeName: 'Nut Baba',
    storeEmail: 'nutbaba2026@gmail.com',
    storePhone: '+91 98765 43210',
    storeAddress:
      'Unit No. 1031, Tower-A, Floor 10th, I-Thum Tower, Sector-62, Noida, Gautam Buddha Nagar (Uttar Pradesh) - 201301',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminFetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Shipping Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold (Rs.)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: parseFloat(e.target.value),
                  })
                }
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Orders above this amount get free shipping
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Charge (Rs.)
              </label>
              <input
                type="number"
                value={settings.shippingCharge}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shippingCharge: parseFloat(e.target.value),
                  })
                }
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Applied when order is below free shipping threshold
              </p>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tax Settings</h2>
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  taxRate: parseFloat(e.target.value),
                })
              }
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Applied to all orders (0 for no tax)
            </p>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Store Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings({ ...settings, storeName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) =>
                  setSettings({ ...settings, storeEmail: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Phone
              </label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) =>
                  setSettings({ ...settings, storePhone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address
              </label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) =>
                  setSettings({ ...settings, storeAddress: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveSuccess && (
            <span className="text-green-600 font-medium">Settings saved successfully!</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;
