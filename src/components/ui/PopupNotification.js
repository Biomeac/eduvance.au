// components/ui/PopupNotification.js
"use client"; // This component needs to be a client component as it uses useState, useEffect, and ReactDOM

import React, { useState, useEffect, useCallback, useContext } from 'react';
import ReactDOM from 'react-dom'; // Required for createPortal

// 1. Create the Popup Context
// This context will hold the `showPopup` function, allowing any component
// wrapped by the PopupManager to trigger a pop-up without prop drilling.
export const PopupContext = React.createContext(null); // Set default to null for stricter check

// 2. Custom Hook to use the Popup Context
// This hook provides a clean way for components to access the `showPopup` function.
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === null) {
    // This error helps diagnose if PopupManager is not wrapping the component tree
    throw new Error('usePopup must be used within a PopupManager provider.');
  }
  return context;
};

// 3. PopupManager Component
// This component manages the state and rendering of the pop-up.
// It should be placed high in your component tree (e.g., in layout.js or _app.js).
const PopupManager = ({ children }) => {
  // State to hold the current pop-up's data.
  // It will be null when no pop-up is active.
  const [popup, setPopup] = useState(null); // { message, type, duration, title, subText, iconSvg, bgColor, textColor, iconColor }

  // useCallback to memoize the showPopup function.
  // This prevents unnecessary re-renders of components that use this function.
  const showPopup = useCallback(({
    type,        // A predefined string that maps to a specific pop-up configuration
    subText = '', // Optional custom sub-text to override or append to default
    duration = 3000 // How long the pop-up stays visible in milliseconds (0 for indefinite)
  }) => {
    let title = '';         // Main heading of the pop-up
    let defaultSubText = ''; // Default sub-text for the pop-up type
    let bgColor = '';       // Tailwind CSS background color class for the pop-up
    let textColor = 'text-gray-800'; // Default text color for lighter backgrounds
    let iconSvg = null;     // React SVG element for the icon
    let iconColor = '';     // Tailwind CSS text color class for the icon

    // Define pop-up configurations based on the 'type'
    // Each case sets the title, default subText, colors, and the icon.
    switch (type) {
      case 'loginSuccess':
        title = 'Successfully Logged In!';
        defaultSubText = subText || 'Welcome back to Eduvance.';
        bgColor = 'bg-green-100'; // Lighter shade
        iconColor = 'text-green-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>; // Checkmark
        break;
      case 'logoutSuccess':
        title = 'Successfully Logged Out.';
        defaultSubText = subText || 'You have been logged out of your account.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; // Cross
        break;
      case 'resourceEdited':
        title = 'Resource Updated!';
        defaultSubText = subText || 'Changes to the resource have been saved.';
        bgColor = 'bg-blue-100'; // Lighter shade
        iconColor = 'text-blue-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.232 3.768z" /></svg>; // Edit/pen icon
        break;
      case 'uploadSuccess':
        title = 'Resource Uploaded!';
        defaultSubText = subText || 'Your resource is now pending approval.';
        bgColor = 'bg-green-100'; // Lighter shade
        iconColor = 'text-green-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>; // Upload icon
        break;
      case 'approveSuccess':
        title = 'Resource Approved!';
        defaultSubText = subText || 'The resource has been moved to pending section.';
        bgColor = 'bg-green-100'; // Lighter shade
        iconColor = 'text-green-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>; // Checkmark icon
        break;
      case 'fetchError': // General error for API calls, Supabase, etc.
        title = 'Operation Failed!';
        defaultSubText = subText || 'There was an error processing your request. Please try again later.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Alert circle icon
        break;
      case 'validationError': // For form validation issues
        title = 'Input Error!';
        defaultSubText = subText || 'Please fill all required fields correctly.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Alert circle icon
        break;
      case 'watermarkSuccess':
        title = 'Watermark Successful!';
        defaultSubText = subText || 'Your watermarked PDF has been downloaded.';
        bgColor = 'bg-green-100'; // Lighter shade
        iconColor = 'text-green-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>; // Download icon
        break;
      case 'watermarkError':
        title = 'Watermark Failed!';
        defaultSubText = subText || 'There was an issue watermarking the file. Please try again.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Alert circle icon
        break;
      case 'rejectionReasonMissing':
        title = 'Rejection Failed!';
        defaultSubText = subText || 'Please provide a reason for rejection.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Alert circle icon
        break;
      case 'rejectSuccess':
        title = 'Resource Rejected!';
        defaultSubText = subText || 'The resource has been removed from pending.';
        bgColor = 'bg-red-100'; // Lighter shade
        iconColor = 'text-red-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; // Cross icon
        break;
      default: // Generic fallback notification
        title = 'Notification';
        defaultSubText = subText || 'Something happened.';
        bgColor = 'bg-gray-100'; // Lighter shade
        iconColor = 'text-gray-700'; // Darker icon color
        iconSvg = <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Info circle icon
    }

    // Set the pop-up state, which will trigger a re-render and display the pop-up.
    setPopup({
      title,
      subText: defaultSubText,
      type,
      duration,
      bgColor,
      textColor,
      iconSvg,
      iconColor // Pass the specific icon color
    });
  }, []); // Empty dependency array ensures showPopup is stable

  // useEffect to automatically hide the pop-up after its `duration`.
  // If duration is 0, the pop-up stays indefinitely (e.g., for user dismissal).
  useEffect(() => {
    if (popup && popup.duration > 0) {
      const timer = setTimeout(() => {
        setPopup(null); // Clear the pop-up state, effectively hiding it
      }, popup.duration);
      return () => clearTimeout(timer); // Cleanup the timer on unmount or if popup changes
    }
  }, [popup]); // Effect runs whenever the `popup` state changes

  // Function to render the pop-up's visual content.
  const renderPopupContent = () => {
    if (!popup) return null; // Don't render if no pop-up is active

    // Determine a lighter shade for the icon's background based on the main background color.
    // This is now fixed to a very light shade, e.g., 'bg-green-50' for green popups
    let lightShadeBg = '';
    if (popup.bgColor.includes('green')) lightShadeBg = 'bg-green-50';
    else if (popup.bgColor.includes('red')) lightShadeBg = 'bg-red-50';
    else if (popup.bgColor.includes('blue')) lightShadeBg = 'bg-blue-50';
    else if (popup.bgColor.includes('gray')) lightShadeBg = 'bg-gray-50';
    else lightShadeBg = 'bg-gray-50'; // Default light shade for unknown types

    return (
      <div
        className={`fixed top-4 right-4 z-[1000] p-3 rounded-xl shadow-lg flex items-center ${popup.bgColor} ${popup.textColor} animate-slide-in-from-right`}
        // Ensure pop-ups are wider and less tall, and use Poppins font.
        style={{ fontFamily: 'Poppins, sans-serif', minWidth: '350px', maxWidth: '500px' }}
      >
        {/* Icon Square: Light shade background with primary color icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${lightShadeBg} mr-3`}>
          {/* Use the specific iconColor class */}
          {React.cloneElement(popup.iconSvg, { className: `w-6 h-6 ${popup.iconColor}` })}
        </div>

        {/* Text Content: Header (semibold) and Sub-text (medium) */}
        <div className="flex-grow">
          <h3 className="font-semibold text-base leading-tight">{popup.title}</h3>
          <p className="text-sm leading-tight mt-0.5">{popup.subText}</p>
        </div>
      </div>
    );
  };

  // The PopupManager itself renders its children, and then uses a Portal
  // to render the actual pop-up notification outside the main DOM flow.
  // This prevents z-index and overflow issues from parent components.
  return (
    <PopupContext.Provider value={showPopup}>
      {children} {/* Renders the rest of your application */}
      {/* Conditionally render the portal if a popup is active */}
      {popup && ReactDOM.createPortal(
        renderPopupContent(),
        document.body // Appends the popup directly to the <body> element
      )}
    </PopupContext.Provider>
  );
};

export default PopupManager;