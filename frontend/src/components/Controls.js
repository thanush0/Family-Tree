import React, { useState } from 'react';

function Controls({ onAddPerson, onSearch, viewMode, onViewModeChange, visualMode, onVisualModeChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="fixed top-0 left-0 right-96 p-4 bg-gradient-to-b from-dark-bg to-transparent z-10">
      <div className="flex flex-col gap-3">
        {/* First Row: Logo, Search, Add Button */}
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

        {/* Second Row: View Mode Selectors */}
        <div className="flex items-center justify-between gap-4">
          {/* Visual Mode Toggle */}
          <div className="flex gap-2 bg-dark-card rounded-lg p-1">
            <button
              onClick={() => onVisualModeChange('2d')}
              className={`px-4 py-2 rounded transition flex items-center gap-2 ${
                visualMode === '2d' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              2D
            </button>
            <button
              onClick={() => onVisualModeChange('3d')}
              className={`px-4 py-2 rounded transition flex items-center gap-2 ${
                visualMode === '3d' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              3D
            </button>
            <button
              onClick={() => onVisualModeChange('3d-temporal')}
              className={`px-4 py-2 rounded transition flex items-center gap-2 ${
                visualMode === '3d-temporal' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="3D Temporal View - Time flows vertically"
            >
              <span className="text-lg">🌌</span>
              Temporal
            </button>
          </div>

          {/* Tree View Mode Selector */}
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
        </div>
      </div>
    </div>
  );
}

export default Controls;
