'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/routing'
import { SERVICES, normalizeServiceName } from '@/lib/services'
import { getSupabaseCatalogImages } from '@/lib/catalogStorage'
import { UploadCloud, Image as ImageIcon, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function AdminCatalogPage() {
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<any>(true)

  const [selectedService, setSelectedService] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!selectedService || files.length === 0) return

    setUploading(true)
    setMessage('')
    const normService = normalizeServiceName(selectedService).replace(/\s+/g, '-').toLowerCase()

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${normService}/${fileName}`

        const { error } = await supabase.storage
          .from('tours-catalog')
          .upload(filePath, file)

        if (error) {
          throw error
        }
      }
      setMessage(`¡Se subieron ${files.length} foto(s) exitosamente!`)
      setFiles([])
      // Reset input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      console.error(err)
      setMessage(`Error al subir: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-[#088DCF]" />
          <div>
            <h1 className="text-2xl font-black text-[#110E3C]">Administrar Fotos del Catálogo</h1>
            <p className="text-sm text-slate-500">Sube nuevas fotografías para que aparezcan en la vista pública.</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#110E3C] mb-2">Selecciona un Tour / Servicio</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#088DCF]/50"
            >
              <option value="">-- Selecciona --</option>
              {SERVICES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <UploadCloud className="w-12 h-12 text-[#088DCF]/60" />
                <span className="text-slate-600 font-medium">Haz clic para seleccionar imágenes</span>
                <span className="text-xs text-slate-400">Puedes seleccionar múltiples archivos (JPG, PNG)</span>
              </label>

              {files.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="text-sm font-bold text-[#110E3C] mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> {files.length} archivo(s) seleccionado(s):
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {files.map((f, i) => <li key={i}>• {f.name}</li>)}
                  </ul>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-6 w-full bg-[#088DCF] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#088DCF]/25 hover:bg-[#067bb5] transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Subiendo fotos...' : 'Subir Fotos al Catálogo'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h3 className="font-bold text-orange-800 text-sm mb-1">¡Importante!</h3>
            <p className="text-sm text-orange-700">
              Asegúrate de que el bucket de Storage llamado <strong>tours-catalog</strong> esté creado en tu proyecto de Supabase y sea de acceso público.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
