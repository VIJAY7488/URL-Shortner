import React, { useState } from 'react';
import { usePublicUrl } from '../api/PublicUrlApi';

const UrlForm = () => {
  const [formUrl, setFormUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [alias, setAlias] = useState('');
  const [domain, setDomain] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [oneTimeUse, setOneTimeUse] = useState(false);
  const [password, setPassword] = useState('');
  const { generatePublicUrl } = usePublicUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    try {
      await generatePublicUrl(formUrl); 
    } catch (error) {
      setError('Failed to generate public URL.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl px-8 py-10 space-y-6"
      >
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Shorten a Long URL
          </label>
          <input
            type="text"
            placeholder="Enter long link here"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Customize Your Link
          </label>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <input
              type="text"
              placeholder="Enter your domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Enter alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-600 hover:underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Time (in minutes)
              </label>
              <input
                type="number"
                min="1"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                placeholder="e.g. 60"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={oneTimeUse}
                onChange={(e) => setOneTimeUse(e.target.checked)}
                id="onetime"
                className="h-4 w-4 text-purple-600"
              />
              <label htmlFor="onetime" className="text-sm text-gray-700">
                One-time use only
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Protection (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg font-medium rounded-md py-3 transition duration-300 ease-in-out disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Shorten URL'}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </form>
    </div>
  );
};

export default UrlForm;
