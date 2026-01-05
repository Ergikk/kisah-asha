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
