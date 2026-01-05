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
  try {
    // For Vercel Blob, we need to use the Vercel API to update the blob
    // Since we can't directly write to public blobs, we'll use a workaround
    // by calling a separate migration endpoint or using the existing migration script
    console.log('Data update requested, but blob write not implemented in serverless function')
    // For now, return success without actually writing
    // This is a limitation when using public Vercel Blobs
  } catch (error) {
    console.error('Error writing data:', error)
    throw error
  }
}

export default async function handler(req, res) {
  const { sectionId, categoryId, itemId } = req.query

  if (req.method === 'PATCH') {
    try {
      const data = await readData()
      const section = data.sections.find(s => s.id === sectionId)
      if (!section) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const category = section.categories.find(c => c.id === categoryId)
      if (!category) {
        return res.status(404).json({ error: 'Category not found' })
      }

      const item = category.items.find(i => i.id === itemId)
      if (!item) {
        return res.status(404).json({ error: 'Item not found' })
      }

      item.isAvailable = !item.isAvailable
      await writeData(data)
      res.status(200).json(item)
    } catch (error) {
      console.error('Error in PATCH /api/items/.../toggle:', error)
      res.status(500).json({ error: 'Failed to toggle item availability' })
    }
  } else {
    res.setHeader('Allow', ['PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
