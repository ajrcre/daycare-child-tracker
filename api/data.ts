import type { NextApiRequest, NextApiResponse } from 'next';
import { Child, Status } from '../types';
import { DEFAULT_STATUSES } from '../constants';

interface Data {
  children: Child[];
  statuses: Status[];
}

// In-memory "database" to store application state.
// This will be reset when the server restarts.
let dataStore: Data = {
  children: [],
  statuses: DEFAULT_STATUSES,
};

/**
 * API handler for managing children and statuses data.
 * - GET /api/data: Retrieves the current list of children and statuses.
 * - POST /api/data: Updates the list of children and statuses.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { message: string }>
) {
  if (req.method === 'GET') {
    res.status(200).json(dataStore);
  } else if (req.method === 'POST') {
    try {
      const { children, statuses } = req.body as Data;
      
      // Basic validation to ensure the payload is in the expected format.
      if (!Array.isArray(children) || !Array.isArray(statuses)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      dataStore = { children, statuses };
      // A success message is sent back, though the client doesn't use it.
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ message: 'Failed to save data' });
    }
  } else {
    // Handle unsupported HTTP methods.
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
