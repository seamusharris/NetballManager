import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Position, allPositions, Season } from '@shared/schema';
import { generatePlayerAvatarColor } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";

interface SimplePlayerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SimplePlayerForm({ onSubmit, onCancel, isSubmitting }: SimplePlayerFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [active, setActive] = useState(true);
  const [position1, setPosition1] = useState('');
  const [position2, setPosition2] = useState('none');
  const [position3, setPosition3] = useState('none');
  const [position4, setPosition4] = useState('none');
  const [selectedSeasonIds, setSelectedSeasonIds] = useState<number[]>([]);
  
  // Fetch all seasons
  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ['/api/seasons'],
  });
  
  // Get current active season
  const { data: activeSeason } = useQuery<Season>({
    queryKey: ['/api/seasons/active'],
  });
  
  // Set the active season by default
  useEffect(() => {
    if (activeSeason && !selectedSeasonIds.includes(activeSeason.id)) {
      setSelectedSeasonIds([activeSeason.id]);
    }
  }, [activeSeason]);
  
  // Function to handle season checkbox changes
  const handleSeasonChange = (seasonId: number, checked: boolean) => {
    setSelectedSeasonIds(prev => {
      if (checked) {
        return [...prev, seasonId];
      } else {
        return prev.filter(id => id !== seasonId);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!displayName || !firstName || !lastName || !position1) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Build position preferences array - ensure we're using string literals 
    // that match the enum values exactly to prevent type issues
    const positionPreferences: string[] = [];
    
    // Add positions in order, filtering out 'none'
    if (position1) {
      positionPreferences.push(position1);
    }
    if (position2 && position2 !== 'none') {
      positionPreferences.push(position2);
    }
    if (position3 && position3 !== 'none') {
      positionPreferences.push(position3);
    }
    if (position4 && position4 !== 'none') {
      positionPreferences.push(position4);
    }
    
    console.log("Position preferences array in SimplePlayerForm:", JSON.stringify(positionPreferences));
    
    // For new players, we'll create their avatar color when they're created
    // The actual color assignment will happen server-side based on their ID, but we need to indicate we want one
    onSubmit({
      displayName,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || "", // Allow empty date of birth
      active,
      positionPreferences,
      avatarColor: "auto", // This will be replaced with a specific color once the player is created and has an ID
      seasonIds: selectedSeasonIds // Add the selected season IDs
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display Name <span className="text-red-500">*</span></label>
          <input 
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Name as displayed on roster and statistics</p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div>
            <label className="block text-sm font-medium">Active Status</label>
            <p className="text-xs text-gray-500">Inactive players won't appear in roster selections</p>
          </div>
          <div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Date of Birth</label>
        <input
          type="date"
          className="w-full p-2 border rounded-md"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
      
      {/* Season selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Assign to Seasons</h3>
        <p className="text-xs text-gray-500">
          Select which seasons this player participates in
        </p>
        <div className="space-y-2">
          {seasons.map(season => (
            <div key={season.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`season-${season.id}`} 
                checked={selectedSeasonIds.includes(season.id)}
                onCheckedChange={(checked) => handleSeasonChange(season.id, checked === true)}
              />
              <label 
                htmlFor={`season-${season.id}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {season.name} {season.isActive && <span className="text-blue-600">(Current)</span>}
              </label>
            </div>
          ))}
          {seasons.length === 0 && (
            <p className="text-xs text-gray-500 italic">No seasons available</p>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Position Preferences (Ranked)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Position <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full p-2 border rounded-md"
              value={position1}
              onChange={(e) => setPosition1(e.target.value)}
            >
              <option value="" disabled>Select position</option>
              {allPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Second Preference</label>
            <select
              className="w-full p-2 border rounded-md"
              value={position2}
              onChange={(e) => setPosition2(e.target.value)}
            >
              <option value="none">None</option>
              {allPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Third Preference</label>
            <select
              className="w-full p-2 border rounded-md"
              value={position3}
              onChange={(e) => setPosition3(e.target.value)}
            >
              <option value="none">None</option>
              {allPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fourth Preference</label>
            <select
              className="w-full p-2 border rounded-md"
              value={position4}
              onChange={(e) => setPosition4(e.target.value)}
            >
              <option value="none">None</option>
              {allPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Add Player'}
        </button>
      </div>
    </form>
  );
}