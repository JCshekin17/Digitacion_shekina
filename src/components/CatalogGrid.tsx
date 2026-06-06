'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { setGlobalCatalogSettings } from '@/lib/catalogStorage'
import TourCard from '@/components/TourCard'
import { ServiceItem } from '@/lib/services'
import Link from 'next/link'

interface ServiceWithImages extends ServiceItem {
  images: string[]
}

interface CatalogGridProps {
  services: ServiceWithImages[]
  initialHideWithoutPhotos?: boolean
}

export default function CatalogGrid({ services, initialHideWithoutPhotos = false }: CatalogGridProps) {
  const [hideWithoutPhotos, setHideWithoutPhotos] = useState(initialHideWithoutPhotos)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'shekinatoursylogistica@outlook.com') {
        setIsAdmin(true)
      } else {
        // También podríamos permitir que otros roles asesores vean esto si lo prefieren,
        // pero por la instrucción "solo sean visibles cuando ingrese desde el usuario administrador"
        // lo restringiremos al correo admin.
      }
    }
    checkUser()
  }, [])

  const filteredServices = hideWithoutPhotos
    ? services.filter(s => s.images.length > 0)
    : services

  return (
    <div>
      {isAdmin && (
        <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-4">
          <Link 
            href="/admin/catalog" 
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Administrar Fotos
          </Link>
          <label className={`flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium ${isSaving ? 'opacity-50 text-slate-400' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              disabled={isSaving}
              checked={hideWithoutPhotos}
              onChange={async (e) => {
                const newVal = e.target.checked;
                setHideWithoutPhotos(newVal);
                setIsSaving(true);
                const result = await setGlobalCatalogSettings({ hideWithoutPhotos: newVal });
                setIsSaving(false);
                if (!result.success) {
                  setHideWithoutPhotos(!newVal);
                  alert("Error al guardar: " + result.error + "\n\nAsegúrate de haber ejecutado el SQL en Supabase o revisa el nombre del bucket.");
                }
              }}
              className="rounded text-[#088DCF] focus:ring-[#088DCF] w-4 h-4 disabled:opacity-50"
            />
            {isSaving ? 'Guardando...' : 'Ocultar servicios sin fotos'}
          </label>
        </div>
      )}

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
