import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { usePublicUrl } from '../api/PublicUrlApi';
import { UrlContext } from '../context/UrlContext';
import { AuthContext } from '../context/AuthContext';
import { useUserUrl } from '../api/UserUrl';
import ShortUrl from './ShortUrl';
import { Navigate, useNavigate } from 'react-router-dom';

const UrlForm = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [password, setPassword] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [expirationTime, setExpirationTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { generatePublicUrl } = usePublicUrl();
  const { generateUserUrl } = useUserUrl();
  const { error } = useContext(UrlContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setIsLoading(true);


    try {
      if(isAuthenticated){
        await generateUserUrl(originalUrl, title, customUrl, password, isOneTime, expirationTime);
        setOriginalUrl('');
      } 
      else{
        await generatePublicUrl(originalUrl);
        setOriginalUrl('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(isAuthenticated === false && showAdvancedOptions){
      navigate('/login');
    }
  }, [isAuthenticated, showAdvancedOptions, navigate])

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-white/20 shadow-2xl bg-black/40 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg text-white">
            Shorten your link instantly
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="url" className="text-lg font-semibold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Enter your long URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                required
              />
            </div>

          {/* Advanced Options */}
          <div className='space-y-4 border-t border-border pt-6'>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Advanced Options
              </h3>
              <Switch
                id="custom-title-toggle"
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
              />
            </div>
            
            {showAdvancedOptions && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
                  Custom Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="My awesome link"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400'
                  />
                </div>
          
                <div className="space-y-2">  
                  <Label htmlFor="custom" className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
                    Custom URL  
                  </Label>  
                  <div className="flex">  
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                      https://tinylink  
                    </span>  
                    <Input  
                      id="custom"  
                      placeholder="my-link"  
                      value={customUrl}  
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="rounded-l-none flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                    />  
                  </div>  
                </div>  

                <div className="space-y-2">
                  <Label htmlFor="password" className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
                    Password Protection
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400'
                  />
                </div>

                <div className="space-y-2">
                  <Label className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
                    Expiration Time (minutes)
                  </Label>
                  <Input
                    id="expirationTime"
                    placeholder="60"
                    value={expirationTime}
                    onChange={(e) => setExpirationTime(e.target.value)}
                    className='flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400'
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="one-time"
                    checked={isOneTime}
                    onCheckedChange={setIsOneTime}
                  />
                  <Label htmlFor="one-time" className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
                    Single-use URL (link expires after first click)
                  </Label>
                </div>
              </div>
            )}
          </div>

        <Button
          type="submit"
          disabled={isLoading || !originalUrl}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? 'Shortening...' : 'Shorten URL'}
        </Button>
          </form>
          <ShortUrl />
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlForm;
