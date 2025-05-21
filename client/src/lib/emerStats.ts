/**
 * Emergency stats saving utility
 * 
 * This is a specialized module for saving position-based statistics directly to the database
 * without relying on complex React Query or other abstractions that might be failing.
 */

/**
 * Save a single position stat for a game
 * 
 * @param gameId The game ID
 * @param positionName Position name (eg. 'GS', 'GA', etc)
 * @param quarter Quarter number (1-4)
 * @param data The stat data to save
 * @returns Promise<boolean> indicating success
 */
export async function savePositionStat(
  gameId: number,
  positionName: string,
  quarter: number,
  data: Record<string, number>
): Promise<boolean> {
  try {
    console.log(`Saving stats for ${positionName} Q${quarter} in game ${gameId}:`, data);
    
    // Basic validation
    if (!gameId || !positionName || !quarter || !data) {
      console.error('Missing required data for stat saving');
      return false;
    }
    
    // Get all the current stats for this game to find the one we need
    const response = await fetch(`/api/games/${gameId}/stats`);
    
    if (!response.ok) {
      console.error(`Could not get existing stats for game ${gameId}`);
      return false;
    }
    
    const existingStats = await response.json();
    
    // Find the stat for this position/quarter combination
    const targetStat = existingStats.find(
      (stat: any) => stat.position === positionName && stat.quarter === quarter
    );
    
    let success = false;
    
    if (targetStat) {
      // Update existing stat
      console.log(`Found existing stat ID ${targetStat.id} for ${positionName} Q${quarter}`);
      
      // IMPORTANT: Use the correct endpoint with no hyphen
      const updateResponse = await fetch(`/api/gamestats/${targetStat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      success = updateResponse.ok;
      
      if (success) {
        console.log(`Successfully updated ${positionName} Q${quarter} stats`);
      } else {
        console.error(`Failed to update ${positionName} Q${quarter} stats: ${updateResponse.status}`);
      }
    } else {
      // Create new stat
      console.log(`Creating new stat for ${positionName} Q${quarter}`);
      
      const newStat = {
        gameId,
        position: positionName,
        quarter,
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        ...data 
      };
      
      // IMPORTANT: Use the correct endpoint with no hyphen
      const createResponse = await fetch('/api/gamestats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStat)
      });
      
      success = createResponse.ok;
      
      if (success) {
        console.log(`Successfully created new ${positionName} Q${quarter} stats`);
      } else {
        console.error(`Failed to create ${positionName} Q${quarter} stats: ${createResponse.status}`);
      }
    }
    
    return success;
  } catch (error) {
    console.error(`Error saving ${positionName} Q${quarter} stats:`, error);
    return false;
  }
}