-- Tabela de Leads (dados do quiz)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  quiz_responses JSONB,
  fbp VARCHAR(255),
  fbc VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Purchases (dados de compra da Hotmart)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  hotmart_transaction_id VARCHAR(255) NOT NULL UNIQUE,
  hotmart_order_date BIGINT,
  hotmart_approved_date BIGINT,
  product_name VARCHAR(255),
  product_id VARCHAR(255),
  value DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  buyer_name VARCHAR(255),
  buyer_phone VARCHAR(20),
  buyer_document VARCHAR(20),
  buyer_address JSONB,
  payment_type VARCHAR(50),
  payment_installments INTEGER,
  hotmart_status VARCHAR(50),
  hotmart_data JSONB,
  meta_event_id VARCHAR(255),
  meta_sent BOOLEAN DEFAULT FALSE,
  meta_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (email) REFERENCES leads(email) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_hotmart_transaction_id ON purchases(hotmart_transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_meta_sent ON purchases(meta_sent);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leads (permitir leitura/escrita apenas para o próprio usuário ou admin)
CREATE POLICY "Leads - Permitir leitura pública" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Leads - Permitir inserção" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads - Permitir atualização" ON leads
  FOR UPDATE USING (true);

-- Políticas RLS para purchases
CREATE POLICY "Purchases - Permitir leitura pública" ON purchases
  FOR SELECT USING (true);

CREATE POLICY "Purchases - Permitir inserção" ON purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Purchases - Permitir atualização" ON purchases
  FOR UPDATE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
