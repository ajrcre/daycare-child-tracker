import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Child, Status } from '../types.js';
import { DEFAULT_STATUSES } from '../constants.js';

interface Data {
  children: Child[];
  statuses: Status[];
}

const DATA_KEY = 'daycare-data-store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      let data = await kv.get<Data>(DATA_KEY);
      if (!data) {
        // If no data exists yet, initialize with default statuses
        data = {
          children: [],
          statuses: DEFAULT_STATUSES,
        };
      }
      return res.status(200).json(data);
    } 
    
    if (req.method === 'POST') {
      const { children, statuses } = req.body as Data;

      if (!Array.isArray(children) || !Array.isArray(statuses)) {
        return res.status(400).json({ message: 'Invalid data format provided.' });
      }
      
      await kv.set(DATA_KEY, { children, statuses });
      return res.status(200).json({ message: 'Data saved successfully.' });
    } 
      
    // Handle other methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: `Internal Server Error: ${message}` });
  }
}