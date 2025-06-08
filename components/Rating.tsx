import { useState } from 'react'

export default function Rating({ onRate }: { onRate: (rating: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex gap-2 mt-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={`px-3 py-1 rounded-full ${selected === n ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setSelected(n)
            onRate(n)
          }}
        >
          {n}★
        </button>
      ))}
    </div>
  )
}
