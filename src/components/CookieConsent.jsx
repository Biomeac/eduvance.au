"use client";
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }));
    setShowBanner(false);
    // Here you would initialize tracking scripts
    initializeTracking();
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', 'necessary');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }));
    setShowBanner(false);
  };

  const savePreferences = (preferences) => {
    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowDetails(false);
    
    // Initialize tracking based on preferences
    if (preferences.analytics || preferences.marketing) {
      initializeTracking();
    }
  };

  const initializeTracking = () => {
    // Initialize Google Analytics, Facebook Pixel, etc.
    // This is where you would add your tracking scripts
    console.log('Tracking initialized based on user consent');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-6xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies to enhance your experience
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to provide you with the best possible experience on our website. 
                Some cookies are necessary for the site to function, while others help us understand 
                how you use our site so we can improve it.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Customize
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <CookiePreferences onSave={savePreferences} onCancel={() => setShowDetails(false)} />
        )}
      </div>
    </div>
  );
};

const CookiePreferences = ({ onSave, onCancel }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  const handleToggle = (type) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
      
      <div className="space-y-4">
        <CookieCategory
          title="Necessary Cookies"
          description="These cookies are essential for the website to function properly. They cannot be disabled."
          enabled={preferences.necessary}
          onToggle={() => handleToggle('necessary')}
          disabled={true}
        />
        
        <CookieCategory
          title="Analytics Cookies"
          description="These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously."
          enabled={preferences.analytics}
          onToggle={() => handleToggle('analytics')}
        />
        
        <CookieCategory
          title="Marketing Cookies"
          description="These cookies are used to track visitors across websites to display relevant and engaging advertisements."
          enabled={preferences.marketing}
          onToggle={() => handleToggle('marketing')}
        />
        
        <CookieCategory
          title="Functional Cookies"
          description="These cookies enable enhanced functionality and personalization, such as remembering your preferences."
          enabled={preferences.functional}
          onToggle={() => handleToggle('functional')}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

const CookieCategory = ({ title, description, enabled, onToggle, disabled = false }) => (
  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex-1 mr-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
      />
    </label>
  </div>
);

export default CookieConsent;
