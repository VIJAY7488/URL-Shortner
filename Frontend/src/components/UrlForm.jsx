import React, { useContext, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { usePublicUrl } from '../api/PublicUrlApi';
import { UrlContext } from '../context/UrlContext';
import { AuthContext } from '../context/AuthContext';
import { useUserUrl } from '../api/UserUrl';

const UrlForm = () => {
  const [formUrl, setFormUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [alias, setAlias] = useState('');
  const [domain, setDomain] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [oneTimeUse, setOneTimeUse] = useState(false);
  const [password, setPassword] = useState('');
  const { generatePublicUrl } = usePublicUrl();
  const { generateUserUrl } = useUserUrl();
  const { error } = useContext(UrlContext);
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    try {
      if(isAuthenticated){
        await generateUserUrl(formUrl);
      } 
      else{
        await generatePublicUrl(formUrl);
      }
    } catch (error) {
      // setError('Failed to generate public URL.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="url" className="text-lg font-semibold">
                Enter your long URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very-long-url"
                // value={originalUrl}
                // onChange={(e) => setOriginalUrl(e.target.value)}
                className="text-lg py-3"
                required
              />
            {/* <input
              type="text"
              placeholder="Enter long link here"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            /> */}
        </div>

        {/* Advanced Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Custom Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My awesome link"
              // value={title}
              // onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom">Custom URL (Optional)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                short.ly/
              </span>
              <Input
                id="custom"
                placeholder="my-link"
                // value={customUrl}
                // onChange={(e) => setCustomUrl(e.target.value)}
                className="rounded-l-none"
              />
            </div>
            {/* <input
              type="text"
              placeholder="Enter your domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            /> */}
            {/* <input
              type="text"
              placeholder="Enter alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            /> */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password Protection (Optional)
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Expiration Time (minutes)</Label>
            <Input
              // id="title"
              placeholder="60"
              // value={title}
              // onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="one-time"
            // checked={isOneTime}
            // onCheckedChange={setIsOneTime}
          />
          <Label htmlFor="one-time">Single-use URL (link expires after first click)</Label>
        </div>

        <Button
          type="submit"
          // disabled={isLoading || !originalUrl}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* {isLoading ? 'Shortening...' : 'Shorten URL'} */}
        </Button>

        {/* Advanced Options Toggle */}
        {/* <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-600 hover:underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div> */}

        {/* Advanced Options */}
        {/* {showAdvanced && (
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
        )} */}

        {/* <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg font-medium rounded-md py-3 transition duration-300 ease-in-out disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Shorten URL'}
        </button> */}

        {/* {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )} */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlForm;
