-- Add early-access tracking columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interested_product TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'free_lead';

-- Index for querying early access leads by product
CREATE INDEX IF NOT EXISTS idx_leads_interested_product ON leads(interested_product) WHERE interested_product IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_tag ON leads(tag);
