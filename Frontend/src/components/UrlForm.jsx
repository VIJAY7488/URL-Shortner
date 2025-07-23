import React, { useState, useContext, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { usePublicUrl } from '../api/PublicUrlApi';
import { AuthContext } from '../context/AuthContext';
import { useUserUrl } from '../api/UserUrl';
import ShortUrl from './ShortUrl';
import { useNavigate } from 'react-router-dom';

// Custom hook for form state management
const useFormState = () => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    customUrl: '',
    passwordForUrl: '',
    expirationTime: null
  });
  
  const [options, setOptions] = useState({
    isOneTime: false,
    showAdvancedOptions: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateOptions = useCallback((field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(prev => ({ ...prev, originalUrl: '', title: '' }));
  }, []);

  return {
    formData,
    options,
    isLoading,
    updateFormData,
    updateOptions,
    setIsLoading,
    resetForm
  };
};

// Memoized form field component
const FormField = React.memo(({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  min,
  prefix 
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-lg font-semibold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
      {label}
    </Label>
    {prefix ? (
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-white border border-r-0 border-gray-300 rounded-l-md bg-pink-500">
          {prefix}
        </span>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          required={required}
          className="rounded-l-none flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
        />
      </div>
    ) : (
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        required={required}
        className="flex-1 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
      />
    )}
  </div>
));

FormField.displayName = 'FormField';

// Memoized switch field component
const SwitchField = React.memo(({ id, label, checked, onChange, className = "" }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
    <Label htmlFor={id} className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
      {label}
    </Label>
  </div>
));

SwitchField.displayName = 'SwitchField';

const UrlForm = () => {
  const {
    formData,
    options,
    isLoading,
    updateFormData,
    updateOptions,
    setIsLoading,
    resetForm
  } = useFormState();

  const { generatePublicUrl } = usePublicUrl();
  const { generateUserUrl } = useUserUrl();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Memoize form handlers
  const handleFormDataChange = useCallback((field) => (e) => {
    updateFormData(field, e.target.value);
  }, [updateFormData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.originalUrl) return;

    setIsLoading(true);

    try {
      if (isAuthenticated) {
        await generateUserUrl(
          formData.originalUrl,
          formData.title,
          formData.customUrl,
          formData.passwordForUrl,
          options.isOneTime,
          formData.expirationTime
        );
      } else {
        await generatePublicUrl(formData.originalUrl);
      }
      resetForm();
    } catch (error) {
      console.error('URL generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    options.isOneTime,
    isAuthenticated,
    generateUserUrl,
    generatePublicUrl,
    resetForm,
    setIsLoading
  ]);

  const handleAdvancedToggle = useCallback((checked) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    updateOptions('showAdvancedOptions', checked);
  }, [isAuthenticated, navigate, updateOptions]);

  const handleOneTimeToggle = useCallback((checked) => {
    updateOptions('isOneTime', checked);
  }, [updateOptions]);

  // Memoize button state
  const isSubmitDisabled = useMemo(() => 
    isLoading || !formData.originalUrl.trim(), 
    [isLoading, formData.originalUrl]
  );

  // Memoize button text
  const buttonText = useMemo(() => 
    isLoading ? 'Shortening...' : 'Shorten URL', 
    [isLoading]
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-white/20 shadow-2xl bg-black/40 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg text-white">
            Shorten your link instantly
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              id="url"
              label="Enter your long URL"
              type="url"
              placeholder="https://example.com/very-long-url"
              value={formData.originalUrl}
              onChange={handleFormDataChange('originalUrl')}
              required
            />

            {/* Advanced Options */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Advanced Options
                </h3>
                <Switch
                  id="advanced-options-toggle"
                  checked={options.showAdvancedOptions}
                  onCheckedChange={handleAdvancedToggle}
                />
              </div>
              
              {options.showAdvancedOptions && (
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    id="title"
                    label="Custom Title"
                    placeholder="My awesome link"
                    value={formData.title}
                    onChange={handleFormDataChange('title')}
                  />

                  <FormField
                    id="custom-url"
                    label="Custom URL"
                    placeholder="my-link"
                    value={formData.customUrl}
                    onChange={handleFormDataChange('customUrl')}
                    prefix="https://tinylink"
                  />

                  <FormField
                    id="password"
                    label="Password Protection"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleFormDataChange('password')}
                  />

                  <FormField
                    id="expiration-time"
                    label="Expiration Time (minutes)"
                    type="number"
                    placeholder="60"
                    min="1"
                    value={formData.expirationTime}
                    onChange={handleFormDataChange('expirationTime')}
                  />

                  <SwitchField
                    id="one-time"
                    label="Single-use URL (link expires after first click)"
                    checked={options.isOneTime}
                    onChange={handleOneTimeToggle}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {buttonText}
            </Button>
          </form>
          <ShortUrl />
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlForm;