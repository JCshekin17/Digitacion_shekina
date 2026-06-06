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

export interface CatalogSettings {
  hideWithoutPhotos: boolean;
}

export async function getGlobalCatalogSettings(): Promise<CatalogSettings> {
  try {
    const { data, error } = await supabase.storage.from('tours-catalog').download('settings.json')
    if (error || !data) return { hideWithoutPhotos: false }
    const text = await data.text()
    return JSON.parse(text)
  } catch {
    return { hideWithoutPhotos: false }
  }
}

export async function setGlobalCatalogSettings(settings: CatalogSettings): Promise<{success: boolean, error?: string}> {
  try {
    const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' })
    
    // First try to update (if file exists)
    const { error: updateError } = await supabase.storage.from('tours-catalog').update('settings.json', blob, {
      upsert: false
    })

    if (updateError) {
      // If update fails, it likely doesn't exist, so try to insert
      const { error: insertError } = await supabase.storage.from('tours-catalog').upload('settings.json', blob, {
        upsert: false
      })
      
      if (insertError) {
        console.error("Upload error:", insertError)
        return { success: false, error: "Insert falló: " + insertError.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Upload exception:", err)
    return { success: false, error: err.message || "Unknown error" }
  }
}
