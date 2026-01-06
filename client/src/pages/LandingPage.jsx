import { Link } from 'react-router-dom'
import {
  Video, Code, Bot, Shield, Users, Zap, CheckCircle, ArrowRight,
  Play, Star, MessageSquare, Clock, FileText, Sparkles,
  Mic, Monitor, PhoneOff
} from 'lucide-react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">HireeFlow.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin" className="text-slate-400 hover:text-white transition">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Technical Interviews
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Hire the Best
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Engineers </span>
              with AI
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Conduct seamless technical interviews with video calls, collaborative code editor,
              and AI-generated questions tailored to each candidate's resume.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    'from-blue-500 to-blue-600',
                    'from-purple-500 to-purple-600',
                    'from-green-500 to-green-600',
                    'from-pink-500 to-pink-600',
                    'from-orange-500 to-orange-600'
                  ].map((gradient, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-slate-950 flex items-center justify-center text-white text-xs font-medium`}>
                      {['JD', 'AK', 'MR', 'SC', 'PL'][i]}
                    </div>
                  ))}
                </div>
                <span>500+ recruiters</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview - Interactive Interview Room Mockup */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-slate-500">HireeFlow Interview Room</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* Interview Room Preview */}
              <div className="aspect-video bg-slate-900 relative overflow-hidden">
                {/* Main Video Area - Interviewer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Simulated person silhouette */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Head */}
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 mx-auto" />
                      {/* Shoulders */}
                      <div className="w-48 md:w-64 h-20 md:h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-t-full mx-auto -mt-4" />
                    </div>
                  </div>
                </div>

                {/* PiP - Candidate Video */}
                <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-xl border-2 border-slate-600 overflow-hidden shadow-lg">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative scale-50">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mx-auto" />
                      <div className="w-32 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-t-full mx-auto -mt-2" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white">
                    Sarah (Candidate)
                  </div>
                </div>

                {/* Room Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-slate-300">Room: <span className="text-white font-mono">ABC123</span></span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Interviewer</span>
                </div>

                {/* AI Panel Preview */}
                <div className="absolute top-0 right-0 w-64 h-full bg-slate-800/95 border-l border-slate-700 hidden md:block">
                  <div className="p-3 border-b border-slate-700 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-medium text-white">AI Interview Assistant</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="text-[10px] text-slate-400">Generated Questions</div>
                    {['Explain React hooks lifecycle', 'Design a caching system', 'Time complexity of quicksort'].map((q, i) => (
                      <div key={i} className="p-2 bg-slate-700/50 rounded-lg text-[11px] text-slate-300 flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 md:right-64 h-14 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-slate-400">Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-700 rounded-lg"><Mic className="w-4 h-4 text-white" /></div>
                    <div className="p-2 bg-slate-700 rounded-lg"><Video className="w-4 h-4 text-white" /></div>
                    <div className="p-2 bg-slate-700 rounded-lg"><Monitor className="w-4 h-4 text-white" /></div>
                    <div className="p-2 bg-red-600 rounded-lg"><PhoneOff className="w-4 h-4 text-white" /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-purple-600 rounded-lg text-xs text-white">
                      <Code className="w-3 h-3" /> Code
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-400">Powerful features to conduct perfect technical interviews</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Question Generation</h3>
              <p className="text-slate-400">
                Upload a resume and get tailored technical questions instantly. Our AI analyzes skills and experience to create relevant challenges.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Video className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HD Video Calls</h3>
              <p className="text-slate-400">
                Crystal clear video and audio powered by WebRTC. Screen sharing, picture-in-picture, and professional controls included.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Code Editor</h3>
              <p className="text-slate-400">
                Collaborative Monaco editor with syntax highlighting for 8+ languages. Run code in real-time with instant output.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-slate-400">
                Interviewers see AI panel and controls. Candidates only see video and code editor. Secure and focused experience.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <FileText className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Parsing</h3>
              <p className="text-slate-400">
                Upload PDF resumes and our AI extracts skills, experience, and generates personalized interview questions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
              <p className="text-slate-400">
                Create interview rooms in seconds. Share a link with candidates - no downloads or installations required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Interview</h3>
              <p className="text-slate-400">
                Sign up, go to dashboard, and create a new interview room. Upload the candidate's resume for AI-powered questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Invite Candidate</h3>
              <p className="text-slate-400">
                Share the interview link with your candidate via email or message. They can join instantly without creating an account.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Conduct Interview</h3>
              <p className="text-slate-400">
                Use video, code editor, and AI-generated questions to evaluate candidates. Everything synced in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-400">Start free, upgrade when you need</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-slate-400 mb-6">Perfect for trying out</p>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-slate-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {['5 interviews/month', 'Video calls', 'Code editor', 'AI questions (10/day)'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-center transition">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl border border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-blue-200 mb-6">For growing teams</p>
              <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-blue-200">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited interviews', 'Recording & playback', 'Unlimited AI questions', 'Priority support', 'Custom branding'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block w-full py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-center transition">
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-6">For large organizations</p>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'SSO integration', 'ATS integration', 'Dedicated support', 'SLA guarantee'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@hireeflow.ai" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-center transition">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join hundreds of companies using HireeFlow.ai to find the best engineering talent.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-600/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">HireeFlow.ai</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered technical interviews for modern engineering teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 HireeFlow.ai. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition">Twitter</a>
              <a href="#" className="text-slate-500 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-slate-500 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
