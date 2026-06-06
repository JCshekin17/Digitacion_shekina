import { SERVICES, getTourImages } from '@/lib/services'
import { getSupabaseCatalogImages } from '@/lib/catalogStorage'
import TourCard from '@/components/TourCard'
import { getTranslations } from 'next-intl/server'

export default async function CatalogPage() {
  const t = await getTranslations('Navigation')

  // We only want to show services in the catalog. Some might not have photos yet, 
  // but we should still show them or maybe sort the ones with photos first.
  const servicesWithImages = await Promise.all(SERVICES.map(async (s) => {
    const localImages = getTourImages(s.name)
    const supabaseImages = await getSupabaseCatalogImages(s.name)
    return {
      ...s,
      images: [...localImages, ...supabaseImages]
    }
  }))

  // Sort: Tours with images first, then by name
  servicesWithImages.sort((a, b) => {
    if (a.images.length > 0 && b.images.length === 0) return -1;
    if (a.images.length === 0 && b.images.length > 0) return 1;
    return a.name.localeCompare(b.name);
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#110E3C] tracking-tight">
            {t('catalog')}
          </h1>
          <p className="text-slate-500 mt-2">
            Explora nuestra variedad de tours, pasadías y servicios turísticos.
          </p>
        </div>
        
        {/* Enlace al panel admin para subir fotos (oculto visualmente pero accesible, o un botón real) */}
        <a 
          href="/admin/catalog" 
          className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Administrar Fotos
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {servicesWithImages.map((service, idx) => (
          <TourCard key={idx} service={service} images={service.images} />
        ))}
      </div>
      
      {servicesWithImages.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No hay servicios disponibles en el catálogo en este momento.
        </div>
      )}
    </div>
  )
}
