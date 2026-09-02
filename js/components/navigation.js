/**
 * Reusable Collapsible Navigation Component
 * Supports:
 * - Desktop Full Sidebar & Collapsed Mini-Rail
 * - Mobile Slide-out Drawer with Touch Backdrop
 * - Active Page Highlight Detection
 * - Dynamic Badge Counts (Matches, Messages, Interests)
 * - LocalStorage state persistence
 */

class MatrimonyNavigation {
  constructor(options = {}) {
    this.activePage = options.activePage || this.detectCurrentPage();
    this.badgeCounts = options.badgeCounts || {
      matches: 12,
      messages: 3,
      shortlist: 5
    };
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    if (page === '' || page === 'index.html') return 'dashboard';
    if (page.includes('search')) return 'search';
    if (page.includes('matches')) return 'matches';
    if (page.includes('profile')) return 'profile';
    if (page.includes('messages')) return 'messages';
    if (page.includes('shortlist')) return 'shortlist';
    if (page.includes('login')) return 'login';
    return 'dashboard';
  }

  init() {
    this.render();
    this.bindEvents();
    this.restoreState();
  }

  render() {
    const sidebarMount = document.getElementById('sidebar-mount');
    if (!sidebarMount) return;

    // Check if relative path needs adjustment based on folder level
    const isSubdir = window.location.pathname.includes('/login_page/') || window.location.pathname.includes('/search_page/');
    const prefix = isSubdir ? '../' : '';

    const navItems = [
      {
        section: 'Discovery'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: `${prefix}index.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
      },
      {
        id: 'search',
        label: 'Partner Search',
        href: `${prefix}search.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
      },
      {
        id: 'matches',
        label: 'Daily Matches',
        href: `${prefix}matches.html`,
        badge: this.badgeCounts.matches,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
      },
      {
        section: 'Connections'
      },
      {
        id: 'messages',
        label: 'Messages & Interests',
        href: `${prefix}messages.html`,
        badge: this.badgeCounts.messages,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
      },
      {
        id: 'shortlist',
        label: 'Shortlisted Profiles',
        href: `${prefix}shortlist.html`,
        badge: this.badgeCounts.shortlist,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      },
      {
        section: 'Account & Settings'
      },
      {
        id: 'profile',
        label: 'My Profile',
        href: `${prefix}profile.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
      },
      {
        id: 'template',
        label: 'Page Template',
        href: `${prefix}template.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`
      },
      {
        id: 'login',
        label: 'Sign In / Register',
        href: `${prefix}login.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`
      }
    ];

    let navHtml = '';
    navItems.forEach(item => {
      if (item.section) {
        navHtml += `<div class="nav-section-label">${item.section}</div>`;
      } else {
        const isActive = this.activePage === item.id;
        const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
        navHtml += `
          <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}" data-tooltip="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
            ${badgeHtml}
          </a>
        `;
      }
    });

    sidebarMount.innerHTML = `
      <aside class="app-sidebar" id="appSidebar">
        <!-- Brand Header with Collapse Toggle -->
        <div class="sidebar-header">
          <a href="${prefix}index.html" class="sidebar-brand" aria-label="Matrimony Home">
            <div class="brand-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#brand-grad-icon)" stroke="none"/>
                <defs>
                  <linearGradient id="brand-grad-icon" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#6366f1"/>
                    <stop offset="1" stop-color="#ec4899"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span class="brand-text">LivePartner</span>
          </a>

          <button type="button" class="btn-toggle-sidebar" id="sidebarCollapseBtn" aria-label="Toggle navigation bar width" title="Collapse / Expand Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav">
          ${navHtml}
        </nav>

        <!-- Current User Profile Chip -->
        <div class="sidebar-footer">
          <a href="${prefix}profile.html" class="user-profile-chip" title="View Profile">
            <div class="avatar-wrapper">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" alt="User Profile" class="avatar-img">
              <span class="status-indicator" title="Online"></span>
            </div>
            <div class="user-details">
              <div class="user-name">Priya Sharma</div>
              <div class="user-status">ID: LPS-88421 · Premium</div>
            </div>
          </a>
        </div>
      </aside>

      <!-- Mobile Backdrop Overlay -->
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    `;
  }

  bindEvents() {
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileToggleBtn = document.getElementById('mobileMenuToggle');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }

    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', () => this.toggleMobileSidebar());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMobileSidebar());
    }

    // Keyboard shortcut to collapse/expand navigation: Ctrl/Cmd + B
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleCollapse();
      }
    });
  }

  toggleCollapse() {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('matrimony_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }

  toggleMobileSidebar() {
    document.body.classList.toggle('sidebar-mobile-open');
  }

  closeMobileSidebar() {
    document.body.classList.remove('sidebar-mobile-open');
  }

  restoreState() {
    const isCollapsed = localStorage.getItem('matrimony_sidebar_collapsed') === 'true';
    if (isCollapsed && window.innerWidth > 992) {
      document.body.classList.add('sidebar-collapsed');
    }
  }
}

// Auto-initialize if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sidebar-mount')) {
    window.matrimonyNav = new MatrimonyNavigation();
  }
});
