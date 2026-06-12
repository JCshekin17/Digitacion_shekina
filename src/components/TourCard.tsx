'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Info, ImageOff, X, ShoppingCart } from 'lucide-react'
import { ServiceItem } from '@/lib/services'

interface TourCardProps {
  service: ServiceItem
  images: string[]
  onAddToCart?: (service: ServiceItem, date: string, pax: number) => void
}

export default function TourCard({ service, images, onAddToCart }: TourCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Cart state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pax, setPax] = useState(1)

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Parse description to extract includes and schedule
  const [isExpanded, setIsExpanded] = useState(false)
  const fullDesc = service.description || "Este servicio no cuenta con una descripción detallada en el sistema."

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Carrusel de Imágenes */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <div 
              className="flex h-full transition-transform duration-500 ease-out cursor-pointer"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              onClick={() => setIsModalOpen(true)}
            >
              {images.map((img, i) => (
                <div key={i} className="min-w-full h-full relative">
                  <Image
                    src={img}
                    alt={`${service.name} - Foto ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-1"
                  />
                </div>
              ))}
            </div>

            {/* Controles del Carrusel (Solo si hay > 1 imagen) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Siguiente foto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Puntos (Dots) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Tag de Cantidad de Fotos */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ImageOff className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-medium">Sin imagen disponible</p>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-[#110E3C] leading-tight mb-2">
            {service.name}
          </h3>
          <div className="text-[#088DCF] font-bold text-xl flex items-center">
            ${service.price.toLocaleString('es-CO')}
            <span className="text-xs text-slate-500 font-normal ml-1 mt-1">/ pers</span>
          </div>
        </div>

        <div className="relative flex-1 mb-4">
          <div className={`text-sm text-slate-600 whitespace-pre-line ${!isExpanded && 'line-clamp-4'}`}>
            {fullDesc}
          </div>
          {fullDesc.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#088DCF] text-sm font-semibold mt-2 hover:underline inline-flex items-center gap-1"
            >
              {isExpanded ? 'Ver menos' : 'Leer más'}
            </button>
          )}
        </div>

        {/* Add to Cart Section */}
        {onAddToCart && (
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Fecha</label>
                <input 
                  type="date" 
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#088DCF] focus:ring-1 focus:ring-[#088DCF] text-slate-700"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="w-16">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Pax</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#088DCF] focus:ring-1 focus:ring-[#088DCF] text-slate-700 text-center"
                  value={pax} 
                  onChange={(e) => setPax(parseInt(e.target.value) || 1)} 
                />
              </div>
            </div>
            <button 
              onClick={() => onAddToCart(service, date, pax)} 
              className="w-full bg-[#088DCF] text-white py-2.5 rounded-xl font-bold hover:bg-[#0670A6] shadow-md shadow-[#088DCF]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" /> Agregar al Carrito
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal para ampliar imagen */}
      {isModalOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-10"
            onClick={() => setIsModalOpen(false)}
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
            <Image
              src={images[currentIndex]}
              alt={`${service.name} - Foto Ampliada`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => handlePrev(e)}
                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => handleNext(e)}
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all"
                aria-label="Siguiente foto"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-6 text-white/80 font-medium text-sm">
            {currentIndex + 1} de {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
