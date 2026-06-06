import { supabase } from '@/lib/supabase'

export async function getSupabaseCatalogImages(serviceName: string): Promise<string[]> {
  try {
    // Sanitize folder name
    const folder = serviceName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').toLowerCase()
    
    // We assume bucket is "tours-catalog"
    const { data, error } = await supabase.storage.from('tours-catalog').list(folder)
    
    if (error || !data) {
      return []
    }

    // Filter only images (no placeholders or hidden files)
    const images = data.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
    
    // Get public URLs
    return images.map(img => {
      const { data: publicUrlData } = supabase.storage.from('tours-catalog').getPublicUrl(`${folder}/${img.name}`)
      return publicUrlData.publicUrl
    })
  } catch (err) {
    console.error("Error fetching supabase images for", serviceName, err)
    return []
  }
}
