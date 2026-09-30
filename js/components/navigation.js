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
      recentlyViewed: (typeof getRecentlyViewed === 'function') ? getRecentlyViewed().length : null
    };
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    if (page === '' || page === 'index.html') return 'dashboard';
    if (page.includes('search')) return 'search';
    if (page.includes('profile')) return 'profile';
    if (page.includes('recently-viewed') || page.includes('shortlist')) return 'recently-viewed';
    if (page.includes('login')) return 'login';
    return 'dashboard';
  }

  init() {
    if (this.activePage !== 'login' && this.activePage !== 'admin') {
      if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
      }
    }
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

    const loggedIn = (typeof isUserLoggedIn === 'function') ? isUserLoggedIn() : (localStorage.getItem('matrimony_is_logged_in') === 'true' && Boolean(localStorage.getItem('matrimony_user_id')));
    const isNewUserRestricted = (typeof window !== 'undefined' && localStorage.getItem('matrimony_is_new_user') === 'true');

    // Retrieve custom user details if available
    let userBiodata = null;
    try {
      const bioStr = localStorage.getItem('matrimony_user_biodata');
      if (bioStr) userBiodata = JSON.parse(bioStr);
    } catch(e) {}

    const userEmail = localStorage.getItem('matrimony_user_email');
    const userName = userBiodata?.full_name || (userEmail ? userEmail.split('@')[0] : 'New Member');
    const userPhoto = localStorage.getItem('matrimony_user_photo_url') || userBiodata?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80';
    const userId = localStorage.getItem('matrimony_user_id') || userEmail || 'LPS-88421';

    const navItems = [
      {
        section: 'Discovery'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: `${prefix}index.html`,
        isLocked: isNewUserRestricted,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
      },
      {
        id: 'search',
        label: 'Partner Search',
        href: `${prefix}search.html`,
        isLocked: isNewUserRestricted,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
      },
      {
        section: 'Activity'
      },
      {
        id: 'recently-viewed',
        label: 'Recently Viewed',
        href: `${prefix}recently-viewed.html`,
        isLocked: isNewUserRestricted,
        badge: isNewUserRestricted ? null : this.badgeCounts.recentlyViewed,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
      },
      {
        section: 'Account & Settings'
      },
      {
        id: 'profile',
        label: 'My Profile',
        href: `${prefix}profile.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
      }
    ];

    if (loggedIn) {
      navItems.push({
        id: 'logout',
        label: 'Log Out',
        href: '#',
        isAction: true,
        action: 'logout',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
      });
    } else {
      navItems.push({
        id: 'login',
        label: 'Sign In / Register',
        href: `${prefix}login.html`,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`
      });
    }

    let navHtml = '';
    navItems.forEach(item => {
      if (item.section) {
        navHtml += `<div class="nav-section-label">${item.section}</div>`;
      } else if (item.isLocked) {
        navHtml += `
          <a href="javascript:void(0)" class="nav-item nav-item-locked" data-tooltip="${item.label} (Locked)" onclick="if(window.toast){window.toast.show('Access restricted: Please create your profile first. Other website features are disabled.', 'warning', 4000);} return false;" style="opacity: 0.45; cursor: not-allowed;">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
            <span class="nav-badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">🔒 Locked</span>
          </a>
        `;
      } else {
        const isActive = this.activePage === item.id;
        const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
        const actionAttr = item.isAction ? `data-action="${item.action}" onclick="logoutUser(); return false;"` : '';
        navHtml += `
          <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''} ${item.id === 'logout' ? 'nav-item-logout' : ''}" data-tooltip="${item.label}" ${actionAttr}>
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
            ${badgeHtml}
          </a>
        `;
      }
    });

    const userStatusText = isNewUserRestricted ? 'New Member · Profile Setup Only' : 'Verified Member · Online';

    sidebarMount.innerHTML = `
      <aside class="app-sidebar" id="appSidebar">
        <!-- Brand Header with Collapse Toggle -->
        <div class="sidebar-header">
          <a href="${isNewUserRestricted ? `${prefix}profile.html` : `${prefix}index.html`}" class="sidebar-brand" aria-label="Matrimony Home">
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
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 0.5rem;">
            <a href="${prefix}profile.html" class="user-profile-chip" title="View Profile" style="flex: 1; min-width: 0; text-decoration: none;">
              <div class="avatar-wrapper">
                <img src="${userPhoto}" alt="${userName}" class="avatar-img">
                <span class="status-indicator" title="Online"></span>
              </div>
              <div class="user-details">
                <div class="user-name" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${userName}</div>
                <div class="user-status">${userStatusText}</div>
              </div>
            </a>
            <button type="button" class="btn-sidebar-logout" onclick="logoutUser()" title="Log Out" aria-label="Log Out" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.45rem; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile Backdrop Overlay -->
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

      <!-- Native-Style Mobile Bottom Navigation Bar -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
        <a href="${isNewUserRestricted ? 'javascript:void(0)' : `${prefix}index.html`}" class="mobile-nav-tab ${this.activePage === 'dashboard' ? 'active' : ''}" ${isNewUserRestricted ? 'onclick="if(window.toast){window.toast.show(\'Access restricted: Please create your profile first.\', \'warning\');} return false;" style="opacity: 0.45;"' : ''}>
          <span class="mobile-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>
          </span>
          <span class="mobile-nav-label">Home</span>
        </a>
        <a href="${isNewUserRestricted ? 'javascript:void(0)' : `${prefix}search.html`}" class="mobile-nav-tab ${this.activePage === 'search' ? 'active' : ''}" ${isNewUserRestricted ? 'onclick="if(window.toast){window.toast.show(\'Access restricted: Please create your profile first.\', \'warning\');} return false;" style="opacity: 0.45;"' : ''}>
          <span class="mobile-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <span class="mobile-nav-label">Search</span>
        </a>
        <a href="${isNewUserRestricted ? 'javascript:void(0)' : `${prefix}recently-viewed.html`}" class="mobile-nav-tab ${this.activePage === 'recently-viewed' ? 'active' : ''}" ${isNewUserRestricted ? 'onclick="if(window.toast){window.toast.show(\'Access restricted: Please create your profile first.\', \'warning\');} return false;" style="opacity: 0.45;"' : ''}>
          <span class="mobile-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${(!isNewUserRestricted && this.badgeCounts.recentlyViewed) ? `<span class="mobile-nav-badge-dot"></span>` : ''}
          </span>
          <span class="mobile-nav-label">Recents</span>
        </a>
        <a href="${prefix}profile.html" class="mobile-nav-tab ${this.activePage === 'profile' ? 'active' : ''}">
          <span class="mobile-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <span class="mobile-nav-label">Profile</span>
        </a>
      </nav>
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

    // Update footer auth links dynamically based on session status
    this.updateFooterAuthLinks();

    // Re-render when auth state changes
    if (!this._hasAuthListener) {
      this._hasAuthListener = true;
      window.addEventListener('userAuthStateChanged', () => {
        this.render();
        this.bindEvents();
      });
    }
  }

  updateFooterAuthLinks() {
    const isSubdir = window.location.pathname.includes('/login_page/') || window.location.pathname.includes('/search_page/');
    const prefix = isSubdir ? '../' : '';
    const loggedIn = (typeof isUserLoggedIn === 'function') ? isUserLoggedIn() : (localStorage.getItem('matrimony_is_logged_in') === 'true' && Boolean(localStorage.getItem('matrimony_user_id')));

    document.querySelectorAll('.footer-links a[href*="login.html"], .footer-links a.footer-auth-link').forEach(link => {
      if (loggedIn) {
        link.textContent = 'Log Out';
        link.href = '#';
        link.classList.add('footer-auth-link');
        link.onclick = (e) => {
          e.preventDefault();
          logoutUser();
        };
      } else {
        link.textContent = 'Sign In';
        link.href = `${prefix}login.html`;
        link.classList.remove('footer-auth-link');
        link.onclick = null;
      }
    });

    if (localStorage.getItem('matrimony_is_new_user') === 'true') {
      document.querySelectorAll('.footer-links a').forEach(link => {
        if (!link.classList.contains('footer-auth-link') && !link.getAttribute('href')?.includes('profile.html')) {
          link.onclick = (e) => {
            e.preventDefault();
            if (window.toast) window.toast.show('Access restricted: Please create your profile first. Other website features are disabled.', 'warning');
          };
          link.style.opacity = '0.5';
          link.style.cursor = 'not-allowed';
        }
      });
    }
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
