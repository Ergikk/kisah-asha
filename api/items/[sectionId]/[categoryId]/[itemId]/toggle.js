import { getMenuData, writeMenuData } from '../../../../../_lib/db.js'

export default async function handler(req, res) {
  const { sectionId, categoryId, itemId } = req.query

  if (req.method === 'PATCH') {
    try {
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
      console.error('Error in PATCH /api/items/.../toggle:', error)
      res.status(500).json({ error: 'Failed to toggle item availability' })
    }
  } else {
    res.setHeader('Allow', ['PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
