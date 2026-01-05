const BLOB_URL = 'https://xckyxnhc311lyejo.public.blob.vercel-storage.com/menu-data.json'

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
  // Vercel Blob is read-only from serverless functions
  // For now, we'll simulate successful writes but data won't persist
  console.log('Write operation simulated - data not actually saved to blob')
  // In production, this should use Vercel KV or another writable storage
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
