import React from 'react';

function Sidebar({ selectedPerson, onEdit, onDelete, onClose }) {
  if (!selectedPerson) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-dark-card text-white shadow-2xl overflow-y-auto slide-in-right z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">Generation {selectedPerson.generation}</p>
      </div>

      {/* Profile Info */}
      <div className="p-6 space-y-4">
        {/* Photo */}
        {selectedPerson.photo && (
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-700">
            <img src={selectedPerson.photo} alt={selectedPerson.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Gender</label>
            <p className="text-lg">{selectedPerson.gender}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">Date of Birth</label>
            <p className="text-lg">{formatDate(selectedPerson.dob)}</p>
          </div>
        </div>

        {/* Relationships */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <h3 className="text-xl font-semibold">Relationships</h3>

          {/* Parents */}
          {selectedPerson.parents && selectedPerson.parents.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Parents ({selectedPerson.parents.length})</label>
              <ul className="mt-1 space-y-1">
                {selectedPerson.parents.map(parent => (
                  <li key={parent.id} className="text-blue-400 flex items-center gap-2">
                    👤 {parent.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Spouses */}
          {selectedPerson.spouses && selectedPerson.spouses.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Spouse{selectedPerson.spouses.length > 1 ? 's' : ''} ({selectedPerson.spouses.length})</label>
              <ul className="mt-1 space-y-1">
                {selectedPerson.spouses.map(spouse => (
                  <li key={spouse.id} className="text-pink-400 flex items-center gap-2">
                    💑 {spouse.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Children */}
          {selectedPerson.children && selectedPerson.children.length > 0 && (
            <div>
              <label className="text-sm text-gray-400">Children ({selectedPerson.children.length})</label>
              <ul className="mt-1 space-y-1">
                {selectedPerson.children.map(child => (
                  <li key={child.id} className="text-green-400 flex items-center gap-2">
                    👶 {child.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onEdit(selectedPerson)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(selectedPerson.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
