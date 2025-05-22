import { Position } from '@shared/schema';

export type StatCategory = 
  | 'goals'           // Goals scored
  | 'missedGoals'     // Missed shot attempts 
  | 'goalsAgainst'    // Goals conceded
  | 'rebounds'        // Ball rebounds
  | 'intercepts'      // Intercepting passes
  | 'pickUp'          // Picking up loose balls
  | 'badPass'         // Passes that miss target
  | 'handlingError'   // Fumbles, drops, stepping
  | 'infringement';   // Rules violations/penalties

// Full mapping of which stats are available for each position
export const positionStats: Record<Position, StatCategory[]> = {
  // Attack positions
  'GS': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GA': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  
  // Mid-court positions
  'WA': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'C': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'WD': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  
  // Defense positions
  'GD': ['goalsAgainst', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
};

// Primary stats to emphasize for each position (what they're most responsible for)
export const primaryPositionStats: Record<Position, StatCategory[]> = {
  'GS': ['goals', 'missedGoals', 'rebounds'],
  'GA': ['goals', 'missedGoals', 'rebounds'],
  'WA': ['intercepts', 'pickUp', 'badPass'],
  'C': ['intercepts', 'pickUp', 'badPass'],
  'WD': ['intercepts', 'pickUp', 'badPass'],
  'GD': ['goalsAgainst', 'rebounds', 'intercepts'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts'],
};

// Secondary stats that are still tracked but less emphasized
export const secondaryPositionStats: Record<Position, StatCategory[]> = {
  'GS': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'GA': ['intercepts', 'pickUp', 'badPass', 'handlingError', 'infringement'],
  'WA': ['handlingError', 'infringement'],
  'C': ['handlingError', 'infringement'],
  'WD': ['handlingError', 'infringement'],
  'GD': ['pickUp', 'badPass', 'handlingError', 'infringement'],
  'GK': ['pickUp', 'badPass', 'handlingError', 'infringement'],
};

// Human-readable labels for each stat category
export const statLabels: Record<StatCategory, string> = {
  'goals': 'Goals',
  'missedGoals': 'Missed Goals',
  'goalsAgainst': 'Goals Against',
  'rebounds': 'Rebounds',
  'intercepts': 'Intercepts',
  'pickUp': 'Pick Ups',
  'badPass': 'Bad Passes',
  'handlingError': 'Handling Errors',
  'infringement': 'Infringements'
};