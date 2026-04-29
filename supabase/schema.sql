-- ============================================================
-- RESERVAS SHEKINA 2.0 — Esquema de Base de Datos
-- Shekina Tours y Logística
-- ============================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de registros de ventas
CREATE TABLE IF NOT EXISTS public.sales_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date          DATE NOT NULL,
  customer_name TEXT NOT NULL,
  passport_id   TEXT,
  phone         TEXT,
  email         TEXT,
  country       TEXT,
  city          TEXT,
  hotel         TEXT,
  room          TEXT,
  pax           INTEGER NOT NULL DEFAULT 1,
  service       TEXT,
  total_price   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deposit       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12, 2) GENERATED ALWAYS AS (total_price - deposit) STORED
);

-- Habilitar Row Level Security
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- Política: permitir lectura pública (ajustar en producción)
CREATE POLICY "Allow public read" ON public.sales_records
  FOR SELECT USING (true);

-- Política: permitir inserción pública (MVP — restringir con auth en producción)
CREATE POLICY "Allow public insert" ON public.sales_records
  FOR INSERT WITH CHECK (true);

-- Política: permitir actualización pública (MVP)
CREATE POLICY "Allow public update" ON public.sales_records
  FOR UPDATE USING (true);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_sales_records_date ON public.sales_records (date DESC);

-- Índice para búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_sales_records_customer ON public.sales_records (customer_name);

-- Vista de resumen para el dashboard
CREATE OR REPLACE VIEW public.sales_summary AS
SELECT
  COUNT(*)                    AS total_records,
  COALESCE(SUM(total_price), 0) AS total_sales,
  COALESCE(SUM(deposit), 0)    AS total_deposits,
  COALESCE(SUM(balance), 0)    AS total_balance
FROM public.sales_records;

COMMENT ON TABLE public.sales_records IS 'Registros de ventas y reservas - Shekina Tours y Logística';
