import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Child, Status } from '../types.js';
import { DEFAULT_STATUSES } from '../constants.js';

const CHILDREN_KEY = 'children';
const STATUSES_KEY = 'statuses';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      let statuses: Status[] | null = await kv.get(STATUSES_KEY);
      if (!statuses) {
        statuses = DEFAULT_STATUSES;
        await kv.set(STATUSES_KEY, statuses);
      }
      const children: Child[] | null = await kv.get(CHILDREN_KEY);
      
      res.status(200).json({ children: children || [], statuses });

    } else if (req.method === 'POST') {
      const { children, statuses } = req.body;
      if (!Array.isArray(children) || !Array.isArray(statuses)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }
      await kv.set(CHILDREN_KEY, children);
      await kv.set(STATUSES_KEY, statuses);
      res.status(200).json({ message: 'Data saved successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
