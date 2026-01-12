export default function Modal({ children, onClose, borderColor = '#803932', bgColor = '#F0EBDE', textColor = '#000000' }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto relative" style={{ backgroundColor: bgColor, color: textColor }}>
        {/* Image - taller, no border radius/border */}
        <div className="relative h-64 border-b-2" style={{ borderColor: borderColor }}>
          {/* X button overlaying image */}
          <div className="absolute top-4 right-4 z-10 p-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-gray-300/20 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-white hover:border-gray-400 hover:shadow-md transition-all duration-200 shadow-lg"
            >
              ×
            </button>
          </div>
          
          {/* Image content */}
          <div className="h-full w-full">
            {children[0]}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 pb-4">
          {children.slice(1)}
        </div>
      </div>
    </div>
  )
}
