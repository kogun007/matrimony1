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
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${message}</span>
      <button type="button" class="toast-dismiss" aria-label="Dismiss notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    const dismiss = () => {
      if (toast.dataset.dismissed) return;
      toast.dataset.dismissed = 'true';
      toast.classList.add('toast-leaving');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 380);
    };

    toast.querySelector('.toast-dismiss')?.addEventListener('click', dismiss);

    if (this.container) {
      this.container.appendChild(toast);
    } else if (document.body) {
      document.body.appendChild(toast);
    }

    setTimeout(dismiss, duration);
  }
}

window.toast = new ToastManager();
