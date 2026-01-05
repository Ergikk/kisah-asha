import { useState, useMemo } from 'react'
import Modal from './Modal.jsx'
import { RiArrowDownWideLine,RiArrowUpWideLine } from "react-icons/ri"



function getSectionStyle(section) {
  return {
    cardBg: section.cardBg || '#803932',
    headerText: section.headerText || '#ffffff',
    subtitleText: section.subtitleText || '#ffffff',
    headerImage: section.headerImage || '/images/breakfast-bg.png',
    categoryActiveBg: section.categoryActiveBg || '#ED473F',
    categoryActiveText: section.categoryActiveText || '#ffffff',
    categoryInactiveBg: section.categoryInactiveBg || '#F4F0E7',
    categoryInactiveText: section.categoryInactiveText || '#000000',
    priceTagBg: section.priceTagBg || '#6c3a34',
    itemCardBg: section.itemCardBg || '#F4F0E7',
    itemCardText: section.itemCardText || '#000000'
  }
}

export default function SectionBlock({ section }) {
  const [isExpanded, setIsExpanded] = useState(false)  // NEW: Collapsed by default
  const [activeCategoryId, setActiveCategoryId] = useState(section.categories?.[0]?.id || null)
  const [openItem, setOpenItem] = useState(null)

  const categories = section.categories || []
  const activeItems = useMemo(() => {
    const cat = categories.find((c) => c.id === activeCategoryId)
    return cat?.items || []
  }, [categories, activeCategoryId])

  const formatPrice = (item) => {
    if (item.customPrice) return item.customPrice
    return item.price ? Math.round(item.price / 1000) + 'K' : ''
  }

  const style = getSectionStyle(section)

  const toggleSection = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) setActiveCategoryId(section.categories?.[0]?.id || null)  // Reset on expand
  }

  return (
    <section className="rounded-3xl" style={{ backgroundColor: style.cardBg }}>
      {/* COLLAPSIBLE HEADER - Always visible */}
      <div
        className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-200 clicked:scale-[1.01] transition-all duration-200"
        onClick={toggleSection}
        style={{ backgroundColor: style.cardBg }}
      >
        <div
          className="relative h-40"
          style={{
            backgroundImage: `url(${style.headerImage.startsWith('/images/') ? `http://localhost:4001${style.headerImage}` : style.headerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: style.cardBg,
          }}
        >
          <div className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <h2 className="text-xl font-bold leading-tight" style={{ color: style.headerText }}>
                {section.name}
              </h2>
              {section.subtitle && (
                <p className="text-xs mt-1" style={{ color: style.subtitleText }}>
                  {section.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE CONTENT - Hidden by default */}
      <div className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'}`} style={{ backgroundColor: style.cardBg }}>
        {/* Category tabs - Only when expanded */}
        <div className="space-y-2 mt-4 mb-4 px-5">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full rounded-xl py-3 px-4 text-center font-semibold shadow-md transition-all duration-200 ${
                  isActive ? 'shadow-xl scale-[1.02]' : 'shadow-lg hover:shadow-xl'
                }`}
                style={{
                  backgroundColor: isActive ? style.categoryActiveBg : style.categoryInactiveBg,
                  color: isActive ? style.categoryActiveText : style.categoryInactiveText
                }}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Items grid - Only when expanded */}
        <div className="flex-1 grid grid-cols-2 gap-3 pt-2 px-5 pb-5">
          {activeItems.length > 0 ? (
            activeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setOpenItem(item)}
                className="group rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] shadow-md relative"
                style={{ backgroundColor: style.itemCardBg }}
              >
                <div className="h-28 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={`http://localhost:4001${item.image}`}
                      alt={item.name}
                      className={`rounded-lg h-full w-full object-cover hover:scale-110 transition-transform duration-300 ${item.isAvailable === false ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-300/50 to-gray-400/50 flex items-center justify-center">
                      <span className="text-lg">📸</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: item.isAvailable === false ? '#803932' : style.priceTagBg, color: item.isAvailable === false ? 'white' : 'white' }}>
                  {item.isAvailable === false ? 'SOLD OUT' : formatPrice(item)}
                </div>
                <div className="p-3 pt-2">
                  <div className="text-sm font-semibold leading-tight h-10 flex items-center justify-center" style={{ color: style.itemCardText }}>
                    {item.name}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 opacity-60 text-black/80">
              No items yet
            </div>
          )}
        </div>

        {/* Beverage Section Footer - Only when expanded */}
        {section.id === 'beverage' && (
          <div className="flex items-center justify-between px-8 py-4 bg-[#ED473F] text-white rounded-b-3xl">
            <div className="text-sm font-normal italic">Additional</div>
            <div className="flex-1 flex justify-center">
              <img src="/stars.png" alt="Stars and Line" className="h-4" />
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm font-normal">Espresso 8</div>
              <div className="text-sm font-normal">Ice Cream 8</div>
            </div>
          </div>
        )}

        {/* Food Section Footer - Only when expanded */}
        {section.id === 'food' && (
          <div className="px-8 py-4 text-black rounded-b-3xl" style={{ backgroundColor: style.cardBg }}>
            <div className="flex items-center mb-2">
              <div className="text-sm font-normal italic" style={{ marginRight: '30px' }}>Additional</div>
              <div className="flex-1 h-px bg-[#222222]"></div>
              <img src="/stars-black.png" alt="Stars and Line" className="h-4 ml-3" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-normal">Nasi</div>
              <div className="text-sm font-normal">5</div>
            </div>
            <div className="text-xs italic text-gray-600 mb-2">Rice</div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-normal">Telur</div>
              <div className="text-sm font-normal">6</div>
            </div>
            <div className="text-xs italic text-gray-600">Scrambled/Sunny Side Up/Omelette/Boiled Egg</div>
          </div>
        )}
      </div>

      {/* Modal - updated price tag position */}
      {openItem && (
        <Modal onClose={() => setOpenItem(null)}>
          <div className="absolute inset-0 h-full w-full">
            {openItem.image ? (
              <img src={`http://localhost:4001${openItem.image}`} alt={openItem.name} className={`h-full w-full object-cover ${openItem.isAvailable === false ? 'grayscale' : ''}`} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-300/50 to-gray-400/50 flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
            )}
          </div>
          <div className="absolute top-6 left-4 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg" style={{ backgroundColor: openItem.isAvailable ? style.priceTagBg : '#803932', color: 'white' }}>
            {openItem.isAvailable ? (openItem.customPrice || `Rp ${openItem.price?.toLocaleString('id-ID') || '36.000'}`) : 'SOLD OUT'}
          </div>
          <h3 className="text-xl font-bold mb-3 leading-tight">{openItem.name}</h3>
          {openItem.descriptionId && (
            <p className="text-sm text-gray-800 mb-2 leading-relaxed">
              {openItem.descriptionId}
            </p>
          )}
          {openItem.descriptionEn && (
            <p className="text-xs italic text-gray-600 mb-4">
              {openItem.descriptionEn}
            </p>
          )}
        </Modal>
      )}
    </section>
  )
}
