import React, { useState, useEffect } from 'react';

// A UI component for selecting between IALs and IGCSEs,
// which updates the URL and reloads the page.
//
// The component reads the URL to determine the initial selected state,
// and forces a full page reload upon button clicks to ensure content updates.
//
// Example URLs:
// http://localhost:3000/subjects/accounting/IAL/pastpapers
// http://localhost:3000/subjects/accounting/IGCSE/pastpapers

const ResourceSelector = ({ allowIAL = true }) => {
  // Use state to manage the currently selected option ('IAL' or 'IGCSE').
  // The initial state is determined from the current URL path.
  const [selected, setSelected] = useState('');

  // useEffect runs once when the component mounts to read the initial URL
  // and set the component's state accordingly.
  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');

    // Find the 'IAL' or 'IGCSE' segment and set the state.
    const selectedOption = segments.find(
      (segment) => segment.toUpperCase() === 'IAL' || segment.toUpperCase() === 'IGCSE'
    );

    if (selectedOption) {
      setSelected(selectedOption.toUpperCase());
    }
  }, []); // Empty dependency array ensures this effect runs only once.

  // A function to handle the button click. It updates the URL and reloads the page.
  const handleSelection = (newSelection) => {
    // Get the current path from the window object.
    const path = window.location.pathname;

    // Split the path into segments.
    // Example: ['','subjects','accounting','IAL','pastpapers']
    const segments = path.split('/');

    // Find the index of the segment that is either 'IAL' or 'IGCSE'.
    const indexToReplace = segments.findIndex(
      (segment) => segment.toUpperCase() === 'IAL' || segment.toUpperCase() === 'IGCSE'
    );

    // If the segment is found, replace it with the new selection.
    if (indexToReplace !== -1) {
      segments[indexToReplace] = newSelection.toUpperCase();

      // Rejoin the segments to create the new path.
      // Example: ['','subjects','accounting','igcse','pastpapers'] becomes '/subjects/accounting/igcse/pastpapers'
      const newPath = segments.join('/');

      // Construct the full new URL.
      const newUrl = `${window.location.origin}${newPath}`;

      // Force a full page reload to load the new content.
      window.location.assign(newUrl);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <h2 className="text-xl font-semibold mb-4 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Qualification
      </h2>
      <div className="flex space-x-4">
        <button
          onClick={allowIAL ? () => handleSelection('IAL') : null}
          className={`px-4 py-2 mb-6 rounded-lg transition
          ${selected === 'IAL' && allowIAL ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-600 text-white hover:bg-blue-500'}
          ${!allowIAL ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={!allowIAL}
        >
          IAL
        </button>
        <button
          onClick={() => handleSelection('IGCSE')}
          className={`px-4 py-2 mb-6 cursor-pointer rounded-lg transition
          ${selected === 'IGCSE' ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
        >
          IGCSE
        </button>
      </div>
    </div>
  );
};

export default ResourceSelector;
