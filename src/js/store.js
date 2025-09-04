/**
 * @file A simple centralized state management store.
 */

const LS_KEY = 'prDashboardState';

// Load initial state from localStorage
function loadState() {
  try {
    const savedState = localStorage.getItem(LS_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (e) {
    console.error('Could not load state from localStorage', e);
  }
  // Default initial state if nothing is saved
  return {
    points: {},
    costs: {},
  };
}

// The central, exported state object
export const state = loadState();

let subscribers = [];

// A function to update the state and notify subscribers
export function setState(newState) {
  // Merge the new state into the existing state
  Object.assign(state, newState);
  
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Could not save state to localStorage', e);
  }
  
  // Notify all subscribed components that the state has changed
  subscribers.forEach(callback => callback());
}

// A function for components to subscribe to state changes
export function subscribe(callback) {
  subscribers.push(callback);
  // Return an unsubscribe function for cleanup, though it's not used in this app
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
}