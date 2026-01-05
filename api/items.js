import { put, head, del } from '@vercel/blob'

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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Handle POST /api/items
      let { sectionId, categoryId, item: itemData } = req.body
      if (!sectionId || !categoryId || !itemData) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

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

      const data = await readData()

      let section = data.sections.find((s) => s.id === sectionId)
      if (!section) {
        section = { id: sectionId, name: sectionId, categories: [] }
        data.sections.push(section)
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

      await writeData(data)
      res.status(200).json(item)
    } catch (error) {
      console.error('Error in POST /api/items:', error)
      res.status(500).json({ error: 'Failed to save item' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
