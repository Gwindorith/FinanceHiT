'use client';

import { useState, useEffect } from 'react';
import { X, Building2, Coffee, Utensils } from 'lucide-react';
import { TrainingRoomRentOption, CateringOption } from '@/lib/database.pg';

interface TrainingDayOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingDay: {
    date: string;
    start_time: string;
    end_time: string;
    room_rent_option_id: number | null;
    lunch_catering_option_id: number | null;
    dinner_catering_option_id: number | null;
  };
  onSave: (options: {
    room_rent_option_id: number | null;
    lunch_catering_option_id: number | null;
    dinner_catering_option_id: number | null;
  }) => void;
}

export default function TrainingDayOptionsModal({ 
  isOpen, 
  onClose, 
  trainingDay, 
  onSave 
}: TrainingDayOptionsModalProps) {
  const [roomOptions, setRoomOptions] = useState<TrainingRoomRentOption[]>([]);
  const [cateringOptions, setCateringOptions] = useState<CateringOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({
    room_rent_option_id: trainingDay.room_rent_option_id,
    lunch_catering_option_id: trainingDay.lunch_catering_option_id,
    dinner_catering_option_id: trainingDay.dinner_catering_option_id,
  });

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      setSelectedOptions({
        room_rent_option_id: trainingDay.room_rent_option_id,
        lunch_catering_option_id: trainingDay.lunch_catering_option_id,
        dinner_catering_option_id: trainingDay.dinner_catering_option_id,
      });
    }
  }, [isOpen, trainingDay]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [roomResponse, cateringResponse] = await Promise.all([
        fetch('/api/training-room-rent-options'),
        fetch('/api/catering-options')
      ]);

      const roomData = await roomResponse.json();
      const cateringData = await cateringResponse.json();

      if (roomData.success) setRoomOptions(roomData.data);
      if (cateringData.success) setCateringOptions(cateringData.data);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(selectedOptions);
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSelectedRoomName = () => {
    const room = roomOptions.find(r => r.id === selectedOptions.room_rent_option_id);
    return room ? `${room.name} (€${room.rent_per_hour.toFixed(2)}/hr)` : 'No room selected';
  };

  const getSelectedLunchName = () => {
    const lunch = cateringOptions.find(c => c.id === selectedOptions.lunch_catering_option_id);
    return lunch ? `${lunch.name} (€${lunch.lunch_price_per_participant.toFixed(2)})` : 'No lunch selected';
  };

  const getSelectedDinnerName = () => {
    const dinner = cateringOptions.find(c => c.id === selectedOptions.dinner_catering_option_id);
    return dinner ? `${dinner.name} (€${dinner.dinner_price_per_participant.toFixed(2)})` : 'No dinner selected';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Training Day Options</h3>
            <p className="text-sm text-gray-600">
              {formatDate(trainingDay.date)} • {trainingDay.start_time} - {trainingDay.end_time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading options...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room Selection */}
            <div>
              <div className="flex items-center mb-3">
                <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                <h4 className="text-md font-medium text-gray-900">Training Room</h4>
              </div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedOptions.room_rent_option_id ?? ''}
                onChange={(e) => setSelectedOptions(prev => ({
                  ...prev,
                  room_rent_option_id: e.target.value ? Number(e.target.value) : null
                }))}
              >
                <option value="">Select a training room</option>
                {roomOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - €{option.rent_per_hour.toFixed(2)}/hour
                  </option>
                ))}
              </select>
              {selectedOptions.room_rent_option_id && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {getSelectedRoomName()}
                </p>
              )}
            </div>

            {/* Lunch Selection */}
            <div>
              <div className="flex items-center mb-3">
                <Coffee className="h-5 w-5 text-gray-500 mr-2" />
                <h4 className="text-md font-medium text-gray-900">Lunch Catering</h4>
              </div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedOptions.lunch_catering_option_id ?? ''}
                onChange={(e) => setSelectedOptions(prev => ({
                  ...prev,
                  lunch_catering_option_id: e.target.value ? Number(e.target.value) : null
                }))}
              >
                <option value="">No lunch catering</option>
                {cateringOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - €{option.lunch_price_per_participant.toFixed(2)} per participant
                  </option>
                ))}
              </select>
              {selectedOptions.lunch_catering_option_id && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {getSelectedLunchName()}
                </p>
              )}
            </div>

            {/* Dinner Selection */}
            <div>
              <div className="flex items-center mb-3">
                <Utensils className="h-5 w-5 text-gray-500 mr-2" />
                <h4 className="text-md font-medium text-gray-900">Dinner Catering</h4>
              </div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedOptions.dinner_catering_option_id ?? ''}
                onChange={(e) => setSelectedOptions(prev => ({
                  ...prev,
                  dinner_catering_option_id: e.target.value ? Number(e.target.value) : null
                }))}
              >
                <option value="">No dinner catering</option>
                {cateringOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} - €{option.dinner_price_per_participant.toFixed(2)} per participant
                  </option>
                ))}
              </select>
              {selectedOptions.dinner_catering_option_id && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {getSelectedDinnerName()}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Summary</h5>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Room: {getSelectedRoomName()}</div>
                <div>• Lunch: {getSelectedLunchName()}</div>
                <div>• Dinner: {getSelectedDinnerName()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Save Options
          </button>
        </div>
      </div>
    </div>
  );
} 