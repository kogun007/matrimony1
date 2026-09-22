/**
 * Reusable Toast Notification System
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!this.container || !document.contains(this.container)) {
      let el = document.querySelector('.toast-container');
      if (!el) {
        el = document.createElement('div');
        el.className = 'toast-container';
        if (document.body) {
          document.body.appendChild(el);
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            if (!document.querySelector('.toast-container')) {
              document.body.appendChild(el);
            }
          });
        }
      }
      this.container = el;
    }
  }

  show(message, type = 'info', duration = 2500) {
    this.init();
    if (this.container && !this.container.parentNode && document.body) {
      document.body.appendChild(this.container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${message}</span>
    `;

    if (this.container) {
      this.container.appendChild(toast);
    } else if (document.body) {
      document.body.appendChild(toast);
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.toast = new ToastManager();
