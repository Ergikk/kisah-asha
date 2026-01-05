const API_URL = import.meta.env.VITE_API_URL || ''

export async function getMenu() {
  const res = await fetch(`${API_URL}/api/menu`)
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}

export async function saveItem(sectionId, categoryId, item) {
  const res = await fetch(`${API_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId, categoryId, item }),
  })
  if (!res.ok) throw new Error('Failed to save')
  return res.json()
}

export async function deleteItem(sectionId, categoryId, itemId) {
  const res = await fetch(`${API_URL}/api/items/${sectionId}/${categoryId}/${itemId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete')
  return res.json()
}

export async function addSection(section) {
  const res = await fetch(`${API_URL}/api/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section)
  })
  return res.json()
}

export async function updateSection(sectionId, section) {
  const res = await fetch(`${API_URL}/api/sections/${sectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section)
  })
  return res.json()
}

export async function deleteSection(sectionId) {
  await fetch(`${API_URL}/api/sections/${sectionId}`, { method: 'DELETE' })
}

export async function addCategory(sectionId, category) {
  const res = await fetch(`${API_URL}/api/sections/${sectionId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  return res.json()
}

export async function deleteCategory(sectionId, categoryId) {
  await fetch(`${API_URL}/api/sections/${sectionId}/categories/${categoryId}`, { method: 'DELETE' })
}

export async function toggleItemAvailability(sectionId, categoryId, itemId) {
  const res = await fetch(`${API_URL}/api/items/${sectionId}/${categoryId}/${itemId}/toggle`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to toggle availability')
  return res.json()
}

export async function adminLogin(password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return res.json()
}
