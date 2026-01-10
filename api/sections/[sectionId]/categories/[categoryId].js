import { getMenuData, writeMenuData } from '../../../_lib/db.js'

export default async function handler(req, res) {
  const { sectionId, categoryId } = req.query

  if (req.method === 'DELETE') {
    try {
      const data = await getMenuData()
      const section = data.sections.find(s => s.id === sectionId)
      if (!section) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const categoryIndex = section.categories.findIndex(c => c.id === categoryId)
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Category not found' })
      }

      section.categories.splice(categoryIndex, 1)
      await writeMenuData(data)
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
