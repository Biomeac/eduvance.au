"use client";
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Add a small delay for better UX
      setTimeout(() => setShowModal(true), 1000);
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
    setShowModal(false);
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
    setShowModal(false);
  };

  const savePreferences = (preferences) => {
    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowModal(false);
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

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        {!showDetails ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cookie Preferences
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to enhance your experience and analyze our traffic. 
                Choose your preferences below.
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Necessary</span>
                </div>
                <span className="text-xs text-gray-500">Always active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Analytics</span>
                </div>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">Marketing</span>
                </div>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={acceptAll}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Accept All Cookies
              </button>
              <button
                onClick={acceptNecessary}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Necessary Only
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="w-full text-blue-600 py-2 px-4 text-sm font-medium hover:text-blue-700 transition-colors duration-200"
              >
                Customize Preferences
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
    <div className="p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Customize Your Preferences
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Choose which cookies you'd like to allow. You can change these settings at any time.
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        <CookieCategory
          title="Necessary Cookies"
          description="Essential for the website to function properly. Cannot be disabled."
          enabled={preferences.necessary}
          onToggle={() => handleToggle('necessary')}
          disabled={true}
          color="green"
        />
        
        <CookieCategory
          title="Analytics Cookies"
          description="Help us understand how visitors interact with our website anonymously."
          enabled={preferences.analytics}
          onToggle={() => handleToggle('analytics')}
          color="blue"
        />
        
        <CookieCategory
          title="Marketing Cookies"
          description="Used to display relevant advertisements across websites."
          enabled={preferences.marketing}
          onToggle={() => handleToggle('marketing')}
          color="purple"
        />
        
        <CookieCategory
          title="Functional Cookies"
          description="Enable enhanced functionality and personalization features."
          enabled={preferences.functional}
          onToggle={() => handleToggle('functional')}
          color="orange"
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          Save Preferences
        </button>
        <button
          onClick={onCancel}
          className="w-full text-gray-600 py-2 px-4 text-sm font-medium hover:text-gray-700 transition-colors duration-200"
        >
          Back to Quick Options
        </button>
      </div>
    </div>
  );
};

const CookieCategory = ({ title, description, enabled, onToggle, disabled = false, color = "blue" }) => {
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500", 
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 ${colorClasses[color]} rounded-full mr-3`}></div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
              enabled ? 'bg-blue-600' : 'bg-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                enabled ? 'translate-x-6' : 'translate-x-0.5'
              } mt-0.5`}></div>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default CookieConsent;
