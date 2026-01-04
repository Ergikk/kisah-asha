import { useState, useEffect } from 'react'
import { getMenu } from '../api/client.js'
import SectionBlock from '../components/SectionBlock.jsx'

export default function PublicMenu() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMenu().then(setMenu).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mt-8 text-center text-sm">Loading menu...</div>

  return (
    <>
      <div className="flex items-start justify-between text-sm opacity-90 mb-6 px-1">
        <div>
          <div>Operational Hours</div>
          <div className="font-semibold">09.00 - 22.00</div>
        </div>
        <div className="text-right">
          <div>Orders close at <span className="font-semibold">21.30</span></div>
          <div className="text-xs">But the night is still yours!</div>
        </div>
      </div>

      <div className="space-y-8">
        {menu?.sections
          ?.sort((a, b) => a.sortOrder - b.sortOrder)
          ?.map(section => (
            <SectionBlock key={section.id} section={section} />
          )) || <div>No menu data</div>}
      </div>
    </>
  )
}
