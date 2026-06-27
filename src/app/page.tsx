import { NavAuth, MobileNavAuth } from "@/components/NavAuth";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <ScrollReveal>
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="nav" id="nav">
        <div className="nav-inner">
          <a href="https://alione.cc" className="nav-logo">
            <img src="/alione.png" alt="AliOne" className="logo-img" />
          </a>
          <div className="nav-links">
            <a href="#ecosystem" className="nav-link">Products</a>
            <a href="#privacy" className="nav-link">Privacy</a>
            <a href="#community" className="nav-link">Community</a>
            <a href="#roadmap" className="nav-link">Roadmap</a>
          </div>
          <div className="nav-actions">
            <NavAuth />
          </div>
          <button className="nav-mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu">
        <div className="mobile-menu-inner">
          <a href="#ecosystem" className="mobile-link">Products</a>
          <a href="#privacy" className="mobile-link">Privacy</a>
          <a href="#community" className="mobile-link">Community</a>
          <a href="#roadmap" className="mobile-link">Roadmap</a>
          <div className="mobile-menu-actions">
            <MobileNavAuth />
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-gradient-orb hero-orb-1"></div>
          <div className="hero-gradient-orb hero-orb-2"></div>
          <div className="hero-gradient-orb hero-orb-3"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge reveal-up">
              <span className="badge-dot"></span>
              Privacy-first ecosystem
            </div>
            <h1 className="hero-title reveal-up" style={{ animationDelay: "0.1s" }}>
              Your digital life,<br />
              <span className="hero-title-accent">owned by you.</span>
            </h1>
            <p className="hero-description reveal-up" style={{ animationDelay: "0.2s" }}>
              AliOne is building a complete ecosystem of privacy-focused internet products.
              Starting with AliBrowser — a privacy-first browser built with our community.
            </p>
            <div className="hero-actions reveal-up" style={{ animationDelay: "0.3s" }}>
              <a href="/sign-up" className="btn btn-primary btn-lg">
                Get Started
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="/sign-up" className="btn btn-secondary btn-lg">
                Sign Up
              </a>
            </div>
            <div className="hero-stats reveal-up" style={{ animationDelay: "0.4s" }}>
              <div className="hero-stat">
                <span className="hero-stat-number" data-count="1">0</span>
                <span className="hero-stat-label">Product Live</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number" data-count="7">0</span>
                <span className="hero-stat-label">Coming Soon</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">&infin;</span>
                <span className="hero-stat-label">Privacy</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* AliBrowser Spotlight */}
      <section className="section spotlight-section" id="alibrowser">
        <div className="container">
          <div className="spotlight-layout">
            <div className="spotlight-content">
              <div className="spotlight-badge reveal-up">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/alibrowser-logo.png" alt="AliBrowser" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "contain" }} />
                Now Available
              </div>
              <h2 className="spotlight-title reveal-up" style={{ animationDelay: "0.1s" }}>
                AliBrowser
              </h2>
              <p className="spotlight-description reveal-up" style={{ animationDelay: "0.15s" }}>
                The privacy-first browser that puts you in control. Block trackers, organize your workflow with workspaces, and browse without being watched.
              </p>
              <div className="spotlight-features reveal-up" style={{ animationDelay: "0.2s" }}>
                <div className="spotlight-feature">
                  <div className="spotlight-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/><line x1="2" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.2"/></svg>
                  </div>
                  <div>
                    <h4>Vertical Tabs</h4>
                    <p>Organize tabs vertically for better workflow</p>
                  </div>
                </div>
                <div className="spotlight-feature">
                  <div className="spotlight-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                  </div>
                  <div>
                    <h4>Workspaces</h4>
                    <p>Separate browsing contexts for different tasks</p>
                  </div>
                </div>
                <div className="spotlight-feature">
                  <div className="spotlight-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L10 18M2 10L18 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/></svg>
                  </div>
                  <div>
                    <h4>Tracker Blocking</h4>
                    <p>Block invasive trackers and ads by default</p>
                  </div>
                </div>
                <div className="spotlight-feature">
                  <div className="spotlight-feature-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10C5 7.24 7.24 5 10 5M15 10C15 12.76 12.76 15 10 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                  </div>
                  <div>
                    <h4>Cross-device Sync</h4>
                    <p>Sync bookmarks, tabs, and settings securely</p>
                  </div>
                </div>
              </div>
              <div className="spotlight-actions reveal-up" style={{ animationDelay: "0.25s" }}>
                <a href="https://alione.cc" className="btn btn-primary btn-lg">
                  Sign Up
                </a>
              </div>
            </div>
            <div className="spotlight-visual reveal-up" style={{ animationDelay: "0.2s" }}>
              <div className="browser-mockup-large">
                <div className="browser-bar">
                  <div className="browser-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="browser-url">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L6 11M1 6L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    alibrowser.alione.cc
                  </div>
                </div>
                <div className="browser-content">
                  <div className="browser-sidebar">
                    <div className="sidebar-tab active"></div>
                    <div className="sidebar-tab"></div>
                    <div className="sidebar-tab"></div>
                    <div className="sidebar-tab"></div>
                    <div className="sidebar-tab"></div>
                  </div>
                  <div className="browser-page">
                    <div className="page-block w-full"></div>
                    <div className="page-block w-3-4"></div>
                    <div className="page-block w-full"></div>
                    <div className="page-block w-1-2"></div>
                    <div className="page-block w-2-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="section ecosystem" id="ecosystem">
        <div className="container">
          <div className="section-header">
            <span className="section-label reveal-up">Ecosystem</span>
            <h2 className="section-title reveal-up" style={{ animationDelay: "0.1s" }}>
              One ecosystem.<br />Infinite possibilities.
            </h2>
            <p className="section-description reveal-up" style={{ animationDelay: "0.15s" }}>
              Every product works together through a single AliOne account.
              Built for privacy, designed for speed. Most products are coming soon.
            </p>
          </div>
          <div className="product-grid">
            {/* AliBrowser — LIVE */}
            <a href="https://alibrowser.alione.cc" className="product-card product-card-live reveal-up" style={{ animationDelay: "0.05s" }} data-product="browser">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-browser">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/alibrowser-logo.png" alt="AliBrowser" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain" }} />
                  </div>
                  <span className="product-status product-status-live">Live</span>
                </div>
                <h3 className="product-name">AliBrowser</h3>
                <p className="product-desc">Privacy-first browser with vertical tabs, workspaces, and tracker blocking.</p>
                <div className="product-features">
                  <span className="product-feature">Vertical Tabs</span>
                  <span className="product-feature">Workspaces</span>
                  <span className="product-feature">Tracker Blocking</span>
                  <span className="product-feature">Cross-device Sync</span>
                </div>
                <div className="product-card-visual browser-visual">
                  <div className="browser-mockup">
                    <div className="browser-bar">
                      <div className="browser-dots"><span></span><span></span><span></span></div>
                      <div className="browser-url">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L6 11M1 6L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        alibrowser.alione.cc
                      </div>
                    </div>
                    <div className="browser-content">
                      <div className="browser-sidebar">
                        <div className="sidebar-tab active"></div>
                        <div className="sidebar-tab"></div>
                        <div className="sidebar-tab"></div>
                      </div>
                      <div className="browser-page">
                        <div className="page-block w-full"></div>
                        <div className="page-block w-3-4"></div>
                        <div className="page-block w-1-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>

            {/* AliSearch — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.1s" }} data-product="search">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-search">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/><line x1="22" y1="22" x2="29" y2="29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliSearch</h3>
                <p className="product-desc">Anonymous search engine. No profiling. No tracking. Just results.</p>
                <div className="product-features">
                  <span className="product-feature">Anonymous</span>
                  <span className="product-feature">No Profiling</span>
                  <span className="product-feature">Fast Results</span>
                  <span className="product-feature">Transparent Ranking</span>
                </div>
                <div className="product-card-visual search-visual">
                  <div className="search-mockup">
                    <div className="search-logo-text">AliSearch</div>
                    <div className="search-bar-mock">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="10" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <span>Search privately...</span>
                    </div>
                    <div className="search-results-mock">
                      <div className="search-result-line w-full"></div>
                      <div className="search-result-line w-3-4"></div>
                      <div className="search-result-line w-1-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliOne — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.15s" }} data-product="one">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-one">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 22L16 10L22 22H10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliOne</h3>
                <p className="product-desc">Your all-in-one privacy hub. One account, every product, complete control.</p>
                <div className="product-features">
                  <span className="product-feature">Single Sign-on</span>
                  <span className="product-feature">Unified Dashboard</span>
                  <span className="product-feature">Cross-product Sync</span>
                  <span className="product-feature">Privacy Control</span>
                </div>
                <div className="product-card-visual one-visual">
                  <div className="one-mockup">
                    <div className="one-ring">
                      <div className="one-node one-node-1"></div>
                      <div className="one-node one-node-2"></div>
                      <div className="one-node one-node-3"></div>
                      <div className="one-node one-node-4"></div>
                    </div>
                    <div className="one-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/alione.png" alt="AliOne" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "contain" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliMail — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.2s" }} data-product="mail">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-mail">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="7" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10L16 19L29 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliMail</h3>
                <p className="product-desc">End-to-end encrypted email with modern privacy-first inbox experience.</p>
                <div className="product-features">
                  <span className="product-feature">E2E Encryption</span>
                  <span className="product-feature">Custom Domains</span>
                  <span className="product-feature">Spam Protection</span>
                  <span className="product-feature">Secure Attachments</span>
                </div>
                <div className="product-card-visual mail-visual">
                  <div className="mail-mockup">
                    <div className="mail-sidebar">
                      <div className="mail-folder active"></div>
                      <div className="mail-folder"></div>
                      <div className="mail-folder"></div>
                    </div>
                    <div className="mail-list">
                      <div className="mail-item">
                        <div className="mail-item-dot"></div>
                        <div className="mail-item-lines"><div className="mail-line w-3-4"></div><div className="mail-line w-1-2"></div></div>
                      </div>
                      <div className="mail-item">
                        <div className="mail-item-lines"><div className="mail-line w-full"></div><div className="mail-line w-2-3"></div></div>
                      </div>
                      <div className="mail-item">
                        <div className="mail-item-lines"><div className="mail-line w-2-3"></div><div className="mail-line w-1-3"></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliDrive — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.25s" }} data-product="drive">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-drive">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 22L16 6L26 22H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="11" y1="22" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5"/><line x1="21" y1="22" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliDrive</h3>
                <p className="product-desc">Private cloud storage with encrypted file syncing and automatic backups.</p>
                <div className="product-features">
                  <span className="product-feature">Encrypted Storage</span>
                  <span className="product-feature">File Syncing</span>
                  <span className="product-feature">Auto Backups</span>
                  <span className="product-feature">Cross-platform</span>
                </div>
                <div className="product-card-visual drive-visual">
                  <div className="drive-mockup">
                    <div className="drive-grid">
                      <div className="drive-folder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7H13L11 5H5C3.9 5 3 5.9 3 7Z" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                      <div className="drive-folder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7H13L11 5H5C3.9 5 3 5.9 3 7Z" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                      <div className="drive-file"></div>
                      <div className="drive-file"></div>
                      <div className="drive-folder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7H13L11 5H5C3.9 5 3 5.9 3 7Z" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                      <div className="drive-file"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliPhotos — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.3s" }} data-product="photos">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-photos">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="5" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 22L10 16L16 20L22 14L29 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliPhotos</h3>
                <p className="product-desc">Private photo storage with AI organization and family libraries.</p>
                <div className="product-features">
                  <span className="product-feature">AI Organization</span>
                  <span className="product-feature">Shared Albums</span>
                  <span className="product-feature">Family Libraries</span>
                  <span className="product-feature">Privacy Controls</span>
                </div>
                <div className="product-card-visual photos-visual">
                  <div className="photos-mockup">
                    <div className="photo-grid">
                      <div className="photo-item photo-large"></div>
                      <div className="photo-item"></div>
                      <div className="photo-item"></div>
                      <div className="photo-item photo-wide"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliDocs — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.35s" }} data-product="docs">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-docs">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="3" width="20" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="11" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliDocs</h3>
                <p className="product-desc">Collaborative documents with real-time editing and offline support.</p>
                <div className="product-features">
                  <span className="product-feature">Real-time Collab</span>
                  <span className="product-feature">Offline Support</span>
                  <span className="product-feature">Notes &amp; Docs</span>
                  <span className="product-feature">Secure Sharing</span>
                </div>
                <div className="product-card-visual docs-visual">
                  <div className="docs-mockup">
                    <div className="docs-toolbar"><div className="toolbar-btn"></div><div className="toolbar-btn"></div><div className="toolbar-btn"></div></div>
                    <div className="docs-content">
                      <div className="doc-line w-full heading"></div>
                      <div className="doc-line w-3-4"></div>
                      <div className="doc-line w-full"></div>
                      <div className="doc-line w-2-3"></div>
                      <div className="doc-line w-full"></div>
                      <div className="doc-line w-1-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AliChat — Coming Soon */}
            <div className="product-card product-card-soon reveal-up" style={{ animationDelay: "0.4s" }} data-product="chat">
              <div className="product-card-glow"></div>
              <div className="product-card-inner">
                <div className="product-card-header">
                  <div className="product-icon product-icon-chat">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M5 6H27C28.1 6 29 6.9 29 8V22C29 23.1 28.1 24 27 24H9L5 28V8C5 6.9 5.9 6 7 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><line x1="11" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="product-status product-status-soon">Coming Soon</span>
                </div>
                <h3 className="product-name">AliChat</h3>
                <p className="product-desc">End-to-end encrypted messaging with group chats and voice messages.</p>
                <div className="product-features">
                  <span className="product-feature">E2E Encrypted</span>
                  <span className="product-feature">Group Chats</span>
                  <span className="product-feature">Voice Messages</span>
                  <span className="product-feature">File Sharing</span>
                </div>
                <div className="product-card-visual chat-visual">
                  <div className="chat-mockup">
                    <div className="chat-bubble received"><div className="bubble-line w-3-4"></div></div>
                    <div className="chat-bubble sent"><div className="bubble-line w-1-2"></div></div>
                    <div className="chat-bubble received"><div className="bubble-line w-2-3"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="section privacy-section" id="privacy">
        <div className="container">
          <div className="privacy-layout">
            <div className="privacy-content">
              <span className="section-label reveal-up">Privacy</span>
              <h2 className="section-title reveal-up" style={{ animationDelay: "0.1s" }}>
                Your data belongs<br />to you.
              </h2>
              <p className="section-description reveal-up" style={{ animationDelay: "0.15s" }}>
                We believe privacy is a fundamental right, not a premium feature.
                Every AliOne product is built from the ground up to protect your data.
              </p>
            </div>
            <div className="privacy-features">
              {[
                { title: "No Tracking", desc: "We don't track your browsing, searches, or online activity. Period." },
                { title: "No Surveillance Advertising", desc: "Zero ad profiles. Zero data selling. Our business model respects you." },
                { title: "End-to-End Encryption", desc: "Your emails, messages, and files are encrypted. Only you can access them." },
                { title: "Transparent Development", desc: "Open development process. See what we're building and why." },
                { title: "User Ownership", desc: "Your data is yours. Export it or delete it anytime. No questions asked." },
                { title: "Community Feedback", desc: "Features are shaped by our users, not advertisers or investors." },
              ].map((f, i) => (
                <div key={f.title} className="privacy-feature reveal-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                  <div className="privacy-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="section community-section" id="community">
        <div className="container">
          <div className="section-header">
            <span className="section-label reveal-up">Community</span>
            <h2 className="section-title reveal-up" style={{ animationDelay: "0.1s" }}>Built with our users.</h2>
            <p className="section-description reveal-up" style={{ animationDelay: "0.15s" }}>
              Every feature, every improvement, every decision is shaped by the people who use our products.
            </p>
          </div>
          <div className="community-grid">
            <div className="community-card reveal-up" style={{ animationDelay: "0.1s" }}>
              <div className="community-card-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3L17.5 10.5L25 11.5L19.5 17L21 24.5L14 20.5L7 24.5L8.5 17L3 11.5L10.5 10.5L14 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <h3>Feature Voting</h3>
              <p>Vote on the features you want most. Your voice directly shapes our roadmap.</p>
              <div className="community-card-visual">
                <div className="vote-bar"><div className="vote-fill" style={{ width: "85%" }}></div></div>
                <div className="vote-bar"><div className="vote-fill" style={{ width: "62%" }}></div></div>
                <div className="vote-bar"><div className="vote-fill" style={{ width: "41%" }}></div></div>
              </div>
            </div>
            <div className="community-card reveal-up" style={{ animationDelay: "0.15s" }}>
              <div className="community-card-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="5" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="11" x2="25" y2="11" stroke="currentColor" strokeWidth="1.5"/><line x1="10" y1="11" x2="10" y2="23" stroke="currentColor" strokeWidth="1.5"/></svg>
              </div>
              <h3>Product Roadmap</h3>
              <p>See what&apos;s coming next. Our roadmap is public and influenced by community input.</p>
              <div className="community-card-visual">
                <div className="roadmap-dots">
                  <div className="roadmap-dot done"></div>
                  <div className="roadmap-line"></div>
                  <div className="roadmap-dot active"></div>
                  <div className="roadmap-line"></div>
                  <div className="roadmap-dot"></div>
                  <div className="roadmap-line"></div>
                  <div className="roadmap-dot"></div>
                </div>
              </div>
            </div>
            <div className="community-card reveal-up" style={{ animationDelay: "0.2s" }}>
              <div className="community-card-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 21V7C4 5.9 4.9 5 6 5H22C23.1 5 24 5.9 24 7V17C24 18.1 23.1 19 22 19H8L4 23V21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <h3>Community Discussions</h3>
              <p>Join conversations about features, privacy, and the future of technology.</p>
              <div className="community-card-visual">
                <div className="chat-preview">
                  <div className="chat-msg"><div className="chat-avatar"></div><div className="chat-text-line"></div></div>
                  <div className="chat-msg reply"><div className="chat-avatar"></div><div className="chat-text-line"></div></div>
                </div>
              </div>
            </div>
            <div className="community-card reveal-up" style={{ animationDelay: "0.25s" }}>
              <div className="community-card-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5"/><polyline points="14,7 14,14 19,17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Development Updates</h3>
              <p>Follow our progress in real-time. Every commit, every release, fully transparent.</p>
              <div className="community-card-visual">
                <div className="update-timeline">
                  <div className="update-dot"></div>
                  <div className="update-line"></div>
                  <div className="update-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="section roadmap-section" id="roadmap">
        <div className="container">
          <div className="section-header">
            <span className="section-label reveal-up">Roadmap</span>
            <h2 className="section-title reveal-up" style={{ animationDelay: "0.1s" }}>Where we&apos;re going.</h2>
            <p className="section-description reveal-up" style={{ animationDelay: "0.15s" }}>
              Our journey to build the most complete privacy-first ecosystem.
            </p>
          </div>
          <div className="roadmap-timeline">
            <div className="roadmap-column reveal-up" style={{ animationDelay: "0.1s" }}>
              <div className="roadmap-phase phase-now">
                <div className="phase-header">
                  <span className="phase-badge">NOW</span>
                  <span className="phase-date">In Build</span>
                </div>
                <div className="phase-items">
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliBrowser</h4><p>Privacy-first browser with vertical tabs and workspaces</p></div></div>
                </div>
              </div>
            </div>
            <div className="roadmap-column reveal-up" style={{ animationDelay: "0.2s" }}>
              <div className="roadmap-phase phase-next">
                <div className="phase-header">
                  <span className="phase-badge">NEXT</span>
                  <span className="phase-date">Upcoming</span>
                </div>
                <div className="phase-items">
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliSearch</h4><p>Anonymous search engine with transparent ranking</p></div></div>
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliOne Platform</h4><p>All-in-one account hub connecting every product</p></div></div>
                </div>
              </div>
            </div>
            <div className="roadmap-column reveal-up" style={{ animationDelay: "0.3s" }}>
              <div className="roadmap-phase phase-later">
                <div className="phase-header">
                  <span className="phase-badge">LATER</span>
                  <span className="phase-date">Planned</span>
                </div>
                <div className="phase-items">
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliMail</h4><p>Encrypted email with modern inbox experience</p></div></div>
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliDrive</h4><p>Private cloud storage with encrypted syncing</p></div></div>
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliPhotos</h4><p>Private photo storage with AI organization</p></div></div>
                </div>
              </div>
            </div>
            <div className="roadmap-column reveal-up" style={{ animationDelay: "0.4s" }}>
              <div className="roadmap-phase phase-future">
                <div className="phase-header">
                  <span className="phase-badge">FUTURE</span>
                  <span className="phase-date">Vision</span>
                </div>
                <div className="phase-items">
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliDocs</h4><p>Collaborative documents with offline support</p></div></div>
                  <div className="phase-item"><div className="phase-item-dot"></div><div><h4>AliChat</h4><p>Encrypted messaging with group chats</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="https://alione.cc" className="nav-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/alione.png" alt="AliOne" className="logo-img" style={{ height: 28 }} />
              </a>
              <p className="footer-tagline">Privacy-first digital ecosystem.<br />One account. Total privacy.</p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.75 2.25C15 2.75 14.25 3.13 13.44 3.37C13.06 2.94 12.52 2.64 11.92 2.63C11.31 2.62 10.76 2.9 10.39 3.38C10.02 3.87 9.86 4.49 9.95 5.1C8.12 4.99 6.32 4.3 4.86 3.14C3.39 4.3 2.56 6.12 2.65 8C2.65 8.12 2.66 8.24 2.67 8.35C1.58 7.8 0.67 6.99 0.06 5.98C-0.56 7.06 -0.23 8.42 0.57 9.46C0.04 9.44 -0.47 9.3 -0.94 9.06C-0.9 10.44 -0.06 11.7 1.15 12.12C0.63 12.26 0.08 12.28 -0.44 12.17C0.01 13.55 1.1 14.61 2.47 14.91C1.38 15.75 0.03 16.19 -1.36 16.17C0.05 17.07 1.74 17.56 3.47 17.56C9.59 17.56 12.94 12.56 12.94 8.21V7.78C13.55 7.33 14.08 6.77 14.5 6.13C13.57 6.69 12.53 7.05 11.44 7.17C12.01 6.82 12.45 6.28 12.69 5.65C12.93 5.02 12.96 4.34 12.76 3.7C13.66 4.75 14.92 5.44 16.32 5.65L15.75 2.25Z" fill="currentColor"/></svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 12.31 3.67 15.1 6.68 16.12C7.06 16.19 7.2 15.95 7.2 15.74V14.32C5.03 14.8 4.56 13.37 4.56 13.37C4.2 12.47 3.67 12.23 3.67 12.23C2.94 11.73 3.72 11.74 3.72 11.74C4.53 11.8 4.95 12.56 4.95 12.56C5.66 13.78 6.82 13.42 7.22 13.22C7.28 12.71 7.46 12.36 7.66 12.16C6.1 11.95 4.46 11.34 4.46 8.67C4.46 7.88 4.75 7.23 5.16 6.72C5.1 6.51 4.89 5.93 5.22 5.14C5.22 5.14 5.74 4.97 7.19 5.96C7.78 5.79 8.42 5.71 9.05 5.71C9.68 5.71 10.32 5.79 10.91 5.96C12.36 4.97 12.88 5.14 12.88 5.14C13.21 5.93 13 6.51 12.94 6.72C13.35 7.23 13.64 7.88 13.64 8.67C13.64 11.35 12 11.95 10.43 12.15C10.68 12.39 10.9 12.85 10.9 13.55V15.74C10.9 15.95 11.03 16.2 11.42 16.12C14.42 15.1 16.58 12.31 16.58 9C16.58 4.86 13.22 1.5 9 1.5Z" fill="currentColor"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Products</h4>
              <a href="https://alibrowser.alione.cc">AliBrowser</a>
              <a href="#" style={{ opacity: 0.5 }}>AliSearch <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliOne <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliMail <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliDrive <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliPhotos <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliDocs <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
              <a href="#" style={{ opacity: 0.5 }}>AliChat <span style={{ fontSize: 11, opacity: 0.6 }}>soon</span></a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="https://alione.cc">Home</a>
              <a href="#">About</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 AliOne Technologies. All rights reserved.</p>
            <p className="footer-mission">Privacy is a right, not a feature.</p>
          </div>
        </div>
      </footer>
    </ScrollReveal>
  );
}
