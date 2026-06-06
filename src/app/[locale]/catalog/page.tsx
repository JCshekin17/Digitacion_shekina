import { SERVICES, getTourImages } from '@/lib/services'
import { getSupabaseCatalogImages, getGlobalCatalogSettings } from '@/lib/catalogStorage'
import CatalogGrid from '@/components/CatalogGrid'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

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

  // Fetch global settings
  const settings = await getGlobalCatalogSettings()

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
      </div>

      <CatalogGrid services={servicesWithImages} initialHideWithoutPhotos={settings.hideWithoutPhotos} />
    </div>
  )
}
