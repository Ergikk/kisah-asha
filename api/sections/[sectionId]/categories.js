import { getMenuData, writeMenuData } from '../../_lib/db.js'

export default async function handler(req, res) {
  const { sectionId } = req.query

  if (req.method === 'POST') {
    try {
      const category = req.body
      if (!category.id || !category.name) {
        return res.status(400).json({ error: 'Missing required fields: id, name' })
      }

      const data = await getMenuData()
      const section = data.sections.find(s => s.id === sectionId)
      if (!section) {
        return res.status(404).json({ error: 'Section not found' })
      }

      const existingIndex = section.categories.findIndex(c => c.id === category.id)
      if (existingIndex >= 0) {
        return res.status(400).json({ error: 'Category with this id already exists' })
      }

      section.categories.push(category)
      await writeMenuData(data)
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
