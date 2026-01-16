import React, { useState } from 'react';

function Controls({ onAddPerson, onSearch, viewMode, onViewModeChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="fixed top-0 left-0 right-96 p-6 bg-gradient-to-b from-dark-bg to-transparent z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Logo/Title */}
        <div className="text-white">
          <h1 className="text-2xl font-bold">🌳 Family Tree Viewer</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search family member..."
              className="w-full px-4 py-2 bg-dark-card text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* View Mode Selector */}
        <div className="flex gap-2 bg-dark-card rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('full')}
            className={`px-4 py-2 rounded transition ${
              viewMode === 'full' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Full Tree
          </button>
          <button
            onClick={() => onViewModeChange('ancestors')}
            className={`px-4 py-2 rounded transition ${
              viewMode === 'ancestors' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ancestors
          </button>
          <button
            onClick={() => onViewModeChange('descendants')}
            className={`px-4 py-2 rounded transition ${
              viewMode === 'descendants' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Descendants
          </button>
        </div>

        {/* Add Person Button */}
        <button
          onClick={onAddPerson}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Person
        </button>
      </div>
    </div>
  );
}

export default Controls;
