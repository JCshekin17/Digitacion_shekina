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
  discount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deposit       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12, 2) GENERATED ALWAYS AS (total_price - deposit) STORED,
  seller        TEXT,
  payment_method TEXT,
  payment_proof_url TEXT
);

-- Habilitar Row Level Security
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- Política: permitir lectura solo a usuarios autenticados
CREATE POLICY "Allow authenticated read" ON public.sales_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: permitir inserción pública para que clientes puedan usar el formulario /ventas
CREATE POLICY "Allow public insert" ON public.sales_records
  FOR INSERT WITH CHECK (true);

-- Política: permitir actualización solo a usuarios autenticados
CREATE POLICY "Allow authenticated update" ON public.sales_records
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política: permitir eliminación solo a usuarios autenticados
CREATE POLICY "Allow authenticated delete" ON public.sales_records
  FOR DELETE USING (auth.role() = 'authenticated');

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

-- Tabla de registros de caja
CREATE TABLE IF NOT EXISTS public.cash_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date          DATE NOT NULL,
  advisor       TEXT NOT NULL,
  found_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  consigned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cash_handed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12, 2) GENERATED ALWAYS AS (found_amount - consigned_amount - cash_handed_amount) STORED,
  proof_url     TEXT
);

ALTER TABLE public.cash_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.cash_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON public.cash_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON public.cash_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON public.cash_records FOR DELETE USING (auth.role() = 'authenticated');
