import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 4001

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lrisdhi7_db_user:haB5EWEwPqNK91bx@cluster0.fu4xbhh.mongodb.net/'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// Mongoose schemas
const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: Number,
  image: String,
  sortOrder: { type: Number, default: 1 },
  isAvailable: { type: Boolean, default: true }
})

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: [itemSchema]
})

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sortOrder: { type: Number, default: 1 },
  categories: [categorySchema]
})

const menuSchema = new mongoose.Schema({
  sections: [sectionSchema]
})

const Menu = mongoose.model('Menu', menuSchema)

// Multer storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, 'public', 'images')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      extname(file.originalname)
    cb(null, uniqueName)
  },
})
const upload = multer({ storage })

app.use(cors())
app.use(express.json())
app.use('/images', express.static(join(__dirname, 'public', 'images')))

function normalizeSectionSortOrders(data) {
  data.sections.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  data.sections.forEach((s, idx) => {
    s.sortOrder = idx + 1
  })
}

function normalizeItemSortOrders(category) {
  category.items.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  category.items.forEach((item, idx) => {
    item.sortOrder = idx + 1
  })
}

app.get('/api/menu', async (req, res) => {
  try {
    let menu = await Menu.findOne()
    if (!menu) {
      menu = new Menu({ sections: [] })
      await menu.save()
    }
    res.json(menu)
  } catch (err) {
    console.error('Error fetching menu:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/items', async (req, res) => {
  try {
    let { sectionId, categoryId, item: itemData } = req.body
    if (!sectionId || !categoryId || !itemData) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // FIX: itemData might already be an object.
    let item
    try {
      if (typeof itemData === 'string') item = JSON.parse(itemData)
      else item = itemData
    } catch (e) {
      return res.status(400).json({
        error: 'Invalid item format (expected JSON string or object)',
        receivedType: typeof itemData,
      })
    }

    if (req.file) item.image = `/images/${req.file.filename}`

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    let section = menu.sections.find((s) => s.id === sectionId)
    if (!section) {
      section = { id: sectionId, name: sectionId, categories: [] }
      menu.sections.push(section)
    }

    let category = section.categories.find((c) => c.id === categoryId)
    if (!category) {
      category = {
        id: categoryId,
        name: categoryId
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        items: [],
      }
      section.categories.push(category)
    }

    const index = category.items.findIndex((i) => i.id === item.id)
    if (index >= 0) {
      // Editing existing item
      const existingItem = category.items[index]
      const oldSortOrder = Number(existingItem.sortOrder) || 1
      const newSortOrder = Number(item.sortOrder) || oldSortOrder

      // Shift other items based on the move direction
      if (newSortOrder !== oldSortOrder) {
        if (newSortOrder < oldSortOrder) {
          // Moving up: shift items between newSortOrder and oldSortOrder-1 up by 1
          category.items.forEach((i, idx) => {
            if (idx !== index && Number(i.sortOrder) >= newSortOrder && Number(i.sortOrder) < oldSortOrder) {
              i.sortOrder = Number(i.sortOrder) + 1
            }
          })
        } else if (newSortOrder > oldSortOrder) {
          // Moving down: shift items between oldSortOrder+1 and newSortOrder down by 1
          category.items.forEach((i, idx) => {
            if (idx !== index && Number(i.sortOrder) > oldSortOrder && Number(i.sortOrder) <= newSortOrder) {
              i.sortOrder = Number(i.sortOrder) - 1
            }
          })
        }
      }

      item.sortOrder = newSortOrder
      category.items[index] = item
    } else {
      // Adding new item
      const newSortOrder = item.sortOrder || 1

      // Shift items with sortOrder >= newSortOrder
      category.items.forEach((i) => {
        if (i.sortOrder >= newSortOrder) {
          i.sortOrder += 1
        }
      })

      item.sortOrder = newSortOrder
      category.items.push(item)
    }

    await menu.save()
    res.json(item)
  } catch (err) {
    console.error('Error adding item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/items/:sectionId/:categoryId/:itemId', async (req, res) => {
  try {
    const { sectionId, categoryId, itemId } = req.params

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const section = menu.sections.find((s) => s.id === sectionId)
    if (!section) return res.status(404).json({ error: 'Section not found' })

    const category = section.categories.find((c) => c.id === categoryId)
    if (!category) return res.status(404).json({ error: 'Category not found' })

    category.items = category.items.filter((i) => i.id !== itemId)
    normalizeItemSortOrders(category)
    await menu.save()
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting item:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ image: `/images/${req.file.filename}` })
})

// Sections routes
app.post('/api/sections', async (req, res) => {
  try {
    const section = req.body
    if (!section.id || !section.name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' })
    }

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const existingIndex = menu.sections.findIndex(s => s.id === section.id)
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Section with this id already exists' })
    }

    const newSortOrder = Number(section.sortOrder) || (menu.sections.length + 1)

    // Shift sections with sortOrder >= newSortOrder
    menu.sections.forEach((s) => {
      if (Number(s.sortOrder) >= newSortOrder) {
        s.sortOrder = Number(s.sortOrder) + 1
      }
    })

    menu.sections.push({
      ...section,
      sortOrder: Number(newSortOrder),
      categories: section.categories || []
    })
    await menu.save()
    res.json(section)
  } catch (err) {
    console.error('Error adding section:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params
    const updates = req.body

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const currentSection = menu.sections[sectionIndex]
    const oldPos = Number(currentSection.sortOrder)
    const newPos = Number(updates.sortOrder)

    // Shift other sections based on the move direction
    if (!isNaN(newPos) && newPos !== oldPos) {
      if (newPos < oldPos) {
        // Moving up: shift sections between newPos and oldPos-1 up by 1
        menu.sections.forEach((s, idx) => {
          if (idx !== sectionIndex && Number(s.sortOrder) >= newPos && Number(s.sortOrder) < oldPos) {
            s.sortOrder = Number(s.sortOrder) + 1
          }
        })
      } else if (newPos > oldPos) {
        // Moving down: shift sections between oldPos+1 and newPos down by 1
        menu.sections.forEach((s, idx) => {
          if (idx !== sectionIndex && Number(s.sortOrder) > oldPos && Number(s.sortOrder) <= newPos) {
            s.sortOrder = Number(s.sortOrder) - 1
          }
        })
      }
    }

    // Ensure sortOrder is stored as a number
    const updatedSection = { ...menu.sections[sectionIndex], ...updates }
    if (updatedSection.sortOrder !== undefined) {
      updatedSection.sortOrder = Number(updatedSection.sortOrder)
    }
    menu.sections[sectionIndex] = updatedSection

    // Normalize sortOrders to ensure they are sequential and unique
    normalizeSectionSortOrders(menu)

    await menu.save()
    res.json(menu.sections[sectionIndex])
  } catch (err) {
    console.error('Error updating section:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const sectionIndex = menu.sections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) {
      return res.status(404).json({ error: 'Section not found' })
    }

    menu.sections.splice(sectionIndex, 1)
    normalizeSectionSortOrders(menu)
    await menu.save()
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting section:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Categories routes
app.post('/api/sections/:sectionId/categories', async (req, res) => {
  try {
    const { sectionId } = req.params
    const category = req.body
    if (!category.id || !category.name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' })
    }

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const section = menu.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const existingIndex = section.categories.findIndex(c => c.id === category.id)
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Category with this id already exists in this section' })
    }

    section.categories.push({
      ...category,
      items: category.items || []
    })
    await menu.save()
    res.json(category)
  } catch (err) {
    console.error('Error adding category:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/sections/:sectionId/categories/:categoryId', async (req, res) => {
  try {
    const { sectionId, categoryId } = req.params

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const section = menu.sections.find(s => s.id === sectionId)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const categoryIndex = section.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }

    section.categories.splice(categoryIndex, 1)
    await menu.save()
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting category:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Toggle item availability
app.patch('/api/items/:sectionId/:categoryId/:itemId/toggle', async (req, res) => {
  try {
    const { sectionId, categoryId, itemId } = req.params

    const menu = await Menu.findOne()
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    const section = menu.sections.find(s => s.id === sectionId)
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
    await menu.save()
    res.json(item)
  } catch (err) {
    console.error('Error toggling item availability:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin authentication
const ADMIN_PASSWORDS = {
  main: 'tenderloinsteak',
  limited: 'peachtea'
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body

  let level = null
  if (password === ADMIN_PASSWORDS.main) {
    level = 'main'
  } else if (password === ADMIN_PASSWORDS.limited) {
    level = 'limited'
  }

  if (!level) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Generate a simple token
  const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  res.json({ token, level })
})

export default app
