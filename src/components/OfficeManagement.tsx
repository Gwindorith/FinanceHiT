'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Coffee, Utensils } from 'lucide-react';
import { CateringOption, TrainingRoomRentOption } from '@/lib/database.pg';

interface OfficeManagementProps {
  onClose: () => void;
}

export default function OfficeManagement({ onClose }: OfficeManagementProps) {
  const [activeTab, setActiveTab] = useState<'catering' | 'rent'>('catering');
  const [cateringOptions, setCateringOptions] = useState<CateringOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOption, setEditingOption] = useState<CateringOption | null>(null);
  const [error, setError] = useState('');

  const [newOption, setNewOption] = useState({
    name: '',
    description: '',
    lunch_price_per_participant: '',
    dinner_price_per_participant: '',
    is_active: true,
  });

  const [editOption, setEditOption] = useState({
    name: '',
    description: '',
    lunch_price_per_participant: '',
    dinner_price_per_participant: '',
    is_active: true,
  });

  // Training room rent state
  const [rentOptions, setRentOptions] = useState<TrainingRoomRentOption[]>([]);
  const [loadingRent, setLoadingRent] = useState(true);
  const [showCreateRentForm, setShowCreateRentForm] = useState(false);
  const [showEditRentForm, setShowEditRentForm] = useState(false);
  const [editingRentOption, setEditingRentOption] = useState<TrainingRoomRentOption | null>(null);
  const [rentError, setRentError] = useState('');
  const [newRentOption, setNewRentOption] = useState({
    name: '',
    description: '',
    rent_per_hour: '',
    is_active: true,
  });
  const [editRentOption, setEditRentOption] = useState({
    name: '',
    description: '',
    rent_per_hour: '',
    is_active: true,
  });

  const fetchCateringOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catering-options');
      const data = await response.json();
      
      if (data.success) {
        setCateringOptions(data.data);
      } else {
        setError(data.error || 'Failed to fetch catering options');
      }
    } catch (err) {
      setError('Failed to fetch catering options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCateringOptions();
  }, []);

  // Fetch rent options
  const fetchRentOptions = async () => {
    try {
      setLoadingRent(true);
      const response = await fetch('/api/training-room-rent-options');
      const data = await response.json();
      if (data.success) {
        setRentOptions(data.data);
      } else {
        setRentError(data.error || 'Failed to fetch rent options');
      }
    } catch (err) {
      setRentError('Failed to fetch rent options');
    } finally {
      setLoadingRent(false);
    }
  };
  useEffect(() => { fetchRentOptions(); }, []);

  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/catering-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOption,
          lunch_price_per_participant: Number(newOption.lunch_price_per_participant),
          dinner_price_per_participant: Number(newOption.dinner_price_per_participant),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCateringOptions([...cateringOptions, data.data]);
        setShowCreateForm(false);
        setNewOption({
          name: '',
          description: '',
          lunch_price_per_participant: '',
          dinner_price_per_participant: '',
          is_active: true,
        });
      } else {
        setError(data.error || 'Failed to create catering option');
      }
    } catch (error) {
      setError('An error occurred while creating catering option');
    }
  };

  const handleEditOption = (option: CateringOption) => {
    setEditingOption(option);
    setEditOption({
      name: option.name,
      description: option.description || '',
      lunch_price_per_participant: option.lunch_price_per_participant.toString(),
      dinner_price_per_participant: option.dinner_price_per_participant.toString(),
      is_active: option.is_active ?? true,
    });
    setShowEditForm(true);
  };

  const handleUpdateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption) return;

    setError('');

    try {
      const response = await fetch(`/api/catering-options/${editingOption.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editOption,
          lunch_price_per_participant: Number(editOption.lunch_price_per_participant),
          dinner_price_per_participant: Number(editOption.dinner_price_per_participant),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCateringOptions(cateringOptions.map(option => 
          option.id === editingOption.id ? data.data : option
        ));
        setShowEditForm(false);
        setEditingOption(null);
        setEditOption({
          name: '',
          description: '',
          lunch_price_per_participant: '',
          dinner_price_per_participant: '',
          is_active: true,
        });
      } else {
        setError(data.error || 'Failed to update catering option');
      }
    } catch (error) {
      setError('An error occurred while updating catering option');
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm('Are you sure you want to delete this catering option?')) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`/api/catering-options/${optionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCateringOptions(cateringOptions.filter(option => option.id !== optionId));
      } else {
        setError(data.error || 'Failed to delete catering option');
      }
    } catch (error) {
      setError('An error occurred while deleting catering option');
    }
  };

  // Rent CRUD handlers (create, edit, update, delete, input change)
  const handleCreateRentOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setRentError('');

    try {
      const response = await fetch('/api/training-room-rent-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newRentOption,
          rent_per_hour: Number(newRentOption.rent_per_hour),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRentOptions([...rentOptions, data.data]);
        setShowCreateRentForm(false);
        setNewRentOption({
          name: '',
          description: '',
          rent_per_hour: '',
          is_active: true,
        });
      } else {
        setRentError(data.error || 'Failed to create rent option');
      }
    } catch (error) {
      setRentError('An error occurred while creating rent option');
    }
  };

  const handleEditRentOption = (option: TrainingRoomRentOption) => {
    setEditingRentOption(option);
    setEditRentOption({
      name: option.name,
      description: option.description || '',
      rent_per_hour: option.rent_per_hour.toString(),
      is_active: option.is_active ?? true,
    });
    setShowEditRentForm(true);
  };

  const handleUpdateRentOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRentOption) return;

    setRentError('');

    try {
      const response = await fetch(`/api/training-room-rent-options/${editingRentOption.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editRentOption,
          rent_per_hour: Number(editRentOption.rent_per_hour),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRentOptions(rentOptions.map(option => 
          option.id === editingRentOption.id ? data.data : option
        ));
        setShowEditRentForm(false);
        setEditingRentOption(null);
        setEditRentOption({
          name: '',
          description: '',
          rent_per_hour: '',
          is_active: true,
        });
      } else {
        setRentError(data.error || 'Failed to update rent option');
      }
    } catch (error) {
      setRentError('An error occurred while updating rent option');
    }
  };

  const handleDeleteRentOption = async (optionId: number) => {
    if (!confirm('Are you sure you want to delete this training room rent option?')) {
      return;
    }

    setRentError('');

    try {
      const response = await fetch(`/api/training-room-rent-options/${optionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setRentOptions(rentOptions.filter(option => option.id !== optionId));
      } else {
        setRentError(data.error || 'Failed to delete rent option');
      }
    } catch (error) {
      setRentError('An error occurred while deleting rent option');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Rent input change handler
  const handleRentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewRentOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditRentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditRentOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Office Management</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('catering')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catering'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Catering Options
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training Room Rent
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {rentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{rentError}</p>
          </div>
        )}

        {/* Catering Options Tab */}
        {activeTab === 'catering' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Catering Options ({cateringOptions.length})</h4>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Catering Option
              </button>
            </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading catering options...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lunch Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dinner Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cateringOptions.map((option) => (
                  <tr key={option.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {option.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {option.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      €{option.lunch_price_per_participant.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      €{option.dinner_price_per_participant.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        option.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {option.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditOption(option)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Edit catering option"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOption(option.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete catering option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Catering Option Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Catering Option</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateOption} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newOption.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newOption.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lunch Price (€) *
                    </label>
                    <input
                      type="number"
                      name="lunch_price_per_participant"
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={newOption.lunch_price_per_participant}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dinner Price (€) *
                    </label>
                    <input
                      type="number"
                      name="dinner_price_per_participant"
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={newOption.dinner_price_per_participant}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={newOption.is_active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Option
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Catering Option Form Modal */}
        {showEditForm && editingOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Catering Option</h3>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingOption(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateOption} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editOption.name}
                    onChange={handleEditInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editOption.description}
                    onChange={handleEditInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lunch Price (€) *
                    </label>
                    <input
                      type="number"
                      name="lunch_price_per_participant"
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editOption.lunch_price_per_participant}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dinner Price (€) *
                    </label>
                    <input
                      type="number"
                      name="dinner_price_per_participant"
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={editOption.dinner_price_per_participant}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="edit_is_active"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={editOption.is_active}
                    onChange={handleEditInputChange}
                  />
                  <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingOption(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Option
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </>
        )}

        {/* Training Room Rent Options Tab */}
        {activeTab === 'rent' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Training Room Rent Options ({rentOptions.length})</h4>
              <button
                onClick={() => setShowCreateRentForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rent Option
              </button>
            </div>

            {loadingRent ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading rent options...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rent Per Hour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rentOptions.map((option) => (
                      <tr key={option.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {option.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {option.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          €{option.rent_per_hour.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            option.is_active 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {option.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditRentOption(option)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="Edit rent option"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRentOption(option.id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete rent option"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Create Rent Option Form Modal */}
        {showCreateRentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Training Room Rent Option</h3>
                <button
                  onClick={() => setShowCreateRentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateRentOption} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newRentOption.name}
                    onChange={handleRentInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newRentOption.description}
                    onChange={handleRentInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rent Per Hour (€) *
                  </label>
                  <input
                    type="number"
                    name="rent_per_hour"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={newRentOption.rent_per_hour}
                    onChange={handleRentInputChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active_rent"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={newRentOption.is_active}
                    onChange={handleRentInputChange}
                  />
                  <label htmlFor="is_active_rent" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateRentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Option
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Rent Option Form Modal */}
        {showEditRentForm && editingRentOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Training Room Rent Option</h3>
                <button
                  onClick={() => {
                    setShowEditRentForm(false);
                    setEditingRentOption(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateRentOption} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editRentOption.name}
                    onChange={handleEditRentInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editRentOption.description}
                    onChange={handleEditRentInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rent Per Hour (€) *
                  </label>
                  <input
                    type="number"
                    name="rent_per_hour"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={editRentOption.rent_per_hour}
                    onChange={handleEditRentInputChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="edit_is_active_rent"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={editRentOption.is_active}
                    onChange={handleEditRentInputChange}
                  />
                  <label htmlFor="edit_is_active_rent" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditRentForm(false);
                      setEditingRentOption(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Option
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 