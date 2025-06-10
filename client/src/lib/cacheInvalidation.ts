// This file is no longer needed - cache invalidation should happen
// only at data mutation points (when saving/updating data), not during
// UI navigation or team switching.
//
// Individual mutation functions should handle their own cache invalidation
// using React Query's built-in invalidation methods.

export {};