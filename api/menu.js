import { put, head, del } from '@vercel/blob'

const BLOB_NAME = 'menu-data.json'
const BLOB_URL = `https://xckyxnhc311lyejo.public.blob.vercel-storage.com/${BLOB_NAME}`

async function readData() {
  try {
    const response = await fetch(BLOB_URL)
    if (!response.ok) {
      // If blob doesn't exist, return default data
      return { sections: [] }
    }
    return await response.json()
  } catch (error) {
    console.error('Error reading data:', error)
    return { sections: [] }
  }
}

async function writeData(data) {
  try {
    // First, try to delete existing blob
    try {
      await del(BLOB_URL)
    } catch (e) {
      // Blob might not exist, that's ok
    }

    // Upload new data
    await put('menu-data.json', JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })
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
