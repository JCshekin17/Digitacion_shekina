export interface ServiceItem {
  name: string
  price: number
  cost: number
}

// Normaliza nombre para comparación: sin tildes, minúsculas, espacios simples
export function normalizeServiceName(s: string): string {
  return (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos/tildes
    .replace(/\s+/g, ' ')            // colapsa espacios múltiples
}

export const SERVICES: ServiceItem[] = [
  { name: 'FULL ADVENTURE', price: 270000, cost: 210000 }, // ⚠️ Confirmar costo real
  { name: '4 ISLAS MARITIMO', price: 220000, cost: 150000 },
  { name: '5 DESTINOS TERRESTRE', price: 260000, cost: 180000 },
  { name: '5 ISLAS BASIC', price: 270000, cost: 210000 },
  { name: '5 ISLAS OPEN BAR', price: 380000, cost: 300000 },
  { name: '5 ISLAS VIP + PLANTON', price: 380000, cost: 300000 },
  { name: 'ATOLON BEACH CLUB', price: 350000, cost: 300000 },
  { name: 'AVIARIO + BARU', price: 160000, cost: 90000 },
  { name: 'TOURS BAHIA BARCO PIRATA', price: 130000, cost: 80000 },
  { name: 'BARU + ISLAS DEL ROSARIO TERRESTRE', price: 180000, cost: 110000 },
  { name: 'BUCEO EN BARU', price: 330000, cost: 250000 },
  { name: 'BORA BORA BEACH VIP', price: 490000, cost: 420000 },
  { name: 'CITY TOURS BARRANQUILLA/SANTA MARTA', price: 280000, cost: 210000 },
  { name: 'BORA BORA BEACH CLUB', price: 390000, cost: 310000 },
  { name: 'CHIVA RUMBERA', price: 50000, cost: 30000 },
  { name: 'CITY TOURS PALENQUE', price: 345000, cost: 300000 },
  { name: 'CITY TOURS PERSONALIZADO X4', price: 280000, cost: 200000 },
  { name: 'CITY TOURS PREMIUM GRUPAL', price: 1100000, cost: 950000 },
  { name: 'ISLABELA BEACH', price: 420000, cost: 360000 },
  { name: 'CITY TOURS LITE', price: 90000, cost: 60000 },
  { name: 'SUNSET CATAMARÁN FLAMANTE', price: 200000, cost: 160000 },
  { name: 'ETEKA BEACH CLUB', price: 300000, cost: 260000 },
  { name: 'IBBIZA BEACH', price: 370000, cost: 300000 },
  { name: 'ISLA PALMA', price: 495000, cost: 420000 },
  { name: 'ISLAS DEL ROSARIO MARITIMO', price: 160000, cost: 120000 },
  { name: 'LUXURY BEACH', price: 420000, cost: 370000 },
  { name: 'LUXURY AMBIENTE VIP', price: 490000, cost: 410000 },
  { name: 'MANGATA BEACH', price: 420000, cost: 360000 },
  { name: 'MARGARITA BEACH', price: 180000, cost: 130000 },
  { name: 'NOCHE BLANCA BEQUIA', price: 300000, cost: 240000 },
  { name: 'PALMARITO BEACH', price: 260000, cost: 200000 },
  { name: 'PALMARITO BEACH VIP', price: 340000, cost: 280000 },
  { name: 'PAO PAO BEACH CLUB', price: 390000, cost: 310000 },
  { name: 'PAUE BEACH', price: 440000, cost: 380000 },
  { name: 'PLAYA TRANQUILA + OCEANARIO MAR', price: 200000, cost: 160000 },
  { name: 'PLAYA TRANQUILA +MAPACHES + BAJO', price: 270000, cost: 190000 },
  { name: 'PASADIA PLAYA BLANCA', price: 100000, cost: 60000 },
  { name: 'PASADIA PLAYA TRANQUILA', price: 170000, cost: 95000 },
  { name: 'PASADIA PUNTA ARENA', price: 80000, cost: 50000 },
  { name: 'ROSARIO BEACH', price: 370000, cost: 300000 },
  { name: 'SANTA MARTA PLAYA BLANCA + ACUARIO', price: 180000, cost: 140000 },
  { name: 'TOUR BAHIA EN BOTE', price: 90000, cost: 55000 },
  { name: 'TOURS BAHIA BEQUIA EAGLE', price: 150000, cost: 110000 },
  { name: 'TOP 3 ISLAS PRIVADAS', price: 380000, cost: 310000 },
  { name: 'TOP 3 BORA BORA', price: 460000, cost: 390000 },
  { name: 'TOURS VOLCAN DEL TOTUMO', price: 170000, cost: 110000 },
]
