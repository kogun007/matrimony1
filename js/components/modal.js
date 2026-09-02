/**
 * Reusable Candidate Profile Modal
 */
function openCandidateDetailModal(candidateId) {
  const candidate = (typeof CANDIDATE_DATABASE !== 'undefined') ? CANDIDATE_DATABASE.find(c => c.id === candidateId) : null;
  if (!candidate) return;

  let modalOverlay = document.getElementById('candidateModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'candidateModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  const isShortlisted = isCandidateShortlisted(candidate.id);
  const isExpressed = isInterestExpressed(candidate.id);

  modalOverlay.innerHTML = `
    <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-header">
        <div>
          <h2 class="modal-title" id="modalTitle">${candidate.name}</h2>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">ID: ${candidate.id} · ${candidate.location}</span>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeCandidateDetailModal()" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <div style="width: 140px; height: 140px; border-radius: var(--radius-lg); overflow: hidden; border: 3px solid var(--primary-light); flex-shrink: 0;">
            <img src="${candidate.photo}" alt="${candidate.name}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; justify-content: center; gap: 0.5rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span class="badge-match" style="background: var(--gradient-brand-soft); color: var(--primary); font-weight: 700; font-size: 0.8rem; padding: 0.25rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid rgba(99,102,241,0.2);">
                ✨ ${candidate.matchScore}% Compatibility Score
              </span>
              ${candidate.isVerified ? '<span style="background: var(--info-bg); color: var(--info); font-weight: 700; font-size: 0.8rem; padding: 0.25rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--info-border);">✓ ID Verified</span>' : ''}
              ${candidate.isPremium ? '<span style="background: var(--warning-bg); color: var(--warning); font-weight: 700; font-size: 0.8rem; padding: 0.25rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--warning-border);">★ Premium Member</span>' : ''}
            </div>
            <p style="font-size: 0.925rem; color: var(--text-secondary); line-height: 1.5;">
              ${candidate.about}
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; background: var(--surface-alt); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Age & Height</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.age} Years · ${candidate.height} Ft</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Profession & Income</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.occupation} · ${candidate.annualIncome}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Education</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.education}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Religion / Community</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.religion}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Mother Tongue</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.motherTongue}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Marital Status</div>
            <div style="font-weight: 700; color: var(--text-main);">${candidate.maritalStatus} (${candidate.diet})</div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Interests & Hobbies</div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${candidate.interests.map(i => `<span class="tag-badge" style="background: var(--surface);">${i}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="toggleCandidateShortlist('${candidate.id}'); closeCandidateDetailModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isShortlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>${isShortlisted ? 'Remove Shortlist' : 'Shortlist'}</span>
        </button>
        <button type="button" class="btn btn-primary" onclick="expressInterest('${candidate.id}'); closeCandidateDetailModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${isExpressed ? 'Interest Already Sent' : 'Send Express Interest'}</span>
        </button>
      </div>
    </div>
  `;

  setTimeout(() => modalOverlay.classList.add('active'), 10);
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
