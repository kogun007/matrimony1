/**
 * Reusable Candidate Profile Modal with 75-Profile-View Quota Protection
 */
async function openCandidateDetailModal(candidateId) {
  let candidate = (typeof CANDIDATE_DATABASE !== 'undefined') ? CANDIDATE_DATABASE.find(c => c.id === candidateId) : null;

  let modalOverlay = document.getElementById('candidateModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'candidateModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  // Render initial modal structure immediately
  modalOverlay.innerHTML = `
    <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-drag-indicator" aria-hidden="true"></div>
      <div class="modal-header">
        <div>
          <h2 class="modal-title" id="modalTitle">${candidate ? candidate.name : 'Loading Profile...'}</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">ID: ${candidateId} · ${candidate ? candidate.location : ''}</span>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeCandidateDetailModal()" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <div style="width: 140px; height: 140px; border-radius: var(--radius-lg); overflow: hidden; border: 3px solid var(--primary-light); flex-shrink: 0;">
            <img src="${candidate ? candidate.photo : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80'}" alt="${candidate ? candidate.name : ''}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; justify-content: center; gap: 0.5rem;">
            <p style="font-size: 0.925rem; color: var(--text-secondary); line-height: 1.5;">
              ${candidate ? candidate.about : 'Loading candidate bio...'}
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; background: var(--surface-alt); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Age & Height</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? candidate.age : '--'} Years · ${candidate ? candidate.height : '--'} Ft</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Profession & Income</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? candidate.occupation : '--'} · ${candidate ? candidate.annualIncome : '--'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Education</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? candidate.education : '--'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Religion / Community</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? (candidate.sub_caste || candidate.religion) : 'Jain'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Mother Tongue</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? candidate.motherTongue : 'Gujarati'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Marital Status</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate ? candidate.maritalStatus : 'Never Married'} (${candidate ? candidate.diet : 'Jain Vegetarian'})</div>
          </div>
        </div>

        <!-- Contact Details & View Limit Quota Container -->
        <div id="modalContactArea">
          <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
            ⏳ Verifying profile view quota with backend server...
          </div>
        </div>

        <div style="margin-top: 1.25rem;">
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Interests & Hobbies</div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;" id="modalInterestsMount">
            ${candidate && candidate.interests ? candidate.interests.map(i => `<span class="tag-badge" style="background: var(--surface);">${i}</span>`).join('') : ''}
          </div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" onclick="closeCandidateDetailModal();">
          <span>Close</span>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => modalOverlay.classList.add('active'), 10);

// Track viewed candidate IDs to avoid incrementing for the same profile
function getViewedCandidateIds() {
  try {
    return JSON.parse(localStorage.getItem('matrimony_viewed_candidate_ids') || '[]');
  } catch (e) {
    return [];
  }
}

function markCandidateViewed(id) {
  const isVerified = localStorage.getItem('matrimony_profile_is_active') === 'true';
  if (!isVerified) return false;
  const ids = getViewedCandidateIds();
  const normalizedId = String(id).toUpperCase();
  if (!ids.includes(normalizedId)) {
    ids.push(normalizedId);
    localStorage.setItem('matrimony_viewed_candidate_ids', JSON.stringify(ids));
    return true; // First time view
  }
  return false; // Already viewed previously
}

  // Record profile in Recently Viewed history
  if (typeof addRecentlyViewed === 'function') {
    addRecentlyViewed(candidateId);
  }

  const isInitiallyVerified = localStorage.getItem('matrimony_profile_is_active') === 'true';

  // Check if profile was already viewed
  const isFirstView = markCandidateViewed(candidateId);
  const viewedIds = getViewedCandidateIds();

  // Calculate views and remaining quota
  let lastKnownViews = parseInt(localStorage.getItem('matrimony_user_views_count'), 10);
  const statCountEl = document.getElementById('stat-profile-views');
  if (isNaN(lastKnownViews)) {
    if (statCountEl) {
      const parts = (statCountEl.textContent || '').split('/');
      lastKnownViews = parseInt(parts[0].trim(), 10) || 0;
    } else {
      lastKnownViews = isInitiallyVerified ? viewedIds.length : 0;
    }
  }

  // Only increment local count if this user is verified by admin and this is a first-time view
  const currentViewed = (isInitiallyVerified && isFirstView) ? (lastKnownViews + 1) : lastKnownViews;
  const currentLimit = 75;
  const currentRemaining = Math.max(0, currentLimit - currentViewed);
  if (isInitiallyVerified) {
    localStorage.setItem('matrimony_user_views_count', String(currentViewed));
  }

  // Update on-page counter if present
  if (statCountEl) {
    statCountEl.textContent = isInitiallyVerified ? `${Math.min(currentViewed, currentLimit)} / ${currentLimit}` : 'Pending Admin Verification';
  }

  // Helper to show offline/local fallback toast
  function showOfflineToast() {
    if (!window.toast) return;
    const isProfileActive = localStorage.getItem('matrimony_profile_is_active') === 'true';
    const isExpired = localStorage.getItem('matrimony_profile_is_expired') === 'true';

    // Profile viewed count is displayed ONLY to verified user by admin
    if (!isProfileActive) {
      window.toast.show(
        `⏳ <strong>Profile Pending Admin Verification</strong> · Profile viewed count & candidate contacts unlock once verified by Admin.`,
        'warning',
        3500
      );
    } else if (isExpired && currentRemaining === 0) {
      window.toast.show(
        `⚠️ <strong>Limits Reached</strong>: Profile viewed count: <strong>${currentViewed} of ${currentLimit}</strong> & 3-month profile validity expired. Contacts locked.`,
        'error',
        3500
      );
    } else if (isExpired) {
      window.toast.show(
        `⚠️ <strong>3-Month Validity Expired</strong> · Profile viewed count: <strong>${currentViewed} of ${currentLimit}</strong>. Contacts locked.`,
        'warning',
        3500
      );
    } else if (currentRemaining === 0) {
      window.toast.show(
        `⚠️ <strong>Profile view limit reached</strong>: <strong>${currentViewed} of ${currentLimit}</strong> viewed (0 remaining)`,
        'error',
        3000
      );
    } else if (isFirstView) {
      window.toast.show(
        `✅ <strong>Verified Member Access</strong> · Profile viewed count: <strong>${currentViewed} of ${currentLimit}</strong> (<strong>${currentRemaining}</strong> remaining)`,
        'success',
        2500
      );
    } else {
      window.toast.show(
        `👁️ <strong>Verified Member</strong> · Profile already viewed · Total viewed: <strong>${currentViewed} of ${currentLimit}</strong> (<strong>${currentRemaining}</strong> remaining)`,
        'info',
        2500
      );
    }
  }

  // Query backend API to register view in PostgreSQL, verify user status & fetch protected contact details
  if (typeof fetchCandidateProfileFromApi === 'function') {
    try {
      const apiResult = await fetchCandidateProfileFromApi(candidateId);
      if (apiResult && apiResult.quota) {
        const quota = apiResult.quota;
        const actualUsed = quota.used !== undefined ? quota.used : quota.total_views;
        const actualLimit = quota.limit || 75;
        const actualRemaining = quota.remaining !== undefined ? quota.remaining : Math.max(0, actualLimit - actualUsed);
        // Explicitly check boolean flag from backend
        const isProfileActive = Boolean(quota.is_active);
        const isExpired = Boolean(quota.is_time_expired);
        const isViewLimit = Boolean(quota.is_view_limit_reached) || actualRemaining === 0;

        localStorage.setItem('matrimony_user_views_count', String(actualUsed));
        localStorage.setItem('matrimony_profile_is_active', String(isProfileActive));
        if (quota.profile_created_at) localStorage.setItem('matrimony_profile_created_at', quota.profile_created_at);
        if (quota.expires_at) localStorage.setItem('matrimony_profile_expires_at', quota.expires_at);
        localStorage.setItem('matrimony_profile_days_remaining', String(quota.days_remaining !== undefined ? quota.days_remaining : 90));
        localStorage.setItem('matrimony_profile_is_expired', String(isExpired));

        if (statCountEl) {
          statCountEl.textContent = isProfileActive ? `${Math.min(actualUsed, actualLimit)} / ${actualLimit}` : 'Pending Admin Verification';
        }

        // Display synchronized toast notification:
        // Profile viewed count is displayed ONLY to verified user by admin
        if (window.toast) {
          if (!isProfileActive) {
            // UNVERIFIED USER: Do NOT display profile viewed count
            window.toast.show(
              `⏳ <strong>Profile Pending Admin Verification</strong> · Profile viewed count & candidate contacts unlock once verified by Admin.`,
              'warning',
              3500
            );
          } else if (isExpired && isViewLimit) {
            // VERIFIED USER: Limits reached
            window.toast.show(
              `⚠️ <strong>Limits Reached</strong>: Profile viewed count: <strong>${actualUsed} of ${actualLimit}</strong> & 3-month profile validity expired. Contacts locked.`,
              'error',
              3500
            );
          } else if (isExpired) {
            // VERIFIED USER: Time expired
            window.toast.show(
              `⚠️ <strong>3-Month Validity Expired</strong> · Profile viewed count: <strong>${actualUsed} of ${actualLimit}</strong>. Contacts locked.`,
              'warning',
              3500
            );
          } else if (isViewLimit) {
            // VERIFIED USER: View limit reached
            window.toast.show(
              `⚠️ <strong>Profile view limit reached</strong>: <strong>${actualUsed} of ${actualLimit}</strong> viewed (0 remaining)`,
              'error',
              3000
            );
          } else if (quota.is_repeat_view) {
            // VERIFIED USER: Repeat view
            window.toast.show(
              `👁️ <strong>Verified Member</strong> · Profile already viewed · Total viewed: <strong>${actualUsed} of ${actualLimit}</strong> (<strong>${actualRemaining}</strong> remaining)`,
              'info',
              2500
            );
          } else {
            // VERIFIED USER: First-time view
            window.toast.show(
              `✅ <strong>Verified Member Access</strong> · Profile viewed count: <strong>${actualUsed} of ${actualLimit}</strong> (<strong>${actualRemaining}</strong> remaining)`,
              'success',
              2500
            );
          }
        }
      } else {
        showOfflineToast();
      }
      renderModalContactSection(candidateId, apiResult);
    } catch (err) {
      console.warn('Error fetching candidate detail:', err);
      showOfflineToast();
      renderModalContactSection(candidateId, null);
    }
  } else {
    showOfflineToast();
    renderModalContactSection(candidateId, null);
  }
}

// Render Contact Details or Locked Box based on backend quota (75 views + 3 months from creation date)
function renderModalContactSection(candidateId, apiResult) {
  const mount = document.getElementById('modalContactArea');
  if (!mount) return;

  if (!apiResult || !apiResult.data) {
    mount.innerHTML = `
      <div style="background: var(--surface-alt); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-muted); text-align: center;">
        Contact details available once connected to PostgreSQL backend.
      </div>
    `;
    return;
  }

  const { data, quota } = apiResult;
  const canView = quota ? quota.can_view_contact : data.can_view_contact;
  const contact = data.contact_details || {};
  const used = quota ? quota.used : 1;
  const limit = quota ? quota.limit : 75;
  const remaining = quota ? quota.remaining : (limit - used);
  const daysRemaining = quota && quota.days_remaining !== undefined ? quota.days_remaining : 90;
  const isExpired = Boolean(quota && quota.is_time_expired);
  const isViewLimitReached = Boolean(quota && quota.is_view_limit_reached);
  const isProfileActive = quota && quota.is_active !== undefined ? Boolean(quota.is_active) : true;

  if (canView) {
    // Activated by Admin & Under 75 Limit & within 3 Months: Contact details unlocked
    mount.innerHTML = `
      <div class="contact-details-box">
        <div class="contact-box-header">
          <div class="contact-box-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Verified Contact Coordinates</span>
          </div>
          <div class="contact-quota-pill" title="Active Account · 75 views & 3 months validity from profile creation">
            <span>✅ <strong>Active Member</strong> · 👁️ <strong>${used} / ${limit}</strong> (${remaining} left) · ⏳ <strong>${daysRemaining}d</strong> left</span>
          </div>
        </div>

        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div class="contact-item-content">
              <div class="contact-item-label">Direct Phone</div>
              <div class="contact-item-value"><a href="tel:${contact.phone || '+91 98201 45892'}">${contact.phone || '+91 98201 45892'}</a></div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-item-icon" style="background: #eef2ff; color: var(--primary);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="contact-item-content">
              <div class="contact-item-label">Email ID</div>
              <div class="contact-item-value"><a href="mailto:${contact.email || 'candidate@jainmatrimony.org'}">${contact.email || 'candidate@jainmatrimony.org'}</a></div>
            </div>
          </div>

          <div class="contact-item" style="grid-column: 1 / -1;">
            <div class="contact-item-icon" style="background: #fdf2f8; color: var(--accent);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="contact-item-content">
              <div class="contact-item-label">Parent / Guardian Coordinate</div>
              <div class="contact-item-value">${contact.guardian_contact || 'Parent details verified on request'}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 0.85rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; color: var(--text-muted); flex-wrap: wrap; gap: 0.5rem;">
          <span>🔒 Verified Member Protection · Active Contact Authorization</span>
          <span style="font-size: 0.72rem; color: var(--success); font-weight: 600;">✓ Coordinates Validated</span>
        </div>
      </div>
    `;
  } else {
    // Locked State: either Not Activated by Admin, or 75 Views Reached, or 3 Months Expired
    let badgeText = `View Limit Reached (${limit}/${limit})`;
    let lockDesc = `You have reached your limit of <strong>${limit} profile views</strong>. In accordance with platform policy, candidate contact coordinates are hidden.`;

    if (!isProfileActive) {
      badgeText = `Pending Verification`;
      lockDesc = `Your profile is currently <strong>under administrative review and verification</strong>. Under community privacy standards, direct phone numbers and contact coordinates are unlocked <strong>once your profile is approved and activated by an administrator</strong>.`;
    } else if (isExpired && isViewLimitReached) {
      badgeText = `Limits Reached (75 Views & 3-Mo Expired)`;
      lockDesc = `You have reached both your <strong>75 profile views limit</strong> and your <strong>3-month profile validity period</strong> from the day your profile was created. Direct contact details are locked.`;
    } else if (isExpired) {
      badgeText = `3-Month Validity Expired`;
      lockDesc = `Your profile validity period of <strong>3 months from the day your profile was created</strong> has expired. Candidate phone numbers, email addresses, and family contact coordinates are hidden.`;
    }

    mount.innerHTML = `
      <div class="contact-locked-box" style="${!isProfileActive ? 'border-color: rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%);' : ''}">
        <div class="contact-locked-header">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: ${!isProfileActive ? '#92400e' : '#991b1b'}; font-size: 0.98rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Contact Details Locked</span>
          </div>
          <span class="contact-locked-badge" style="${!isProfileActive ? 'background: #fef3c7; color: #b45309; border-color: rgba(245, 158, 11, 0.4);' : ''}">${badgeText}</span>
        </div>

        <p style="font-size: 0.88rem; color: ${!isProfileActive ? '#78350f' : '#7f1d1d'}; margin-bottom: 0.75rem; line-height: 1.5;">
          ${lockDesc}
        </p>

        <div class="contact-masked-preview">
          <div class="contact-masked-item">📞 ${contact.phone_masked || '+91 98••••••••'}</div>
          <div class="contact-masked-item">✉️ ${contact.email_masked || '•••••••@••••••.com'}</div>
          <div class="contact-masked-item">👨‍👩‍👧 Family: ••••••••••••••••</div>
        </div>

        <div class="contact-locked-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
          ${!isProfileActive ? `
            ${(typeof getCurrentUserId === 'function' && localStorage.getItem('matrimony_verification_req_' + getCurrentUserId()) === 'true') ? `
              <button type="button" class="btn btn-sm btn-secondary" disabled style="opacity: 0.85; cursor: default; display: inline-flex; align-items: center; gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Priority Verification Requested</span>
              </button>
            ` : `
              <button type="button" class="btn btn-sm btn-primary" onclick="handleRequestPriorityVerification(this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Request Priority Verification</span>
              </button>
            `}
            <a href="profile.html" class="btn btn-sm btn-secondary" style="text-decoration: none; font-size: 0.8rem; display: inline-flex; align-items: center;">
              <span>Complete Profile Details</span>
            </a>
          ` : `
            <button type="button" class="btn btn-sm btn-primary" onclick="if(window.toast) window.toast.show('Request received! Relationship manager will contact you to renew membership.', 'success');">
              <span>Renew / Unlock Profile Views</span>
            </button>
            <a href="search.html" class="btn btn-sm btn-secondary" style="text-decoration: none; font-size: 0.8rem; display: inline-flex; align-items: center;">
              <span>Continue Browsing</span>
            </a>
          `}
        </div>
      </div>
    `;
  }
}

// Request priority admin verification for current user
function handleRequestPriorityVerification(btn) {
  const userId = (typeof getCurrentUserId === 'function') ? getCurrentUserId() : 'User';
  localStorage.setItem('matrimony_verification_req_' + userId, 'true');
  if (btn) {
    btn.disabled = true;
    btn.className = 'btn btn-sm btn-secondary';
    btn.style.opacity = '0.85';
    btn.style.cursor = 'default';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>Priority Verification Requested</span>
    `;
  }
  if (window.toast) {
    window.toast.show(
      `📩 Priority verification requested for user <strong>${userId}</strong>. Verification desk has been notified.`,
      'success',
      3500
    );
  }
}

// Quick handler to toggle user activation status
async function handleQuickToggleActive(candidateId) {
  if (typeof toggleUserActivation === 'function') {
    const res = await toggleUserActivation();
    const isNowActive = res && res.is_active;
    if (window.toast) {
      if (isNowActive) {
        window.toast.show('🎉 <strong>Profile Verified & Activated by Admin!</strong> Profile viewed count & contacts unlocked.', 'success', 3000);
      } else {
        window.toast.show('⏳ <strong>Profile Set to Pending Verification</strong>. Profile viewed count & contacts locked.', 'warning', 3000);
      }
    }
    if (typeof fetchCandidateProfileFromApi === 'function') {
      const apiResult = await fetchCandidateProfileFromApi(candidateId);
      renderModalContactSection(candidateId, apiResult);
    }
  }
}

// Quick handler to simulate 75 limit for testing
async function handleSimulateLimit(candidateId) {
  if (typeof simulateLimitQuota === 'function') {
    const res = await simulateLimitQuota();
    if (window.toast) window.toast.show('View limit of 75 simulated! Contact details are now locked.', 'info');
    if (typeof fetchCandidateProfileFromApi === 'function') {
      const apiResult = await fetchCandidateProfileFromApi(candidateId);
      renderModalContactSection(candidateId, apiResult);
    }
  }
}

// Quick handler to simulate 3-month profile expiry for testing
async function handleSimulateExpiry(candidateId) {
  if (typeof simulateExpiryQuota === 'function') {
    const res = await simulateExpiryQuota();
    if (window.toast) window.toast.show('3-month profile validity expiration simulated! Contact details are locked.', 'warning');
    if (typeof fetchCandidateProfileFromApi === 'function') {
      const apiResult = await fetchCandidateProfileFromApi(candidateId);
      renderModalContactSection(candidateId, apiResult);
    }
  }
}

// Quick handler to reset quota and renew 3-month validity for testing
async function handleResetQuota(candidateId) {
  localStorage.removeItem('matrimony_viewed_candidate_ids');
  localStorage.setItem('matrimony_user_views_count', '0');
  localStorage.setItem('matrimony_profile_is_expired', 'false');
  localStorage.setItem('matrimony_profile_days_remaining', '90');
  if (typeof resetUserQuota === 'function') {
    const res = await resetUserQuota();
    if (window.toast) window.toast.show('Profile quota reset! 75 views and 3 months validity restored.', 'success');
    if (typeof fetchCandidateProfileFromApi === 'function') {
      const apiResult = await fetchCandidateProfileFromApi(candidateId);
      renderModalContactSection(candidateId, apiResult);
    }
  }
}

function closeCandidateDetailModal() {
  const modalOverlay = document.getElementById('candidateModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
  }
}

// Close on backdrop click or Escape key
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'candidateModalOverlay') {
    closeCandidateDetailModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCandidateDetailModal();
  }
});
