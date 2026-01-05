import { put, del } from '@vercel/blob'

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

function normalizeItemSortOrders(category) {
  category.items.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  category.items.forEach((item, idx) => {
    item.sortOrder = idx + 1
  })
}

export default async function handler(req, res) {
  const { sectionId, categoryId, itemId } = req.query

  if (req.method === 'DELETE') {
    try {
      const data = await readData()

      const section = data.sections.find((s) => s.id === sectionId)
      if (!section) return res.status(404).json({ error: 'Section not found' })

      const category = section.categories.find((c) => c.id === categoryId)
      if (!category) return res.status(404).json({ error: 'Category not found' })

      category.items = category.items.filter((i) => i.id !== itemId)
      normalizeItemSortOrders(category)
      await writeData(data)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error in DELETE:', error)
      res.status(500).json({ error: 'Failed to delete item' })
    }
  } else if (req.method === 'PATCH') {
    try {
      // Handle PATCH /api/items/:sectionId/:categoryId/:itemId/toggle
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
      console.error('Error in PATCH:', error)
      res.status(500).json({ error: 'Failed to toggle item' })
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
