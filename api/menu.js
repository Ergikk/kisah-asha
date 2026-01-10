import { getMenuData } from './_lib/db.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await getMenuData()
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
