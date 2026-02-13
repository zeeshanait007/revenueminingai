import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Database, GitMerge, Layers, MessageSquare, Zap } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-primary/30">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                            A
                        </div>
                        <span className="text-xl font-bold tracking-tight">ARRAlign</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-50">Features</Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-50">How it Works</Link>
                        <Link href="#rps" className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-50">RPS</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-slate-300 hover:text-slate-50 hover:bg-white/5">Sign In</Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0,transparent_70%)] blur-3xl"></div>
                    <div className="absolute top-1/4 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0,transparent_70%)] blur-3xl"></div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                Next-Gen Revenue Intelligence
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-50 to-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                Align Product Decisions <br /> Directly with ARR Growth
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                ARRAlign is a revenue intelligence platform built for mid-market B2B SaaS companies that want to uncover hidden revenue signals buried inside Jira, Slack, and internal discussions.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                                <Link href="/dashboard">
                                    <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                                        Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="#how-it-works">
                                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-slate-50">
                                        Watch Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features/Stats Grid */}
                <section id="features" className="py-24 border-t border-white/5 bg-slate-900/50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-50 mb-4">Uncover the Hidden Signals</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">We connect your operational data to your actual revenue, giving you a board-ready view of what's driving your growth.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <Card className="bg-slate-950/50 border-white/5 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                                <CardHeader>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 mb-4">
                                        <Database className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-xl">Data Integration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Connects to systems like Jira and Slack to analyze tickets, feature requests, support conversations, and internal discussions.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-950/50 border-white/5 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                                <CardHeader>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 mb-4">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-xl">AI Clustering</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Using AI-powered clustering and revenue detection, ARRAlign identifies recurring product gaps and links them to lost deals.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-950/50 border-white/5 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                                <CardHeader>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-slate-100 text-xl">Revenue Potential</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Calculate a proprietary Revenue Potential Score (RPS) that ranks high-impact opportunities based on frequency, effort, and revenue impact.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How it Works / Content Section */}
                <section id="how-it-works" className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-slate-50">
                                    Turn scattered signals <br /> into actionable intelligence.
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">1</div>
                                        <div>
                                            <h3 className="font-semibold text-slate-100">Connect Your Stack</h3>
                                            <p className="text-slate-400 text-sm mt-1">Automatically ingest data from Jira, Slack, and other customer-facing tools.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">2</div>
                                        <div>
                                            <h3 className="font-semibold text-slate-100">Detect Revenue Signals</h3>
                                            <p className="text-slate-400 text-sm mt-1">Our AI identifies recurring product gaps, churn risk, and expansion opportunities.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">3</div>
                                        <div>
                                            <h3 className="font-semibold text-slate-100">Prioritize by Impact</h3>
                                            <p className="text-slate-400 text-sm mt-1">Rank roadmaps based on Revenue Potential Score (RPS) instead of intuition.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
                                    <div className="rounded-xl border border-white/5 bg-slate-950 p-8 shadow-inner overflow-hidden">
                                        {/* Simulated Dashboard UI */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="h-4 w-32 rounded bg-slate-800 animate-pulse"></div>
                                            <div className="h-4 w-24 rounded bg-slate-800 animate-pulse"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Total ARR Drivers</p>
                                                <p className="text-2xl font-bold text-slate-50">$2.4M</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">RPS Average</p>
                                                <p className="text-2xl font-bold text-slate-50">84.2</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 rounded bg-white/5 border border-white/10">
                                                    <div className={`h-8 w-8 rounded flex items-center justify-center ${i === 1 ? 'text-primary bg-primary/10' : 'text-slate-400 bg-white/5'}`}>
                                                        {i === 1 ? <BarChart3 className="h-4 w-4" /> : <GitMerge className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-2 w-3/4 rounded bg-slate-800"></div>
                                                        <div className="h-2 w-1/2 rounded bg-slate-800/50"></div>
                                                    </div>
                                                    <div className="h-6 w-12 rounded bg-slate-800"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Floating elements for premium feel */}
                                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl animate-pulse"></div>
                                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-purple-500/15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Board Ready View Section */}
                <section id="rps" className="py-24 bg-slate-900/30 border-y border-white/5">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-50 mb-6">Board-Ready Executive View</h2>
                        <p className="text-lg text-slate-400 mb-12">
                            Executives gain a clear view of Revenue at Risk, Top ARR Drivers, and Impact vs Effort prioritization.
                            Instead of debating roadmaps based on intuition, leadership teams can make data-backed decisions
                            that maximize return on engineering investment.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            <div className="p-6 rounded-2xl bg-slate-950 border border-white/5">
                                <p className="text-3xl font-bold text-primary mb-1">92%</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Accuracy</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-950 border border-white/5">
                                <p className="text-3xl font-bold text-slate-50 mb-1">3.5x</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">ROI</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-950 border border-white/5">
                                <p className="text-3xl font-bold text-slate-50 mb-1">20h+</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Saved/Week</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-950 border border-white/5">
                                <p className="text-3xl font-bold text-slate-50 mb-1">$0.5M</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Avg Recovery</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <div className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-12 md:p-20 shadow-2xl">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl mb-6">
                                Ready to transform <br className="hidden sm:block" /> your roadmap?
                            </h2>
                            <p className="text-lg text-slate-400 mb-10">
                                ARRAlign transforms scattered product and sales signals into actionable revenue intelligence — helping SaaS companies recover lost ARR and turn their roadmap into a growth engine.
                            </p>
                            <Link href="/dashboard">
                                <Button size="lg" className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        {/* Background blur */}
                        <div className="absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"></div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-slate-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                                A
                            </div>
                            <span className="text-lg font-bold tracking-tight">ARRAlign</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2026 ARRAlign. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link href="#" className="text-slate-500 hover:text-slate-300 transition-colors"><span className="sr-only">Twitter</span><MessageSquare className="h-5 w-5" /></Link>
                            <Link href="#" className="text-slate-500 hover:text-slate-300 transition-colors"><span className="sr-only">GitHub</span><GitMerge className="h-5 w-5" /></Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
