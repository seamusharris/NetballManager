/**
 * Dedicated utility for managing player-season relationships
 * This provides a direct way to update player seasons without relying on the main player update flow
 */

/**
 * Updates a player's seasons by making a direct API call
 * 
 * @param playerId The ID of the player to update
 * @param seasonIds Array of season IDs to assign to the player
 * @returns Promise that resolves to the result of the operation
 */
export async function updatePlayerSeasons(playerId: number, seasonIds: number[]): Promise<{success: boolean, message: string}> {
  try {
    console.log(`Updating seasons for player ${playerId}:`, seasonIds);
    
    const response = await fetch(`/api/players/${playerId}/seasons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seasonIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`Server error (${response.status}):`, errorData);
      return {
        success: false,
        message: `Failed to update seasons: ${errorData.message || response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Seasons updated successfully'
    };
  } catch (error) {
    console.error('Error updating player seasons:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetches the seasons assigned to a player
 * 
 * @param playerId The ID of the player
 * @returns Promise that resolves to an array of season IDs
 */
export async function getPlayerSeasons(playerId: number): Promise<number[]> {
  try {
    const response = await fetch(`/api/players/${playerId}/seasons`);
    
    if (!response.ok) {
      console.error(`Failed to fetch player seasons (${response.status})`);
      return [];
    }
    
    const data = await response.json();
    return data.seasonIds || [];
  } catch (error) {
    console.error('Error fetching player seasons:', error);
    return [];
  }
}