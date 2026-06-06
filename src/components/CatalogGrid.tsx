'use client'

import { useState } from 'react'
import TourCard from '@/components/TourCard'
import { ServiceItem } from '@/lib/services'

interface ServiceWithImages extends ServiceItem {
  images: string[]
}

interface CatalogGridProps {
  services: ServiceWithImages[]
}

export default function CatalogGrid({ services }: CatalogGridProps) {
  const [hideWithoutPhotos, setHideWithoutPhotos] = useState(false)

  const filteredServices = hideWithoutPhotos
    ? services.filter(s => s.images.length > 0)
    : services

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={hideWithoutPhotos}
            onChange={(e) => setHideWithoutPhotos(e.target.checked)}
            className="rounded text-[#088DCF] focus:ring-[#088DCF] w-4 h-4"
          />
          Ocultar servicios sin fotos
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service, idx) => (
          <TourCard key={idx} service={service} images={service.images} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No hay servicios disponibles con las opciones seleccionadas.
        </div>
      )}
    </div>
  )
}
