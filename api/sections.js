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

function normalizeSectionSortOrders(data) {
  data.sections.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  data.sections.forEach((s, idx) => {
    s.sortOrder = idx + 1
  })
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const section = req.body
      if (!section.id || !section.name) {
        return res.status(400).json({ error: 'Missing required fields: id, name' })
      }

      const data = await readData()
      const existingIndex = data.sections.findIndex(s => s.id === section.id)
      if (existingIndex >= 0) {
        return res.status(400).json({ error: 'Section with this id already exists' })
      }

      const newSortOrder = Number(section.sortOrder) || (data.sections.length + 1)

      // Shift sections with sortOrder >= newSortOrder
      data.sections.forEach((s) => {
        if (Number(s.sortOrder) >= newSortOrder) {
          s.sortOrder = Number(s.sortOrder) + 1
        }
      })

      data.sections.push({
        ...section,
        sortOrder: Number(newSortOrder),
        categories: section.categories || []
      })
      await writeData(data)
      res.status(200).json(section)
    } catch (error) {
      console.error('Error in POST /api/sections:', error)
      res.status(500).json({ error: 'Failed to create section' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
