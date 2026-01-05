import { put, del } from '@vercel/blob'

const BLOB_NAME = 'menu-data-fEs3LaKmzCPLwGFilnXxwkOtQ1N9F4.json'
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
  const { sectionId } = req.query

  if (req.method === 'POST') {
    try {
      const category = req.body
      if (!category.id || !category.name) {
        return res.status(400).json({ error: 'Missing required fields: id, name' })
      }

      const data = await readData()
      const section = data.sections.find(s => s.id === sectionId)
      if (!section) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const existingIndex = section.categories.findIndex(c => c.id === category.id)
      if (existingIndex >= 0) {
        return res.status(400).json({ error: 'Category with this id already exists' })
      }

      section.categories.push(category)
      await writeData(data)
      res.status(200).json(category)
    } catch (error) {
      console.error('Error in POST /api/sections/.../categories:', error)
      res.status(500).json({ error: 'Failed to add category' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
