-- ARRAlign Database Schema
-- PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'viewer', -- admin, analyst, viewer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- jira, slack
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL, -- API credentials, instance URL, etc.
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, error
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, type, name)
);

-- Issues (normalized from all sources)
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL, -- Jira ticket ID, Slack message ID
  source VARCHAR(50) NOT NULL, -- jira, slack
  type VARCHAR(100), -- bug, feature_request, support, discussion
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(100),
  priority VARCHAR(50),
  labels TEXT[],
  metadata JSONB, -- custom fields, attachments, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  external_created_at TIMESTAMP WITH TIME ZONE,
  external_updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(integration_id, external_id)
);

CREATE INDEX idx_issues_organization ON issues(organization_id);
CREATE INDEX idx_issues_source ON issues(source);
CREATE INDEX idx_issues_type ON issues(type);
CREATE INDEX idx_issues_created_at ON issues(external_created_at);

-- Issue Embeddings (for AI clustering)
CREATE TABLE issue_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id)
);

-- Clusters (AI-identified issue groups)
CREATE TABLE clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(255), -- recurring theme/pattern
  issue_count INTEGER DEFAULT 0,
  total_time_spent_hours DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cluster Members (issues in each cluster)
CREATE TABLE cluster_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5, 4), -- 0-1 similarity to cluster centroid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cluster_id, issue_id)
);

CREATE INDEX idx_cluster_members_cluster ON cluster_members(cluster_id);
CREATE INDEX idx_cluster_members_issue ON cluster_members(issue_id);

-- Revenue Signals (detected impact indicators)
CREATE TABLE revenue_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  signal_type VARCHAR(100) NOT NULL, -- deal_blocker, churn_risk, feature_gap, automation_opportunity
  confidence DECIMAL(5, 4), -- 0-1 confidence score
  deal_size_arr DECIMAL(15, 2), -- ARR value if applicable
  customer_name VARCHAR(255),
  urgency VARCHAR(50), -- low, medium, high, critical
  extracted_entities JSONB, -- NLP extracted entities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revenue_signals_organization ON revenue_signals(organization_id);
CREATE INDEX idx_revenue_signals_type ON revenue_signals(signal_type);
CREATE INDEX idx_revenue_signals_urgency ON revenue_signals(urgency);

-- Opportunities (ranked revenue opportunities)
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- missing_feature, automation_gap, bug_fix, roadmap_misalignment
  rps_score DECIMAL(5, 2) NOT NULL, -- Revenue Potential Score (0-100)
  revenue_impact_arr DECIMAL(15, 2), -- Total ARR impact
  frequency_score DECIMAL(5, 2), -- Occurrence frequency (0-100)
  urgency_score DECIMAL(5, 2), -- Time sensitivity (0-100)
  effort_hours DECIMAL(10, 2), -- Estimated engineering hours
  effort_score DECIMAL(5, 2), -- Inverse effort (0-100)
  status VARCHAR(50) DEFAULT 'identified', -- identified, in_progress, completed, dismissed
  affected_customers TEXT[],
  recommended_actions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_opportunities_organization ON opportunities(organization_id);
CREATE INDEX idx_opportunities_rps ON opportunities(rps_score DESC);
CREATE INDEX idx_opportunities_status ON opportunities(status);

-- Reports (board-ready reports)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100), -- executive_summary, detailed_analysis
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  content JSONB NOT NULL, -- Report data structure
  file_url TEXT, -- PDF/Excel export URL
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_organization ON reports(organization_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Sync Logs (track integration sync status)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- running, completed, failed
  items_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clusters_updated_at BEFORE UPDATE ON clusters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
