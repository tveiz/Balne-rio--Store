-- Criar tabela de usuários (profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  hwid TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users (todos podem ver todos os usuários básicos)
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' LIMIT 1));

-- Criar tabela de configurações do site
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Minha Loja',
  site_description TEXT NOT NULL DEFAULT 'A melhor loja online',
  theme TEXT NOT NULL DEFAULT 'normal',
  payment_method TEXT NOT NULL DEFAULT 'simulacao',
  pix_key TEXT,
  qr_code_url TEXT,
  bank_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_update_admin" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "site_settings_insert_admin" ON public.site_settings FOR INSERT WITH CHECK (true);

-- Inserir configuração padrão
INSERT INTO public.site_settings (site_name, site_description, theme, payment_method) 
VALUES ('Minha Loja', 'A melhor loja online', 'normal', 'simulacao')
ON CONFLICT DO NOTHING;

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE USING (true);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  photo_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (true);
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (true);

-- Criar tabela de estoque de produtos (chaves de entrega)
CREATE TABLE IF NOT EXISTS public.product_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_keys_select_admin" ON public.product_keys FOR SELECT USING (true);
CREATE POLICY "product_keys_insert_admin" ON public.product_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "product_keys_update_admin" ON public.product_keys FOR UPDATE USING (true);
CREATE POLICY "product_keys_delete_admin" ON public.product_keys FOR DELETE USING (true);

-- Criar tabela de cupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_all" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_insert_admin" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "coupons_update_admin" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "coupons_delete_admin" ON public.coupons FOR DELETE USING (true);

-- Criar tabela de compras
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_photo TEXT NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  coupon_used TEXT,
  product_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));
CREATE POLICY "purchases_insert_own" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "purchases_update_admin" ON public.purchases FOR UPDATE USING (true);
CREATE POLICY "purchases_select_all_admin" ON public.purchases FOR SELECT USING (true);

-- Criar tabela de atendentes
CREATE TABLE IF NOT EXISTS public.support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_agents_select_all" ON public.support_agents FOR SELECT USING (true);
CREATE POLICY "support_agents_insert_admin" ON public.support_agents FOR INSERT WITH CHECK (true);
CREATE POLICY "support_agents_delete_admin" ON public.support_agents FOR DELETE USING (true);

-- Criar tabela de termos aceitos
CREATE TABLE IF NOT EXISTS public.terms_accepted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ip_address TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.terms_accepted ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terms_accepted_select_all" ON public.terms_accepted FOR SELECT USING (true);
CREATE POLICY "terms_accepted_insert_all" ON public.terms_accepted FOR INSERT WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_product_keys_product ON public.product_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keys_used ON public.product_keys(is_used);
