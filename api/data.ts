import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Child, Status } from '../types.js';
import { DEFAULT_STATUSES } from '../constants.js';

const CHILDREN_KEY = 'children';
const STATUSES_KEY = 'statuses';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('--- API Handler Started ---');
  console.log('Method:', req.method);
  console.log('Checking for STORAGE_REST_API_URL:', process.env.STORAGE_REST_API_URL ? `Present (ends with ...${process.env.STORAGE_REST_API_URL.slice(-6)})` : 'MISSING');
  console.log('Checking for STORAGE_REST_API_TOKEN:', process.env.STORAGE_REST_API_TOKEN ? 'Present (Token is set)' : 'MISSING');
  
  // For deep debugging, let's see all environment variables available to the function
  console.log('All available environment variable keys:', JSON.stringify(Object.keys(process.env).sort()));

  try {
    if (!process.env.STORAGE_REST_API_URL || !process.env.STORAGE_REST_API_TOKEN) {
      const errorMsg = 'Database connection is not configured. Missing STORAGE_REST_API_URL or STORAGE_REST_API_TOKEN environment variables.';
      console.error(errorMsg);
      // Also check for the default KV variables to provide a better hint
      if (process.env.KV_REST_API_URL) {
        console.log('Hint: Default KV_REST_API_URL was found. The project might be expecting STORAGE_ prefix instead.');
      }
      return res.status(500).json({ message: errorMsg });
    }

    const kv = createClient({
      url: process.env.STORAGE_REST_API_URL,
      token: process.env.STORAGE_REST_API_TOKEN,
    });
  
    if (req.method === 'GET') {
      let statuses: Status[] | null = await kv.get(STATUSES_KEY);
      if (!statuses || statuses.length === 0) {
        console.log('No statuses found in DB, setting default statuses.');
        statuses = DEFAULT_STATUSES;
        await kv.set(STATUSES_KEY, statuses);
      }
      const children: Child[] | null = await kv.get(CHILDREN_KEY);
      
      console.log(`GET successful: Found ${children?.length || 0} children and ${statuses?.length || 0} statuses.`);
      res.status(200).json({ children: children || [], statuses });

    } else if (req.method === 'POST') {
      const { children, statuses } = req.body;
      if (!Array.isArray(children) || !Array.isArray(statuses)) {
        console.log('POST failed: Invalid data format.');
        return res.status(400).json({ message: 'Invalid data format' });
      }
      await kv.set(CHILDREN_KEY, children);
      await kv.set(STATUSES_KEY, statuses);
      console.log(`POST successful: Saved ${children.length} children and ${statuses.length} statuses.`);
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
