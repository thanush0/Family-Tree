import React, { useState, useEffect } from 'react';

function PersonForm({ person, persons, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    photo: '',
    parents: [],
    spouse: [],
    children: [],
    siblings: []
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        gender: person.gender || 'Male',
        dob: person.dob ? new Date(person.dob).toISOString().split('T')[0] : '',
        photo: person.photo || '',
        parents: person.parents?.map(p => p.id || p) || [],
        spouse: person.spouses?.map(s => s.id || s) || [],
        children: person.children?.map(c => c.id || c) || [],
        siblings: person.siblings?.map(s => s.id || s) || []
      });
      setPhotoPreview(person.photo || null);
    }
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    
    // Special handling for parents selection: auto-select both spouses and siblings
    if (field === 'parents') {
      const selectedParentIds = new Set(options);
      const siblingIds = new Set();
      
      // Find spouses of selected parents and auto-add them
      options.forEach(parentId => {
        const parent = persons.find(p => p.id === parentId);
        if (parent && parent.spouses) {
          parent.spouses.forEach(spouse => {
            // Add spouse to selection if they're in the available list
            if (availablePersons.some(p => p.id === spouse.id)) {
              selectedParentIds.add(spouse.id);
            }
          });
        }
      });
      
      // Auto-add all children of selected parents as siblings
      Array.from(selectedParentIds).forEach(parentId => {
        const parent = persons.find(p => p.id === parentId);
        if (parent && parent.children) {
          parent.children.forEach(child => {
            // Add child as sibling if they're not the current person being edited
            const childId = child.id || child;
            if (person && childId === person.id) {
              // Skip current person
              return;
            }
            // Add to siblings
            siblingIds.add(childId);
          });
        }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        parents: Array.from(selectedParentIds),
        siblings: Array.from(siblingIds)
      }));
    } 
    // Special handling for spouse selection: auto-add all children from both spouses
    else if (field === 'spouse') {
      const childrenIds = new Set([...formData.children]); // Keep existing children
      
      // Add children from each selected spouse
      options.forEach(spouseId => {
        const spouse = persons.find(p => p.id === spouseId);
        if (spouse && spouse.children) {
          spouse.children.forEach(child => {
            const childId = child.id || child;
            childrenIds.add(childId);
          });
        }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        spouse: options,
        children: Array.from(childrenIds)
      }));
    }
    // Special handling for siblings selection: auto-add all siblings of selected siblings
    else if (field === 'siblings') {
      const siblingIds = new Set(options);
      
      // For each selected sibling, find their siblings and add them too
      options.forEach(siblingId => {
        const sibling = persons.find(p => p.id === siblingId);
        if (sibling && sibling.siblings) {
          sibling.siblings.forEach(otherSibling => {
            const otherSiblingId = otherSibling.id || otherSibling;
            // Don't add the current person as their own sibling
            if (!person || otherSiblingId !== person.id) {
              siblingIds.add(otherSiblingId);
            }
          });
        }
      });
      
      setFormData(prev => ({ ...prev, siblings: Array.from(siblingIds) }));
    }
    else {
      setFormData(prev => ({ ...prev, [field]: options }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setUploadingPhoto(true);
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setFormData(prev => ({ ...prev, photo: base64String }));
        setUploadingPhoto(false);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, photo: url }));
    setPhotoPreview(url);
  };

  const clearPhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up form data before submitting
    const cleanedData = {
      ...formData,
      // Convert empty date string to null
      dob: formData.dob && formData.dob.trim() !== '' ? formData.dob : null,
      // Convert empty photo string to null
      photo: formData.photo && formData.photo.trim() !== '' ? formData.photo : null
    };
    
    onSubmit(cleanedData);
  };

  // Filter persons for selection (exclude self when editing)
  const availablePersons = person 
    ? persons.filter(p => p.id !== person.id)
    : persons;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 fade-in">
      <div className="bg-dark-card text-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {person ? 'Edit Person' : 'Add New Person'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            
            {/* Photo Preview */}
            {photoPreview && (
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition shadow-lg"
                  title="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Upload from Device</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploadingPhoto}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${
                      uploadingPhoto 
                        ? 'border-gray-600 bg-gray-800 cursor-not-allowed' 
                        : 'border-blue-500 hover:border-blue-400 bg-dark-bg hover:bg-gray-800'
                    }`}
                  >
                    {uploadingPhoto ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-10 h-10 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-300">Click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Or Enter Image URL</label>
                <input
                  type="url"
                  value={formData.photo.startsWith('data:') ? '' : formData.photo}
                  onChange={handlePhotoUrlChange}
                  className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Upload a clear photo for better visualization in the family tree
            </p>
          </div>

          {/* Parents */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Parents (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={formData.parents}
              onChange={(e) => handleMultiSelect(e, 'parents')}
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            >
              {availablePersons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Gen {p.generation})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Selected: {formData.parents.length} parent(s)
              {formData.parents.length > 0 && formData.siblings.length > 0 && (
                <span className="ml-2 text-green-400">
                  ✨ Auto-added {formData.siblings.length} sibling(s)
                </span>
              )}
            </p>
          </div>

          {/* Spouse */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Spouse (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={formData.spouse}
              onChange={(e) => handleMultiSelect(e, 'spouse')}
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            >
              {availablePersons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Gen {p.generation})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Selected: {formData.spouse.length} spouse(s)
              {formData.spouse.length > 0 && formData.children.length > 0 && (
                <span className="ml-2 text-green-400">
                  ✨ Auto-added {formData.children.length} child(ren)
                </span>
              )}
            </p>
          </div>

          {/* Children */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Children (Auto-filled from spouse, or select manually)
            </label>
            <select
              multiple
              value={formData.children}
              onChange={(e) => handleMultiSelect(e, 'children')}
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            >
              {availablePersons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Gen {p.generation})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Selected: {formData.children.length} child(ren)
              {formData.spouse.length > 0 && formData.children.length > 0 && (
                <span className="ml-2 text-blue-400">
                  ℹ️ Includes children from spouse(s)
                </span>
              )}
            </p>
          </div>

          {/* Siblings */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Siblings (Auto-filled from parents, or select manually)
            </label>
            <select
              multiple
              value={formData.siblings}
              onChange={(e) => handleMultiSelect(e, 'siblings')}
              className="w-full px-4 py-2 bg-dark-bg text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            >
              {availablePersons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Gen {p.generation})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Selected: {formData.siblings.length} sibling(s)
              {formData.parents.length > 0 && formData.siblings.length > 0 && (
                <span className="ml-2 text-blue-400">
                  ℹ️ Auto-filled based on parent's children
                </span>
              )}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition font-medium"
            >
              {person ? 'Update Person' : 'Create Person'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonForm;
