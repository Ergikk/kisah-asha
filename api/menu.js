import { kv } from '@vercel/kv'

const MENU_KEY = 'menu-data'

async function readData() {
  try {
    return await kv.get(MENU_KEY) || { sections: [] }
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
