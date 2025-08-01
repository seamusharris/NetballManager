import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import ClubTeamSelector from './ClubTeamSelector';

interface NewGameFormProps {
  game?: any;
  seasons: any[];
  gameStatuses: any[];
  activeSeason: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

interface GameFormData {
  date: string;
  time: string;
  round?: string;
  seasonId: string;
  homeClubId: string;
  homeTeamId: string;
  awayClubId?: string;
  awayTeamId?: string;
  statusId: string;
  venue?: string;
  notes?: string;
}

export default function NewGameForm({
  game,
  seasons,
  gameStatuses,
  activeSeason,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false
}: NewGameFormProps) {
  const [formData, setFormData] = useState<GameFormData>({
    date: game?.date || format(new Date(), 'yyyy-MM-dd'),
    time: game?.time || '10:00',
    round: game?.round || '',
    seasonId: game?.seasonId?.toString() || activeSeason?.id?.toString() || '',
    homeClubId: '',
    homeTeamId: game?.homeTeamId?.toString() || '',
    awayClubId: '',
    awayTeamId: game?.awayTeamId?.toString() || '',
    statusId: game?.statusId?.toString() || '1',
    venue: game?.venue || '',
    notes: game?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query to get clubs
  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await fetch('/api/clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data = await response.json();
      return data.data || [];
    }
  });

  // Set initial club IDs when editing
  useEffect(() => {
    if (game && clubs && clubs.length > 0) {
      // Find home team's club
      if (game.homeTeamId) {
        fetch(`/api/teams/${game.homeTeamId}`)
          .then(res => res.json())
          .then(data => {
            if (data.data?.clubId) {
              setFormData(prev => ({ ...prev, homeClubId: data.data.clubId.toString() }));
            }
          });
      }
      
      // Find away team's club
      if (game.awayTeamId) {
        fetch(`/api/teams/${game.awayTeamId}`)
          .then(res => res.json())
          .then(data => {
            if (data.data?.clubId) {
              setFormData(prev => ({ ...prev, awayClubId: data.data.clubId.toString() }));
            }
          });
      }
    }
  }, [game, clubs]);

  const isBye = formData.statusId === '6';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.seasonId) newErrors.seasonId = 'Season is required';
    if (!formData.homeClubId) newErrors.homeClub = 'Home club is required';
    if (!formData.homeTeamId) newErrors.homeTeam = 'Home team is required';
    if (!formData.statusId) newErrors.status = 'Game status is required';
    
    if (!isBye) {
      if (!formData.awayClubId) newErrors.awayClub = 'Away club is required';
      if (!formData.awayTeamId) newErrors.awayTeam = 'Away team is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      date: formData.date,
      time: formData.time,
      round: formData.round || null,
      season_id: parseInt(formData.seasonId),
      home_team_id: parseInt(formData.homeTeamId),
      away_team_id: isBye ? null : parseInt(formData.awayTeamId),
      status_id: parseInt(formData.statusId),
      venue: formData.venue || null,
      notes: formData.notes || null
    };

    onSubmit(submitData);
  };

  const handleFieldChange = (field: keyof GameFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Time *
          </label>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => handleFieldChange('time', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-1">
            Round
          </label>
          <input
            type="text"
            id="round"
            value={formData.round}
            onChange={(e) => handleFieldChange('round', e.target.value)}
            placeholder="e.g., 1, SF, GF"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
            Season *
          </label>
          <select
            id="season"
            value={formData.seasonId}
            onChange={(e) => handleFieldChange('seasonId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.seasonId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a season</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          {errors.seasonId && <p className="mt-1 text-sm text-red-600">{errors.seasonId}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Home Team</h3>
        <ClubTeamSelector
          clubs={clubs || []}
          selectedClubId={formData.homeClubId}
          selectedTeamId={formData.homeTeamId}
          seasonId={formData.seasonId}
          onClubChange={(clubId) => {
            handleFieldChange('homeClubId', clubId);
            handleFieldChange('homeTeamId', ''); // Reset team when club changes
          }}
          onTeamChange={(teamId) => handleFieldChange('homeTeamId', teamId)}
          clubError={errors.homeClub}
          teamError={errors.homeTeam}
          required
        />
      </div>

      {!isBye && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Away Team</h3>
          <ClubTeamSelector
            clubs={clubs || []}
            selectedClubId={formData.awayClubId}
            selectedTeamId={formData.awayTeamId}
            seasonId={formData.seasonId}
            onClubChange={(clubId) => {
              handleFieldChange('awayClubId', clubId);
              handleFieldChange('awayTeamId', ''); // Reset team when club changes
            }}
            onTeamChange={(teamId) => handleFieldChange('awayTeamId', teamId)}
            clubError={errors.awayClub}
            teamError={errors.awayTeam}
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Game Status *
        </label>
        <select
          id="status"
          value={formData.statusId}
          onChange={(e) => handleFieldChange('statusId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.status ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select a status</option>
          {gameStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.displayName}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
      </div>

      <div>
        <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
          Venue
        </label>
        <input
          type="text"
          id="venue"
          value={formData.venue}
          onChange={(e) => handleFieldChange('venue', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || clubsLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Create Game'}
        </button>
      </div>
    </form>
  );
}