import React, { useState, useEffect } from 'react';
import FamilyTree2D from './components/FamilyTree2D';
import Scene3D from './components/Scene3D';
import Scene3DTemporal from './components/Scene3DTemporal';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import PersonForm from './components/PersonForm';
import api from './services/api';
import './App.css';

function App() {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [viewMode, setViewMode] = useState('full'); // 'full', 'ancestors', 'descendants'
  const [visualMode, setVisualMode] = useState('3d-temporal'); // '2d', '3d', or '3d-temporal'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all persons
  const fetchData = async () => {
    try {
      setLoading(true);
      const personsRes = await api.getPersons();
      setPersons(personsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load family tree data. Make sure the backend is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle person selection
  const handlePersonSelect = (personId) => {
    const person = persons.find(p => p.id === personId);
    setSelectedPerson(person);
  };

  // Handle add new person
  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowForm(true);
  };

  // Handle edit person
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  // Handle delete person
  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Are you sure you want to delete this person?')) {
      return;
    }

    try {
      await api.deletePerson(personId);
      await fetchData();
      setSelectedPerson(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete person');
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingPerson) {
        await api.updatePerson(editingPerson.id, formData);
      } else {
        await api.createPerson(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingPerson(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save person');
    }
  };

  // Handle search
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSelectedPerson(null);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const found = persons.find(p => 
      p.name.toLowerCase().includes(lowerQuery)
    );
    
    if (found) {
      setSelectedPerson(found);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading Family Tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg text-white">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* 3D Temporal, 3D, or 2D Family Tree */}
      {visualMode === '3d-temporal' ? (
        <Scene3DTemporal 
          persons={persons}
          selectedPerson={selectedPerson}
          onPersonSelect={handlePersonSelect}
          viewMode={viewMode}
        />
      ) : visualMode === '3d' ? (
        <Scene3D 
          persons={persons}
          selectedPerson={selectedPerson}
          onPersonSelect={handlePersonSelect}
          viewMode={viewMode}
        />
      ) : (
        <FamilyTree2D 
          persons={persons}
          selectedPerson={selectedPerson?.id}
          onPersonSelect={handlePersonSelect}
          viewMode={viewMode}
        />
      )}

      {/* Top Controls */}
      <Controls 
        onAddPerson={handleAddPerson}
        onSearch={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
      />

      {/* Right Sidebar */}
      <Sidebar 
        selectedPerson={selectedPerson}
        onEdit={handleEditPerson}
        onDelete={handleDeletePerson}
        onClose={() => setSelectedPerson(null)}
      />

      {/* Person Form Modal */}
      {showForm && (
        <PersonForm
          person={editingPerson}
          persons={persons}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingPerson(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
