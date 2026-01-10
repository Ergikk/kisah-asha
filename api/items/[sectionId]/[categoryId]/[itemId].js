import { getMenuData, writeMenuData } from '../../../../_lib/db.js'

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
      const data = await getMenuData()

      const section = data.sections.find((s) => s.id === sectionId)
      if (!section) return res.status(404).json({ error: 'Section not found' })

      const category = section.categories.find((c) => c.id === categoryId)
      if (!category) return res.status(404).json({ error: 'Category not found' })

      category.items = category.items.filter((i) => i.id !== itemId)
      normalizeItemSortOrders(category)
      await writeMenuData(data)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error in DELETE:', error)
      res.status(500).json({ error: 'Failed to delete item' })
    }
  } else if (req.method === 'PATCH') {
    try {
      // Handle PATCH /api/items/:sectionId/:categoryId/:itemId/toggle
      const data = await getMenuData()
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
      await writeMenuData(data)
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
