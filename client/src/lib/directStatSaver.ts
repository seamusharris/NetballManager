/**
 * Direct stat saver utility
 * 
 * This is a simple utility to directly save statistics to the server
 * without going through React Query or other abstractions.
 */

/**
 * Update a specific game stat by ID
 * @param id The ID of the stat to update
 * @param data The data to update (can be partial)
 * @returns Promise<boolean> indicating success or failure
 */
export async function updateStat(id: number, data: Record<string, any>): Promise<boolean> {
  try {
    // Log what we're doing
    console.log(`Directly updating stat ID ${id} with:`, data);
    
    // Simple async Promise delay to ensure sequential execution
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Wait a short time to prevent race conditions
    await delay(50);
    
    // Make the direct API call
    const response = await fetch(`/api/game-stats/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    // Check if we succeeded
    if (response.ok) {
      console.log(`Successfully updated stat ID ${id}`);
      return true;
    } else {
      // Try to get the error message
      let errorText = 'Unknown error';
      try {
        const errorData = await response.text();
        errorText = errorData;
      } catch (e) {
        // Ignore error parsing errors
      }
      
      console.error(`Failed to update stat ID ${id}: ${response.status} ${response.statusText}`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`Error updating stat ID ${id}:`, error);
    return false;
  }
}

/**
 * Create a new game stat
 * @param data The complete stat data
 * @returns Promise<number|null> The ID of the created stat, or null on failure
 */
export async function createStat(data: Record<string, any>): Promise<number | null> {
  try {
    console.log(`Creating new stat:`, data);
    
    // Make the direct API call
    const response = await fetch('/api/game-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    // Check if we succeeded
    if (response.ok) {
      try {
        const responseData = await response.json();
        console.log(`Successfully created new stat with ID ${responseData.id}`);
        return responseData.id;
      } catch (e) {
        console.error(`Could not parse response from stat creation:`, e);
        return null;
      }
    } else {
      console.error(`Failed to create stat: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error creating stat:`, error);
    return null;
  }
}