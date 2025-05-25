/**
 * Emergency stats saving utility
 * 
 * This is a specialized module for saving position-based statistics directly to the database
 * without relying on complex React Query or other abstractions that might be failing.
 */
import { apiRequest } from '@/lib/queryClient';

/**
 * Validates and normalizes stats data
 * 
 * @param gameId The game ID
 * @param positionName Position name (eg. 'GS', 'GA', etc)
 * @param quarter Quarter number (1-4)
 * @param data The stat data to validate
 * @returns An object with {valid: boolean, data: Record<string, number>, errors: string[]}
 */
export function validateStatsData(
  gameId: number,
  positionName: string,
  quarter: number,
  data: Record<string, any>
): { valid: boolean; data: Record<string, number>; errors: string[] } {
  const errors: string[] = [];
  const validatedData: Record<string, number> = {};
  
  // Check required parameters
  if (!gameId) {
    errors.push('Missing gameId for stat saving');
  }
  
  if (!positionName) {
    errors.push('Missing position name for stat saving');
  }
  
  if (!quarter || quarter < 1 || quarter > 4) {
    errors.push(`Invalid quarter value: ${quarter}. Must be between 1-4`);
  }
  
  if (!data || Object.keys(data).length === 0) {
    errors.push('No stat data provided for saving');
  }
  
  // If any required params are missing, return early
  if (errors.length > 0) {
    return { valid: false, data: {}, errors };
  }
  
  // Validate and normalize each stat value
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number') {
      // Value is already a number, just check if it's negative
      validatedData[key] = value < 0 ? 0 : value;
      
      if (value < 0) {
        errors.push(`Corrected negative value for ${key}: ${value} → 0`);
      }
    } else if (typeof value === 'string') {
      // Try to convert string to number
      const numberValue = parseInt(value);
      if (!isNaN(numberValue)) {
        validatedData[key] = numberValue < 0 ? 0 : numberValue;
        
        if (numberValue < 0) {
          errors.push(`Corrected negative string value for ${key}: "${value}" → 0`);
        }
      } else {
        errors.push(`Cannot convert ${key} value "${value}" to a number`);
      }
    } else if (value === null || value === undefined) {
      // Null or undefined values become 0
      validatedData[key] = 0;
      errors.push(`Null or undefined value for ${key} set to 0`);
    } else {
      // Unknown type, can't process
      errors.push(`Unsupported type for ${key}: ${typeof value}`);
    }
  }
  
  return {
    valid: errors.filter(e => !e.includes('Corrected') && !e.includes('set to 0')).length === 0,
    data: validatedData,
    errors
  };
}

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
  data: Record<string, any>
): Promise<boolean> {
  try {
    console.log(`Saving stats for ${positionName} Q${quarter} in game ${gameId}:`, data);
    
    // Use our validation utility to ensure data integrity
    const validation = validateStatsData(gameId, positionName, quarter, data);
    
    // Log any validation issues
    if (validation.errors.length > 0) {
      console.log(`Validation notes for ${positionName} Q${quarter}:`, validation.errors);
    }
    
    // If validation failed with critical errors, abort
    if (!validation.valid) {
      console.error(`Cannot save stats for ${positionName} Q${quarter} due to validation errors`);
      return false;
    }
    
    // Use the cleaned, validated data going forward
    const cleanData = validation.data;
    
    // Get all the current stats for this game to find the one we need
    const response = await apiRequest('GET', `/api/games/${gameId}/stats`);
    
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
      
      // Additional log for debugging
      console.log(`Sending clean data to update ${positionName} Q${quarter}:`, cleanData);
      
      // Use the correct endpoint with apiRequest
      const updateResponse = await apiRequest('PATCH', `/api/games/stats/${targetStat.id}`, cleanData);
      
      success = updateResponse.ok;
      
      if (success) {
        console.log(`Successfully updated ${positionName} Q${quarter} stats`);
      } else {
        console.error(`Failed to update ${positionName} Q${quarter} stats: ${updateResponse.status}`);
        
        try {
          // Try to get more details about the error
          const errorText = await updateResponse.text();
          console.error(`Error details: ${errorText}`);
        } catch (e) {
          // Continue if we can't get error details
        }
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
        ...cleanData // Use validated data
      };
      
      // Additional log for debugging
      console.log(`Sending new stat data for ${positionName} Q${quarter}:`, newStat);
      
      // Use the correct endpoint with apiRequest
      const createResponse = await apiRequest('POST', '/api/games/stats', newStat);
      
      success = createResponse.ok;
      
      if (success) {
        console.log(`Successfully created new ${positionName} Q${quarter} stats`);
      } else {
        console.error(`Failed to create ${positionName} Q${quarter} stats: ${createResponse.status}`);
        
        try {
          // Try to get more details about the error
          const errorText = await createResponse.text();
          console.error(`Error details: ${errorText}`);
        } catch (e) {
          // Continue if we can't get error details
        }
      }
    }
    
    return success;
  } catch (error) {
    console.error(`Error saving ${positionName} Q${quarter} stats:`, error);
    return false;
  }
}