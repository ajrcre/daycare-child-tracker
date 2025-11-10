// Note: This is a Vercel Serverless Function. It must be placed in the `/api` directory.

// Default statuses are defined here to ensure the API can initialize data on the first run.
const DEFAULT_STATUSES = [
  { id: '1', label: 'כיתה', color: 'bg-slate-500' },
  { id: '2', label: 'שער', color: 'bg-green-500' },
  { id: '3', label: 'חוג', color: 'bg-purple-500' },
  { id: '4', label: 'לא הגיע', color: 'bg-gray-400' },
];

// Vercel injects these from your project's Environment Variables
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const DATA_KEY = 'daycare_data'; // The key to store our data under in Redis

export default async function handler(request, response) {
  if (!KV_URL || !KV_TOKEN) {
    return response.status(500).json({ error: 'KV environment variables are not configured.' });
  }

  const getUrl = `${KV_URL}/get/${DATA_KEY}`;
  const setUrl = `${KV_URL}/set/${DATA_KEY}`;
  const headers = { 
    'Authorization': `Bearer ${KV_TOKEN}`,
    'Content-Type': 'application/json'
  };

  if (request.method === 'GET') {
    try {
      // FIX: Replaced non-standard `next: { revalidate: 0 }` with standard `cache: 'no-store'` to disable caching.
      const kvResponse = await fetch(getUrl, { headers, cache: 'no-store' }); // Disable caching
      if (!kvResponse.ok) {
        throw new Error(`KV REST API Error: ${kvResponse.statusText}`);
      }
      const { result } = await kvResponse.json();
      
      let data = result ? JSON.parse(result) : null;
      
      if (!data || !data.statuses || data.statuses.length === 0) {
        data = { children: [], statuses: DEFAULT_STATUSES };
      }
      
      return response.status(200).json(data);
    } catch (error) {
      console.error('Failed to fetch data from KV:', error);
      return response.status(500).json({ children: [], statuses: DEFAULT_STATUSES, error: 'Failed to fetch data' });
    }
  }

  if (request.method === 'POST') {
    try {
      if (!request.body) {
          return response.status(400).json({ error: 'Request body is missing' });
      }
      const dataToSave = JSON.stringify(request.body);
      
      const kvResponse = await fetch(setUrl, {
        method: 'POST',
        headers,
        body: dataToSave,
      });
       if (!kvResponse.ok) {
        throw new Error(`KV REST API Error: ${kvResponse.statusText}`);
      }
      return response.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Failed to save data to KV:', error);
      return response.status(500).json({ error: 'Failed to save data' });
    }
  }

  response.setHeader('Allow', ['GET', 'POST']);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}
