import { kv } from '@vercel/kv'
import fs from 'fs'
import path from 'path'

const MENU_KEY = 'menu-data'
const DATA_PATH = path.join(process.cwd(), 'backend', 'data', 'menu.json')

async function readData() {
  try {
    let data = await kv.get(MENU_KEY)
    if (!data) {
      // Initialize KV with file data if KV is empty
      if (fs.existsSync(DATA_PATH)) {
        const raw = fs.readFileSync(DATA_PATH, 'utf8')
        data = JSON.parse(raw)
        await kv.set(MENU_KEY, data)
        console.log('Initialized KV with file data')
      } else {
        data = { sections: [] }
      }
    }
    return data
  } catch (error) {
    console.error('Error reading data:', error)
    return { sections: [] }
  }
}

async function writeData(data) {
  try {
    await kv.set(MENU_KEY, data)
  } catch (error) {
    console.error('Error writing data:', error)
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await readData()
      res.status(200).json(data)
    } catch (error) {
      console.error('Error in GET /api/menu:', error)
      res.status(500).json({ error: 'Failed to fetch menu data' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
