# RevenueMiner AI

A production-ready revenue intelligence platform built for mid-market B2B SaaS companies. RevenueMiner transforms scattered operational data from Jira, Slack, and other tools into strategic revenue insights using AI-powered analysis.

## 🚀 Features

### Core Capabilities
- **AI-Powered Clustering**: Automatically groups related issues using OpenAI embeddings and DBSCAN algorithm
- **Revenue Signal Detection**: GPT-4 powered NLP to identify deal blockers, churn risks, and feature gaps
- **Revenue Potential Score (RPS)**: Proprietary scoring algorithm that ranks opportunities by revenue impact
- **Executive Dashboard**: Beautiful, data-driven dashboard with key metrics and visualizations
- **Multi-Source Integration**: Connects to Jira and Slack to analyze tickets, conversations, and feature requests

### Key Metrics
- **Revenue at Risk**: Total ARR impacted by identified issues
- **Top Opportunities**: Ranked list of high-value opportunities
- **Impact vs Effort Matrix**: Visual prioritization framework
- **Cluster Insights**: Recurring patterns and themes

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI/ML**: OpenAI GPT-4, text-embedding-3-small
- **Integrations**: Jira.js, Slack Web API
- **Data Visualization**: Recharts
- **State Management**: TanStack React Query

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- OpenAI API key
- Jira account with API access
- Slack workspace with API access

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd RevenueMinerAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/revenueminer
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # OpenAI
   OPENAI_API_KEY=sk-your-openai-api-key

   # Jira
   JIRA_CLIENT_ID=your-jira-oauth-client-id
   JIRA_CLIENT_SECRET=your-jira-oauth-client-secret

   # Slack
   SLACK_CLIENT_ID=your-slack-client-id
   SLACK_CLIENT_SECRET=your-slack-client-secret
   ```

4. **Set up the database**

   Run the SQL schema file in your PostgreSQL database:
   ```bash
   psql -d revenueminer -f lib/db/schema.sql
   ```

   Or if using Supabase, copy the contents of `lib/db/schema.sql` into the Supabase SQL editor and execute.

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 How It Works

### 1. Data Ingestion
RevenueMiner connects to your Jira and Slack instances to pull:
- Jira tickets (bugs, features, support requests)
- Slack conversations (from support, feature-request, and feedback channels)

### 2. AI Analysis
The platform uses advanced AI to:
- **Cluster similar issues** using semantic embeddings
- **Detect revenue signals** (deal blockers, churn risks, feature gaps)
- **Extract entities** (customer names, deal sizes, urgency levels)

### 3. RPS Calculation
Each opportunity is scored using a weighted formula:
- **Deal Size Impact** (40%): ARR value of affected deals
- **Frequency** (25%): Number of occurrences
- **Urgency** (20%): Time sensitivity
- **Effort** (15%): Estimated engineering hours (inverse)

### 4. Executive Dashboard
Leadership gets actionable insights:
- Total revenue at risk
- Top opportunities ranked by RPS
- Impact vs Effort matrix for prioritization
- Board-ready reports

## 🎯 Usage

### Connecting Integrations

1. Navigate to Settings → Integrations
2. Click "Connect Jira" and authorize your instance
3. Click "Connect Slack" and authorize your workspace
4. Configure which channels to monitor

### Running Analysis

1. Go to the Analysis page
2. Click "Run Analysis"
3. The system will:
   - Sync latest data from integrations
   - Cluster similar issues
   - Detect revenue signals
   - Generate opportunities with RPS scores

### Viewing Opportunities

1. Navigate to the Dashboard
2. Review the "Top Opportunities" list
3. Click on any opportunity for detailed breakdown
4. Use the Impact vs Effort matrix to prioritize

### Generating Reports

1. Click "Generate Report" in the dashboard
2. Select date range and report type
3. Download PDF or Excel format
4. Share with stakeholders

## 🏗️ Project Structure

```
RevenueMinerAI/
├── app/
│   ├── api/                    # API routes
│   │   ├── analysis/          # Clustering & opportunities
│   │   ├── dashboard/         # Metrics
│   │   └── integrations/      # Jira & Slack sync
│   ├── dashboard/             # Main dashboard page
│   └── opportunities/         # Opportunities pages
├── components/
│   ├── dashboard/             # Dashboard components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── ai/                    # AI/ML algorithms
│   │   ├── clustering.ts      # DBSCAN clustering
│   │   ├── revenue-signals.ts # Signal detection
│   │   └── rps-calculator.ts  # RPS scoring
│   ├── db/                    # Database
│   │   ├── schema.sql         # PostgreSQL schema
│   │   ├── types.ts           # TypeScript types
│   │   └── client.ts          # Supabase client
│   ├── integrations/          # External APIs
│   │   ├── jira/              # Jira integration
│   │   └── slack/             # Slack integration
│   ├── hooks/                 # React hooks
│   └── utils/                 # Utility functions
└── public/                    # Static assets
```

## 🔐 Security

- All API keys stored in environment variables
- Row-level security (RLS) in Supabase
- OAuth authentication for integrations
- Rate limiting on API endpoints

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t revenueminer-ai .
docker run -p 3000:3000 revenueminer-ai
```

## 📈 Roadmap

- [ ] Multi-tenant authentication
- [ ] Additional integrations (GitHub, Linear, Zendesk)
- [ ] Custom RPS weight configuration
- [ ] Automated report scheduling
- [ ] Slack/Email notifications
- [ ] API webhooks for external systems

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/yourusername/revenueminer-ai/issues)
- Documentation: [Full docs](https://docs.revenueminer.ai)
- Email: support@revenueminer.ai

---

Built with ❤️ for B2B SaaS companies looking to maximize revenue impact
