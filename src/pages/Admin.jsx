import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { getMenu, saveItem, deleteItem, addSection, updateSection, deleteSection, addCategory, toggleItemAvailability } from '../api/client.js'
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default function Admin() {
  const navigate = useNavigate()
  const [menu, setMenu] = useState(null)
  const [selected, setSelected] = useState({ sectionId: '', categoryId: '' })
  const [form, setForm] = useState({
    id: '', name: '', price: '', descriptionId: '', descriptionEn: '', image: '', sortOrder: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const [editingItem, setEditingItem] = useState(null)  // NEW: Edit mode
  const [editingSection, setEditingSection] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [sectionImageFile, setSectionImageFile] = useState(null)
  const [sectionImagePreview, setSectionImagePreview] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '' })
  const [sectionForm, setSectionForm] = useState({ name: '', subtitle: '', cardBg: '', headerImage: '', priceTagBg: '', itemCardBg: '', itemCardText: '', headerText: '', subtitleText: '', categoryActiveBg: '', categoryActiveText: '', categoryInactiveBg: '', categoryInactiveText: '', sortOrder: '' })
  const [adminLevel, setAdminLevel] = useState(() => localStorage.getItem('asha_admin_level') || 'main')
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showManageSectionModal, setShowManageSectionModal] = useState(false)
  const [currentAction, setCurrentAction] = useState('add')
  const [searchQuery, setSearchQuery] = useState('')

  // Auth check (fixed token parsing)
  useEffect(() => {
    const token = localStorage.getItem('asha_admin_token')
    if (!token || parseInt(token.split('_')[0]) < Date.now() - 24*60*60*1000) {
      localStorage.removeItem('asha_admin_token')
      navigate('/admin-login')
      return
    }
  }, [navigate])

  useEffect(() => {
    getMenu().then(setMenu).catch(console.error)
  }, [])

  const uploadImage = async (file) => {
    const BASE_URL = API_URL || ''
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    return data.image
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selected.sectionId || !selected.categoryId) return alert('Select section/category first')

    try {
      let finalItem = {
        ...form,
        id: form.id || form.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        price: Number(form.price.replace(/[,.]/g, '')),
        isAvailable: true,
        sortOrder: Number(form.sortOrder) || 1
      }

      if (imageFile) {
        finalItem.image = await uploadImage(imageFile)
      }

      await saveItem(selected.sectionId, selected.categoryId, finalItem)
      setMenu(await getMenu())
      alert('Saved successfully!')
      resetForm()
    } catch (error) {
      alert('Save failed: ' + error.message)
    }
  }

  const handleEdit = (item, sectionId, categoryId) => {  // NEW: Populate form for edit and auto-select category
    setSelected({ sectionId, categoryId })
    setEditingItem(item)
    setForm({
      id: item.id,
      name: item.name,
      price: String(item.price || ''),
      descriptionId: item.descriptionId || '',
      descriptionEn: item.descriptionEn || '',
      image: item.image || '',
      sortOrder: String(item.sortOrder || '')
    })
    setImagePreview(item.image ? item.image : null)
    setCurrentAction('edit')
    setShowAddItemModal(true)
  }

  const handleDelete = async (sectionId, categoryId, itemId) => {
    if (!confirm('Delete this item?')) return
    try {
      await deleteItem(sectionId, categoryId, itemId)
      setMenu(await getMenu())
      alert('Deleted!')
      resetForm()
    } catch {
      alert('Delete failed')
    }
  }

  const resetForm = () => {  // NEW: Clean form
    setForm({ id: '', name: '', price: '', descriptionId: '', descriptionEn: '', image: '', sortOrder: '' })
    setImagePreview(null)
    setImageFile(null)
    setEditingItem(null)
    setShowAddItemModal(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSectionImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSectionImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setSectionImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

const handleAddSection = async (e) => {
  e.preventDefault()
  try {
    let finalSection = {
      id: sectionForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      name: sectionForm.name,
      subtitle: sectionForm.subtitle,
      cardBg: sectionForm.cardBg || '#803932',
      headerImage: sectionForm.headerImage || '/images/default-bg.png',
      priceTagBg: sectionForm.priceTagBg || '#6c3a34',
      itemCardBg: sectionForm.itemCardBg || '#F4F0E7',
      itemCardText: sectionForm.itemCardText || '#000000',
      headerText: sectionForm.headerText || '#ffffff',
      subtitleText: sectionForm.subtitleText || '#ffffff',
      categoryActiveBg: sectionForm.categoryActiveBg || '#ED473F',
      categoryActiveText: sectionForm.categoryActiveText || '#ffffff',
      categoryInactiveBg: sectionForm.categoryInactiveBg || '#F4F0E7',
      categoryInactiveText: sectionForm.categoryInactiveText || '#000000',
      sortOrder: Number(sectionForm.sortOrder) || undefined
    }

    if (sectionImageFile) {
      finalSection.headerImage = await uploadImage(sectionImageFile)
    }

    await addSection(finalSection)
    setMenu(await getMenu())
    alert('Section added!')
    setSectionForm({ name: '', subtitle: '', cardBg: '', headerImage: '', priceTagBg: '', itemCardBg: '', itemCardText: '', headerText: '', subtitleText: '', categoryActiveBg: '', categoryActiveText: '', categoryInactiveBg: '', categoryInactiveText: '', sortOrder: '' })
    setSectionImageFile(null)
    setSectionImagePreview(null)
  } catch (error) {
    alert('Add section failed: ' + error.message)
  }
}

const handleEditSection = (section) => {
  setEditingSection(section)
  setSectionForm({
    name: section.name,
    subtitle: section.subtitle || '',
    cardBg: section.cardBg || '#803932',
    headerImage: section.headerImage || '',
    priceTagBg: section.priceTagBg || '#6c3a34',
    itemCardBg: section.itemCardBg || '#F4F0E7',
    itemCardText: section.itemCardText || '#000000',
    headerText: section.headerText || '#ffffff',
    subtitleText: section.subtitleText || '#ffffff',
    categoryActiveBg: section.categoryActiveBg || '#ED473F',
    categoryActiveText: section.categoryActiveText || '#ffffff',
    categoryInactiveBg: section.categoryInactiveBg || '#F4F0E7',
    categoryInactiveText: section.categoryInactiveText || '#000000',
    sortOrder: section.sortOrder || ''
  })
  setSectionImagePreview(section.headerImage ? section.headerImage : null)
}

const handleUpdateSection = async (e) => {
  e.preventDefault()
  try {
    let finalSection = {
      ...editingSection,
      ...sectionForm
    }

    if (sectionImageFile) {
      finalSection.headerImage = await uploadImage(sectionImageFile)
    }

    await updateSection(editingSection.id, finalSection)
    setMenu(await getMenu())
    alert('Section updated!')
                  setEditingSection(null)
                  setSectionForm({ name: '', subtitle: '', cardBg: '', headerImage: '', priceTagBg: '', itemCardBg: '', itemCardText: '', headerText: '', subtitleText: '', categoryActiveBg: '', categoryActiveText: '', categoryInactiveBg: '', categoryInactiveText: '', sortOrder: '' })
    setSectionImageFile(null)
    setSectionImagePreview(null)
  } catch (error) {
    alert('Update failed')
  }
}

const handleAddCategory = async (sectionId) => {
  try {
    await addCategory(sectionId, {
      id: categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: categoryForm.name
    })
    setMenu(await getMenu())
    setStatus('Category added!')
    setCategoryForm({ name: '' })
  } catch (error) {
    setStatus('Add category failed')
  }
}

const handleDeleteSection = async (sectionId) => {
  if (!confirm('Delete this section and all its categories and items?')) return
  try {
    await deleteSection(sectionId)
    setMenu(await getMenu())
    alert('Section deleted!')
  } catch (error) {
    alert('Delete section failed')
  }
}

  const handleToggleAvailability = async (sectionId, categoryId, itemId) => {
    // Optimistically update local state for immediate UI feedback
    setMenu(prevMenu => ({
      ...prevMenu,
      sections: prevMenu.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              categories: section.categories.map(category =>
                category.id === categoryId
                  ? {
                      ...category,
                      items: category.items.map(item =>
                        item.id === itemId
                          ? { ...item, isAvailable: !item.isAvailable }
                          : item
                      )
                    }
                  : category
              )
            }
          : section
      )
    }));

    try {
      await toggleItemAvailability(sectionId, categoryId, itemId);
      alert('Item availability updated!');
    } catch (error) {
      alert('Toggle availability failed');
      // Revert to server state on failure
      setMenu(await getMenu());
    }
  }

  // Sort menu by sortOrder
  const getSortedMenu = () => {
    if (!menu) return null

    const sortedSections = [...menu.sections].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
    const sortedMenu = {
      ...menu,
      sections: sortedSections.map(section => ({
        ...section,
        categories: [...section.categories].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999)).map(category => ({
          ...category,
          items: [...category.items].sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
        }))
      }))
    }
    return sortedMenu
  }

  // Filter menu based on search query
  const getFilteredMenu = () => {
    const sortedMenu = getSortedMenu()
    if (!searchQuery.trim()) return sortedMenu

    const filteredSections = sortedMenu.sections.map(section => ({
      ...section,
      categories: section.categories.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descriptionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descriptionEn?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    })).filter(section => section.categories.length > 0)

    return { ...sortedMenu, sections: filteredSections }
  }

  if (!menu) return <div className="animate-pulse mt-20 text-center text-white/70">Loading menu...</div>

  return (
    <div className="w-full mx-auto p-4 space-y-6 min-h-screen pb-20">  {/* Responsive width */}
      {/* Header (no duplicate - App.jsx handles) */}
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 md:p-4 rounded-2xl text-black text-base md:text-lg bg-white/95 focus:outline-none focus:ring-4 focus:ring-blue-400/60 shadow-lg"
        />
      </div>

      {adminLevel === 'main' && (
        <>
          {/* Selected Section and Manage Button */}
          <div className="flex gap-3 md:gap-12 mb-6">
            <div className="w-3/4 pt-2">
              <div className="text-sm opacity-75 text-left">
                Selected: <span className="font-mono bg-white/20 px-2 py-1 rounded">
                  {selected.sectionId ? menu.sections.find(s => s.id === selected.sectionId)?.name : '—'} /
                  {selected.categoryId ? menu.sections.flatMap(s => s.categories).find(c => c.id === selected.categoryId)?.name : '—'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowManageSectionModal(true)}
              className="w-1/4 bg-green-500/90 hover:bg-green-600 text-white font-bold py-3 md:py-4 rounded-2xl text-sm md:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-400/60"
            >
              Manage Sections
            </button>
          </div>
        </>
      )}

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-3 text-center">Search Results</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {getFilteredMenu().sections.flatMap(section =>
              section.categories.flatMap(category =>
                category.items.map(item => (
                  <div key={`${section.id}-${category.id}-${item.id}-${item.isAvailable}`} className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {item.image ? (
                        <img src={`${API_URL}${item.image}`} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-white/50 flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-500/50 rounded-lg flex items-center justify-center text-xs text-white/80 flex-shrink-0">No img</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white text-base truncate">{item.name}</div>
                        <div className="text-sm opacity-80 text-white/70">{section.name} / {category.name}</div>
                        <div className="text-sm opacity-60">Rp {item.price?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        key={`${item.id}-${item.isAvailable}`}
                        onClick={() => handleToggleAvailability(section.id, category.id, item.id)}
                        className={`px-2 py-1 text-white text-xs rounded font-medium transition-all ${
                          item.isAvailable
                            ? 'bg-green-500/90 hover:bg-red-600'
                            : 'bg-red-500/90 hover:bg-green-600'
                        }`}
                        title={item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                      >
                        {item.isAvailable ? 'Available' : 'Soldout'}
                      </button>
                      {adminLevel === 'main' && (
                        <>
                          <button
                            onClick={() => handleEdit(item, section.id, category.id)}
                            className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-xs rounded font-medium transition-all"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(section.id, category.id, item.id)}
                            className="px-2 py-1 bg-red-500/90 hover:bg-red-600 text-white text-xs rounded font-medium transition-all"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
            {getFilteredMenu().sections.flatMap(s => s.categories.flatMap(c => c.items)).length === 0 && (
              <div className="text-center py-8 opacity-60 text-white/70">No items found matching "{searchQuery}"</div>
            )}
          </div>
        </div>
      )}



      {/* Menu Grid - Responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 ">  {/* Taller on larger screens */}
        {getSortedMenu().sections.map(section => (
          <div key={section.id} className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <h3 className="font-bold text-lg mb-3 text-white/90">{section.name}</h3>
            {section.categories.map(cat => (
              <div key={cat.id} className="mb-6 p-4 bg-white/10 rounded-xl border border-white/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <div className="flex gap-2 flex-wrap">
                    {adminLevel === 'main' && (
                      <button
                        onClick={() => {
                          setSelected({ sectionId: section.id, categoryId: cat.id })
                          setCurrentAction('add')
                          resetForm()
                          setShowAddItemModal(true)
                        }}
                        className="px-3 py-1.5 bg-green-500/90 hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-all backdrop-blur-sm"
                      >
                        Add Item
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
                  {cat.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 md:p-4 bg-white/20 rounded-lg hover:bg-white/30 transition-all">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {item.image ? (
                          <img src={`${API_URL}${item.image}`} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-white/50 flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-500/50 rounded-lg flex items-center justify-center text-xs text-white/80 flex-shrink-0">No img</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white text-sm md:text-base truncate">{item.name}</div>
                          <div className="text-xs md:text-sm opacity-80">Rp {item.price?.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          key={`${item.id}-${item.isAvailable}`}
                          onClick={() => handleToggleAvailability(section.id, cat.id, item.id)}
                          className={`px-2 py-1 text-white text-xs rounded font-medium transition-all ${
                            item.isAvailable
                              ? 'bg-green-500/90 hover:bg-red-600'
                              : 'bg-red-500/90 hover:bg-green-600'
                          }`}
                          title={item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                        >
                          {item.isAvailable ? 'Available' : 'Soldout'}
                        </button>
                        {adminLevel === 'main' && (
                          <>
                            <button
                              onClick={() => handleEdit(item, section.id, cat.id)}
                              className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-xs rounded font-medium transition-all"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(section.id, cat.id, item.id)}
                              className="px-2 py-1 bg-red-500/90 hover:bg-red-600 text-white text-xs rounded font-medium transition-all"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {cat.items.length === 0 && (
                    <div className="text-xs opacity-60 text-white/70 text-center py-4 italic">No items yet – select to add</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {menu.sections.length === 0 && (
          <div className="text-center py-12 opacity-50">No menu sections found</div>
        )}
      </div>



      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddItemModal(false)}>
          <div className="bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md p-6 rounded-3xl border-2 border-white/20 space-y-4 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white/95">
                {currentAction === 'edit' ? `Edit: ${editingItem?.name}` : 'Add New Item'} ✨
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-white/70 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Menu Photo</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-[#e44b4b] file:to-red-600 file:text-white hover:file:from-red-600 hover:file:to-red-700 cursor-pointer flex-1 w-full text-sm text-white/70 file:transition-all"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-white/50 shadow-lg flex-shrink-0" />
                  )}
                </div>
                {form.image && !imageFile && (
                  <div className="mt-2 text-xs opacity-75 text-white/80">
                    Current: <a href={form.image} target="_blank" className="underline hover:text-blue-400">View</a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Item Name</label>
                <input
                  className="w-full p-4 rounded-2xl text-black text-lg font-semibold bg-white/95 focus:outline-none focus:ring-4 focus:ring-blue-400/60 shadow-lg"
                  placeholder="e.g. Chicken Creamy Rosemary"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Price</label>
                <input
                  className="w-full p-4 rounded-2xl text-black text-lg font-semibold bg-white/95 focus:outline-none focus:ring-4 focus:ring-green-400/60 shadow-lg"
                  type="text"
                  placeholder="36000 or 36,000"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Description (Bahasa Indonesia)</label>
                <textarea
                  className="w-full p-4 rounded-2xl text-black text-base leading-relaxed bg-white/95 focus:outline-none focus:ring-4 focus:ring-purple-400/60 shadow-lg resize-vertical"
                  rows="3"
                  placeholder="Enter description in Indonesian"
                  value={form.descriptionId}
                  onChange={e => setForm({...form, descriptionId: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Description (English)</label>
                <textarea
                  className="w-full p-4 rounded-2xl text-black text-sm leading-relaxed bg-white/95 focus:outline-none focus:ring-4 focus:ring-indigo-400/60 shadow-lg resize-vertical"
                  rows="2"
                  placeholder="Optional English description"
                  value={form.descriptionEn}
                  onChange={e => setForm({...form, descriptionEn: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Sort Order</label>
                <input
                  className="w-full p-4 rounded-2xl text-black text-lg font-semibold bg-white/95 focus:outline-none focus:ring-4 focus:ring-purple-400/60 shadow-lg"
                  type="number"
                  placeholder="1"
                  value={form.sortOrder}
                  onChange={e => setForm({...form, sortOrder: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#e44b4b] to-red-600 text-white font-bold py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-400/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selected.sectionId || !selected.categoryId}
                >
                  {currentAction === 'edit' ? 'Update Item' : 'Add New Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemModal(false)
                    resetForm()
                  }}
                  className="px-6 py-4 bg-gray-500/80 hover:bg-gray-600 text-white font-semibold text-sm rounded-2xl transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Section Modal */}
      {showManageSectionModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-[#6f7f72] backdrop-blur-sm flex items-center justify-center" onClick={() => setShowManageSectionModal(false)}>
          <div className="bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md p-10 rounded-3xl border-2 border-white/20 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-white/95">Manage Sections</h3>
              <button
                onClick={() => setShowManageSectionModal(false)}
                className="text-white/70 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Add/Edit Section Form */}
            <form onSubmit={editingSection ? handleUpdateSection : handleAddSection} className="space-y-3 mb-4 p-3 md:p-4 bg-black/20 rounded-xl">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Section Name</label>
                <input
                  placeholder="Food, Breakfast"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({...sectionForm, name: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Section Subtitle</label>
                <input
                  placeholder="Optional description"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({...sectionForm, subtitle: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Card Background Color</label>
                <input
                  placeholder="#803932"
                  value={sectionForm.cardBg}
                  onChange={(e) => setSectionForm({...sectionForm, cardBg: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Price Tag Background Color</label>
                <input
                  placeholder="#6c3a34"
                  value={sectionForm.priceTagBg}
                  onChange={(e) => setSectionForm({...sectionForm, priceTagBg: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Item Card Background Color</label>
                <input
                  placeholder="#F4F0E7"
                  value={sectionForm.itemCardBg}
                  onChange={(e) => setSectionForm({...sectionForm, itemCardBg: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Item Card Text Color</label>
                <input
                  placeholder="#000000"
                  value={sectionForm.itemCardText}
                  onChange={(e) => setSectionForm({...sectionForm, itemCardText: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Header Text Color</label>
                <input
                  placeholder="#ffffff"
                  value={sectionForm.headerText}
                  onChange={(e) => setSectionForm({...sectionForm, headerText: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Subtitle Text Color</label>
                <input
                  placeholder="#ffffff"
                  value={sectionForm.subtitleText}
                  onChange={(e) => setSectionForm({...sectionForm, subtitleText: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Category Active Background Color</label>
                <input
                  placeholder="#ED473F"
                  value={sectionForm.categoryActiveBg}
                  onChange={(e) => setSectionForm({...sectionForm, categoryActiveBg: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Category Active Text Color</label>
                <input
                  placeholder="#ffffff"
                  value={sectionForm.categoryActiveText}
                  onChange={(e) => setSectionForm({...sectionForm, categoryActiveText: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Category Inactive Background Color</label>
                <input
                  placeholder="#F4F0E7"
                  value={sectionForm.categoryInactiveBg}
                  onChange={(e) => setSectionForm({...sectionForm, categoryInactiveBg: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Category Inactive Text Color</label>
                <input
                  placeholder="#000000"
                  value={sectionForm.categoryInactiveText}
                  onChange={(e) => setSectionForm({...sectionForm, categoryInactiveText: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Sort Order</label>
                <input
                  type="number"
                  placeholder="1"
                  value={sectionForm.sortOrder}
                  onChange={(e) => setSectionForm({...sectionForm, sortOrder: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Header Image</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSectionImageChange}
                    className="file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-[#e44b4b] file:to-red-600 file:text-white hover:file:from-red-600 hover:file:to-red-700 cursor-pointer flex-1 w-full text-sm text-white/70 file:transition-all"
                  />
                  {sectionImagePreview && (
                    <img src={sectionImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-white/50 shadow-lg flex-shrink-0" />
                  )}
                </div>

              </div>
              <button
                type="submit"
                className="w-full bg-green-500/90 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
              >
                {editingSection ? 'Update Section' : 'Add Section'}
              </button>
              {editingSection && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null)
                    setSectionForm({ name: '', subtitle: '', cardBg: '', headerImage: '', priceTagBg: '', itemCardBg: '', itemCardText: '', headerText: '', subtitleText: '', categoryActiveBg: '', categoryActiveText: '', categoryInactiveBg: '', categoryInactiveText: '', sortOrder: '' })
                  }}
                  className="w-full bg-red-500/90 hover:bg-red-600 text-white font-bold py-3 rounded-xl mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>

            {/* Existing Sections List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white/90">Existing Sections</h4>
              {menu.sections.map(section => (
                <div key={section.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="font-medium text-white">{section.name}</div>
                    <div className="text-sm opacity-70 text-white/70">Sort: {section.sortOrder || 'N/A'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-3 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="px-3 py-1 bg-red-500/90 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
