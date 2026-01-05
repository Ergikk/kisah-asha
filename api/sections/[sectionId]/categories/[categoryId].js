import { put, del } from '@vercel/blob'

const BLOB_URL = 'https://xckyxnhc311lyejo.public.blob.vercel-storage.com/menu-data-fEs3LaKmzCPLwGFilnXxwkOtQ1N9F4.json'

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
  const { sectionId, categoryId } = req.query

  if (req.method === 'DELETE') {
    try {
      const data = await readData()
      const section = data.sections.find(s => s.id === sectionId)
      if (!section) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const categoryIndex = section.categories.findIndex(c => c.id === categoryId)
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Category not found' })
      }

      section.categories.splice(categoryIndex, 1)
      await writeData(data)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error in DELETE /api/sections/.../categories/...:', error)
      res.status(500).json({ error: 'Failed to delete category' })
    }
  } else {
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
