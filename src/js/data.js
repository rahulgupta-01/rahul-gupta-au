// New: Simple validation function
function validateData(data) {
  if (!data || !Array.isArray(data.milestones) || !Array.isArray(data.costData)) {
    throw new Error('Invalid data structure received from server.');
  }
  return data;
}

export async function loadJourneyData(config) {
  const version = (config && config.dataVersion) ? String(config.dataVersion) : '1';
  const LS_KEY = `journeyData_v${version}`;

  try {
    const cached = localStorage.getItem(LS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Validate cached data before returning
      return validateData(parsed);
    }
  } catch (e) {
    console.warn(`Ignoring corrupt cache for key: ${LS_KEY}`, e);
    localStorage.removeItem(LS_KEY); // Clear corrupt cache
  }

  try {
    const [milestonesResponse, costDataResponse] = await Promise.all([
      fetch('data/milestones.json', { credentials: 'same-origin' }),
      fetch('data/costData.json', { credentials: 'same-origin' })
    ]);

    if (!milestonesResponse.ok || !costDataResponse.ok) {
      throw new Error('Network response was not ok while fetching journey data.');
    }

    const milestonesData = await milestonesResponse.json();
    const costData = await costDataResponse.json();

    // Sort milestones by date after fetching
    const milestones = milestonesData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const payload = { milestones, costData };
    
    // Validate fetched data before caching and returning
    validateData(payload); 

    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch {}
    return payload;
  } catch (error) {
    console.error('Failed to load journey data:', error);
    // Propagate the error to be caught by the main app initializer
    throw error; 
  }
}