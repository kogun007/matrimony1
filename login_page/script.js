/**
 * Nexus Auth - Interactive Login & Sign-Up Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const greetingTitle = document.getElementById('greetingTitle');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const captchaInput = document.getElementById('captchaInput');
  const captchaCanvas = document.getElementById('captchaCanvas');
  const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  
  const signupForm = document.getElementById('signupForm');
  const signupEmailInput = document.getElementById('signupEmail');
  
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  let currentCaptchaCode = '';

  // 1. Dynamic Time-aware Friendly Greeting
  function updateGreeting() {
    const hour = new Date().getHours();
    let timeGreeting = 'Welcome back!';
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning!';
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = 'Good afternoon!';
    } else {
      timeGreeting = 'Good evening!';
    }
    greetingTitle.innerHTML = `${timeGreeting} <span class="wave">👋</span>`;
  }
  updateGreeting();

  // 2. Dynamic Captcha Generator using HTML5 Canvas
  function generateCaptchaText(length = 5) {
    // Avoid ambiguous characters like 0, O, 1, I, l
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function drawCaptcha() {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext('2d');
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;

    currentCaptchaCode = generateCaptchaText(5);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#131b2e');
    bgGradient.addColorStop(1, '#0e1626');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.strokeStyle = `rgba(${100 + Math.random() * 155}, ${120 + Math.random() * 135}, 255, ${0.15 + Math.random() * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
      ctx.fill();
    }

    // Render characters with varying rotations, sizes, and vibrant neon colors
    const colors = ['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24'];
    const charSpacing = width / (currentCaptchaCode.length + 1);

    for (let i = 0; i < currentCaptchaCode.length; i++) {
      const char = currentCaptchaCode[i];
      ctx.save();

      const fontSize = Math.floor(Math.random() * 5) + 20; // 20-24px
      ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = colors[i % colors.length];
      ctx.shadowBlur = 4;

      const x = (i + 1) * charSpacing - 4;
      const y = height / 2 + Math.floor(Math.random() * 6) + 4;
      const angle = (Math.random() - 0.5) * 0.45; // Subtle tilt

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }

  drawCaptcha();

  // Refresh captcha button event
  refreshCaptchaBtn.addEventListener('click', () => {
    drawCaptcha();
    captchaInput.value = '';
    clearFieldError(captchaInput, 'captchaError');
    captchaInput.focus();
  });

  // 3. Password Show/Hide Toggle
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    
    const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
    const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');
    
    if (isPassword) {
      eyeOpen.style.display = 'none';
      eyeClosed.style.display = 'block';
    } else {
      eyeOpen.style.display = 'block';
      eyeClosed.style.display = 'none';
    }
  });

  // 4. Toast Notification Helper
  let toastTimeout;
  function showToast(message, type = 'success', duration = 4000) {
    clearTimeout(toastTimeout);
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✓' : '⚠️';
    toast.hidden = false;

    toastTimeout = setTimeout(() => {
      toast.hidden = true;
    }, duration);
  }

  // 5. Input Validation Helpers
  function setFieldError(input, errorId, message) {
    input.classList.add('is-invalid');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }

  function clearFieldError(input, errorId) {
    input.classList.remove('is-invalid');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
  }

  // Real-time error clearing on input
  usernameInput.addEventListener('input', () => clearFieldError(usernameInput, 'usernameError'));
  passwordInput.addEventListener('input', () => clearFieldError(passwordInput, 'passwordError'));
  captchaInput.addEventListener('input', () => clearFieldError(captchaInput, 'captchaError'));
  signupEmailInput.addEventListener('input', () => clearFieldError(signupEmailInput, 'signupEmailError'));

  // 6. Login Form Submission Handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Username
    const usernameVal = usernameInput.value.trim();
    if (!usernameVal) {
      setFieldError(usernameInput, 'usernameError', 'Please enter your username or email.');
      isValid = false;
    } else if (usernameVal.length < 3) {
      setFieldError(usernameInput, 'usernameError', 'Username must be at least 3 characters.');
      isValid = false;
    } else {
      clearFieldError(usernameInput, 'usernameError');
    }

    // Validate Password
    const passwordVal = passwordInput.value;
    if (!passwordVal) {
      setFieldError(passwordInput, 'passwordError', 'Please enter your password.');
      isValid = false;
    } else if (passwordVal.length < 6) {
      setFieldError(passwordInput, 'passwordError', 'Password must be at least 6 characters.');
      isValid = false;
    } else {
      clearFieldError(passwordInput, 'passwordError');
    }

    // Validate Captcha
    const captchaVal = captchaInput.value.trim().toUpperCase();
    if (!captchaVal) {
      setFieldError(captchaInput, 'captchaError', 'Please enter the captcha code.');
      isValid = false;
    } else if (captchaVal !== currentCaptchaCode) {
      setFieldError(captchaInput, 'captchaError', 'Incorrect captcha code. Try again.');
      drawCaptcha(); // Generate fresh captcha on failure
      captchaInput.value = '';
      isValid = false;
    } else {
      clearFieldError(captchaInput, 'captchaError');
    }

    if (isValid) {
      // Simulate Successful Login
      const loginBtn = document.getElementById('loginBtn');
      const originalText = loginBtn.innerHTML;
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span>Signing in...</span>';

      setTimeout(() => {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
        showToast(`Welcome, ${usernameVal}! Sign in successful.`, 'success');
        
        // Refresh captcha for subsequent attempts
        drawCaptcha();
        captchaInput.value = '';
      }, 1000);
    }
  });

  // 7. Forgot Password Link Handler
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const emailPrompt = prompt('Please enter your registered email address to receive password reset instructions:');
    if (emailPrompt && emailPrompt.trim()) {
      showToast(`Password reset link has been dispatched to ${emailPrompt.trim()}.`, 'success', 5000);
    }
  });

  // 8. Sign Up Form Submission Handler
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = signupEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailVal) {
      setFieldError(signupEmailInput, 'signupEmailError', 'Please provide an email address.');
      return;
    }

    if (!emailRegex.test(emailVal)) {
      setFieldError(signupEmailInput, 'signupEmailError', 'Please enter a valid email address.');
      return;
    }

    clearFieldError(signupEmailInput, 'signupEmailError');

    // Simulate Sign Up Invitation Request
    const signupBtn = document.getElementById('signupBtn');
    const originalText = signupBtn.innerHTML;
    signupBtn.disabled = true;
    signupBtn.innerHTML = '<span>Submitting...</span>';

    setTimeout(() => {
      signupBtn.disabled = false;
      signupBtn.innerHTML = originalText;
      signupEmailInput.value = '';
      showToast(`Registration invite sent to ${emailVal}! Check your inbox.`, 'success', 5000);
    }, 800);
  });
});
