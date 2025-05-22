import { Position } from '@shared/schema';

// Define stats categories
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

// Define which stats are relevant for each position
export const positionStats: Record<Position, StatCategory[]> = {
  // Attacking positions
  'GS': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'badPass', 'handlingError'],
  'GA': ['goals', 'missedGoals', 'rebounds', 'intercepts', 'badPass', 'handlingError'],
  
  // Mid-court positions
  'WA': ['pickUp', 'rebounds', 'intercepts', 'badPass', 'handlingError', 'infringement'],
  'C': ['pickUp', 'rebounds', 'intercepts', 'badPass', 'handlingError', 'infringement'],
  'WD': ['pickUp', 'rebounds', 'intercepts', 'badPass', 'handlingError', 'infringement'],
  
  // Defending positions
  'GD': ['goalsAgainst', 'rebounds', 'pickUp', 'intercepts', 'badPass', 'handlingError'],
  'GK': ['goalsAgainst', 'rebounds', 'pickUp', 'intercepts', 'badPass', 'handlingError']
};

// Define primary stats that should be highlighted for each position 
export const primaryPositionStats: Record<Position, StatCategory[]> = {
  'GS': ['goals', 'missedGoals', 'rebounds'],
  'GA': ['goals', 'missedGoals', 'rebounds'],
  'WA': ['pickUp', 'intercepts', 'badPass'],
  'C': ['pickUp', 'intercepts', 'badPass'],
  'WD': ['pickUp', 'intercepts', 'badPass'],
  'GD': ['goalsAgainst', 'rebounds', 'intercepts'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts']
};

// Define secondary stats that are less important but still relevant
export const secondaryPositionStats: Record<Position, StatCategory[]> = {
  'GS': ['intercepts', 'badPass', 'handlingError'],
  'GA': ['intercepts', 'badPass', 'handlingError'],
  'WA': ['rebounds', 'handlingError', 'infringement'],
  'C': ['rebounds', 'handlingError', 'infringement'],
  'WD': ['rebounds', 'handlingError', 'infringement'],
  'GD': ['pickUp', 'badPass', 'handlingError'],
  'GK': ['pickUp', 'badPass', 'handlingError']
};

// Human-readable labels for stat categories
export const statLabels: Record<StatCategory, string> = {
  goals: 'Goals',
  missedGoals: 'Missed Goals',
  goalsAgainst: 'Goals Against',
  rebounds: 'Rebounds',
  intercepts: 'Intercepts',
  pickUp: 'Pick Ups',
  badPass: 'Bad Passes',
  handlingError: 'Handling Errors',
  infringement: 'Infringements'
};