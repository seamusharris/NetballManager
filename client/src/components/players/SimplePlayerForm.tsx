import { useState } from 'react';
import { Position, allPositions } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SimplePlayerFormProps {
  clubId?: number;
  onSuccess?: () => void;
}

export function SimplePlayerForm({ clubId, onSuccess }: SimplePlayerFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [active, setActive] = useState(true);
  const [position1, setPosition1] = useState('');
  const [position2, setPosition2] = useState('none');
  const [position3, setPosition3] = useState('none');
  const [position4, setPosition4] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!displayName || !firstName || !lastName || !position1) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Build position preferences array
    const positionPreferences: Position[] = [position1 as Position];
    
    if (position2 !== 'none') {
      positionPreferences.push(position2 as Position);
    }
    if (position3 !== 'none') {
      positionPreferences.push(position3 as Position);
    }
    if (position4 !== 'none') {
      positionPreferences.push(position4 as Position);
    }
    
    // Prevent submitting the form if it's already submitting
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-club-id': clubId?.toString() || '',
        },
        body: JSON.stringify({
          displayName,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || null,
          active,
          positionPreferences,
          avatarColor: "auto"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create player');
      }

      // Reset form
      setDisplayName('');
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setActive(true);
      setPosition1('');
      setPosition2('none');
      setPosition3('none');
      setPosition4('none');

      onSuccess?.();
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Failed to create player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
          <Input 
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="J. Smith"
          />
          <p className="text-xs text-gray-500 mt-1">Name as displayed on roster and statistics</p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div>
            <Label>Active Status</Label>
            <p className="text-xs text-gray-500">Inactive players won't appear in roster selections</p>
          </div>
          <Switch
            checked={active}
            onCheckedChange={setActive}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
          <Input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Position Preferences (Ranked)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary Position <span className="text-red-500">*</span></Label>
            <Select value={position1} onValueChange={setPosition1} required>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {allPositions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Second Preference</Label>
            <Select value={position2} onValueChange={setPosition2}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {allPositions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Third Preference</Label>
            <Select value={position3} onValueChange={setPosition3}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {allPositions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Fourth Preference</Label>
            <Select value={position4} onValueChange={setPosition4}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {allPositions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Add Player'}
        </Button>
      </div>
    </form>
  );
}