// ============================================================
// Script de Migración - Reservas Shekina 2.0
// Migra datos del proyecto Supabase antiguo al nuevo
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Proyecto ANTIGUO (origen)
const OLD_URL = 'https://sunjrcecovsmiqynwxfd.supabase.co'
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bmpyY2Vjb3ZzbWlxeW53eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzExMjcsImV4cCI6MjA5MzA0NzEyN30.-3o4pqh3ILm6Igrf8n5b0D9B8mcNXrJ2li8QAdMFPfE'

// Proyecto NUEVO (destino)
const NEW_URL = 'https://wqdixfianxhtowlqnpws.supabase.co'
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZGl4ZmlhbnhodG93bHFucHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjE5NjAsImV4cCI6MjA5MjY5Nzk2MH0.MpXdmpNNq5Gmv7sUIxiWA9ceuM8V0f5dYsDNx3bqCpk'

const oldSupabase = createClient(OLD_URL, OLD_KEY)
const newSupabase = createClient(NEW_URL, NEW_KEY)

async function migrateTable(tableName, excludeColumns = []) {
  console.log(`\n📦 Migrando tabla: ${tableName}...`)

  // Leer todos los registros del proyecto antiguo
  const { data, error: readError } = await oldSupabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: true })

  if (readError) {
    console.error(`  ❌ Error leyendo ${tableName}:`, readError.message)
    return { migrated: 0, errors: 1 }
  }

  if (!data || data.length === 0) {
    console.log(`  ⚠️  No hay datos en ${tableName}`)
    return { migrated: 0, errors: 0 }
  }

  console.log(`  📄 Encontrados ${data.length} registros`)

  // Excluir columnas generadas (como 'balance' que es GENERATED ALWAYS)
  const cleanedData = data.map(row => {
    const clean = { ...row }
    excludeColumns.forEach(col => delete clean[col])
    return clean
  })

  // Insertar en lotes de 100 registros
  const BATCH_SIZE = 100
  let migrated = 0
  let errors = 0

  for (let i = 0; i < cleanedData.length; i += BATCH_SIZE) {
    const batch = cleanedData.slice(i, i + BATCH_SIZE)
    const { error: writeError } = await newSupabase
      .from(tableName)
      .insert(batch)

    if (writeError) {
      console.error(`  ❌ Error insertando lote ${Math.floor(i / BATCH_SIZE) + 1}:`, writeError.message)
      errors++
    } else {
      migrated += batch.length
      console.log(`  ✅ Insertados ${migrated}/${data.length}`)
    }
  }

  return { migrated, errors }
}

async function main() {
  console.log('🚀 Iniciando migración de datos...')
  console.log(`   Origen:  ${OLD_URL}`)
  console.log(`   Destino: ${NEW_URL}`)

  // Migrar sales_records (excluir columnas generadas y extras que no están en el nuevo schema)
  const sales = await migrateTable('sales_records', ['balance', 'discount', 'seller', 'payment_method', 'payment_proof_url'])

  // Migrar cash_records (excluir 'balance' porque es columna generada)
  const cash = await migrateTable('cash_records', ['balance'])

  console.log('\n' + '='.length > 0 ? '='.repeat(50) : '')
  console.log('📊 Resumen de migración:')
  console.log(`   sales_records: ${sales.migrated} migrados, ${sales.errors} errores`)
  console.log(`   cash_records:  ${cash.migrated} migrados, ${cash.errors} errores`)

  if (sales.errors === 0 && cash.errors === 0) {
    console.log('\n🎉 ¡Migración completada exitosamente!')
  } else {
    console.log('\n⚠️  Migración completada con errores. Revisa los mensajes anteriores.')
  }
}

main().catch(console.error)
