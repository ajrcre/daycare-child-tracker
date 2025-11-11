import { createClient } from 'redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Child, Status } from '../types.js';
import { DEFAULT_STATUSES } from '../constants.js';

const CHILDREN_KEY = 'children';
const STATUSES_KEY = 'statuses';

// Cache the client and the connection promise outside the handler for reuse
let redisClient: ReturnType<typeof createClient> | null = null;
let connectionPromise: Promise<any> | null = null;

async function getConnectedRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL environment variable is not configured.");
  }

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
  }

  if (!redisClient.isOpen) {
    // If a connection attempt is not already in progress, start one.
    if (!connectionPromise) {
      connectionPromise = redisClient.connect().catch(err => {
        connectionPromise = null; // Reset promise on failure
        throw err;
      });
    }
    await connectionPromise;
  }
  return redisClient;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const redis = await getConnectedRedisClient();

    if (req.method === 'GET') {
      const statusesJSON = await redis.get(STATUSES_KEY);
      let statuses: Status[];

      if (!statusesJSON) {
        statuses = DEFAULT_STATUSES;
        await redis.set(STATUSES_KEY, JSON.stringify(statuses));
      } else {
        statuses = JSON.parse(statusesJSON) as Status[];
      }
      
      const childrenJSON = await redis.get(CHILDREN_KEY);
      const children: Child[] = childrenJSON ? JSON.parse(childrenJSON) : [];
      
      res.status(200).json({ children, statuses });

    } else if (req.method === 'POST') {
      const { children, statuses } = req.body;
      if (!Array.isArray(children) || !Array.isArray(statuses)) {
        return res.status(400).json({ message: 'Invalid data format' });
      }

      await Promise.all([
        redis.set(CHILDREN_KEY, JSON.stringify(children)),
        redis.set(STATUSES_KEY, JSON.stringify(statuses))
      ]);

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
