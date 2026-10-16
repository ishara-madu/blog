// The Dispatched — Editorial Studio & GitHub Storage Client (Owner-Only Protected)

// ===================================================
// 1. OWNER AUTHENTICATION & ACCESS GATE
// ===================================================
const authGate = document.getElementById('auth-gate');
const studioApp = document.getElementById('studio-app');
const authForm = document.getElementById('auth-form');
const authOwnerInput = document.getElementById('auth-owner');
const authRepoInput = document.getElementById('auth-repo');
const authTokenInput = document.getElementById('auth-token');
const authFeedback = document.getElementById('auth-feedback');
const authBtn = document.getElementById('btn-auth');
const ownerBadge = document.getElementById('owner-badge');
const ownerNameEl = document.getElementById('owner-name');
const ownerAvatarEl = document.getElementById('owner-avatar');
const btnSignOut = document.getElementById('btn-sign-out');

// 1-Click Quick Re-Auth Elements
const quickReauthBox = document.getElementById('quick-reauth-box');
const quickNameEl = document.getElementById('quick-name');
const quickAvatarEl = document.getElementById('quick-avatar');
const btnQuickSignin = document.getElementById('btn-quick-signin');

// Manual Token Form Toggle Elements
const toggleManualAuth = document.getElementById('toggle-manual-auth');
const toggleManualText = document.getElementById('toggle-manual-text');

function getOwnerSession() {
  const raw = localStorage.getItem('gh_owner_auth');
  if (!raw) return null;
  try {
    let parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {}
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function checkOwnerAccess() {
  const session = getOwnerSession();
  if (session && session.isOwner && session.token) {
    // Verified Owner is logged in
    if (authGate) authGate.classList.add('hidden');
    if (studioApp) studioApp.classList.remove('hidden');
    if (ownerBadge) ownerBadge.classList.remove('hidden');
    if (ownerNameEl) ownerNameEl.textContent = `@${session.username}`;
    if (ownerAvatarEl && session.avatarUrl) {
      ownerAvatarEl.src = session.avatarUrl;
      ownerAvatarEl.classList.remove('hidden');
    }

    // Pre-populate settings form
    syncSettingsFields(session);
  } else {
    // Restricted: Show Auth Gate
    if (authGate) authGate.classList.remove('hidden');
    if (studioApp) studioApp.classList.add('hidden');
    if (ownerBadge) ownerBadge.classList.add('hidden');

    // Check if we have a cached previous session to offer 1-Click Quick Re-Auth
    const lastSession = getOwnerSession();
    if (lastSession && lastSession.username) {
      if (quickReauthBox) quickReauthBox.classList.remove('hidden');
      if (quickNameEl) quickNameEl.textContent = `@${lastSession.username}`;
      if (quickAvatarEl && lastSession.avatarUrl) {
        quickAvatarEl.src = lastSession.avatarUrl;
      }
    } else {
      if (quickReauthBox) quickReauthBox.classList.add('hidden');
    }

    // Pre-fill owner/repo if saved in config, otherwise default to ishara-madu/blog
    const savedConfig = localStorage.getItem('gh_config');
    let savedOwner = 'ishara-madu';
    let savedRepo = 'blog';
    if (savedConfig) {
      try {
        const c = JSON.parse(savedConfig);
        if (c.owner) savedOwner = c.owner;
        if (c.repo) savedRepo = c.repo;
      } catch (e) {}
    }
    if (authOwnerInput) authOwnerInput.value = savedOwner;
    if (authRepoInput) authRepoInput.value = savedRepo;

    // Handle OAuth Callback / Error URL params
    handleAuthUrlParams();
  }
}

function handleAuthUrlParams() {
  const url = new URL(window.location.href);
  const error = url.searchParams.get('error');
  const needsToken = url.searchParams.get('needs_token');

  if (error) {
    showAuthNotice(
      false,
      `Authentication error: ${decodeURIComponent(error)}`
    );
  } else if (needsToken) {
    showAuthNotice(
      null,
      'Please enter your GitHub Personal Access Token for @ishara-madu below. It will be securely stored in your browser so you will only need 1 click in the future.'
    );
    if (authForm) authForm.classList.remove('hidden');
  }
}

function showAuthNotice(isSuccess, msg) {
  if (!authFeedback) return;
  authFeedback.classList.remove('hidden');
  authFeedback.textContent = msg;

  if (isSuccess === true) {
    authFeedback.className =
      'mb-5 rounded-md border border-emerald-300 bg-emerald-50/70 p-3.5 text-left text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
  } else if (isSuccess === false) {
    authFeedback.className =
      'mb-5 rounded-md border border-rose-300 bg-rose-50/70 p-3.5 text-left text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
  } else {
    authFeedback.className =
      'mb-5 rounded-md border border-neutral-300 bg-neutral-100 p-3.5 text-left text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  }
}

// 1-Click Quick Re-Auth Handler
if (btnQuickSignin) {
  btnQuickSignin.addEventListener('click', () => {
    const session = getOwnerSession();
    if (session && session.token && session.username.toLowerCase() === 'ishara-madu') {
      session.isOwner = true;
      localStorage.setItem('gh_owner_auth', JSON.stringify(session));
      showToast('Welcome Back', `Re-authenticated as verified owner @${session.username}.`);
      checkOwnerAccess();
    }
  });
}

// Toggle Manual Token Form
if (toggleManualAuth && authForm) {
  toggleManualAuth.addEventListener('click', () => {
    const isHidden = authForm.classList.contains('hidden');
    if (isHidden) {
      authForm.classList.remove('hidden');
      if (toggleManualText) toggleManualText.textContent = 'Hide Manual Token Options';
    } else {
      authForm.classList.add('hidden');
      if (toggleManualText) toggleManualText.textContent = 'Manual Token / Custom Repository Settings';
    }
  });
}

function syncSettingsFields(session) {
  const ownerInput = document.getElementById('gh-owner');
  const repoInput = document.getElementById('gh-repo');
  const branchInput = document.getElementById('gh-branch');
  const pathInput = document.getElementById('gh-path');
  const tokenInput = document.getElementById('gh-token');

  if (ownerInput) ownerInput.value = session.owner || 'ishara-madu';
  if (repoInput) repoInput.value = session.repo || 'blog';
  if (branchInput) branchInput.value = session.branch || 'main';
  if (pathInput) pathInput.value = session.pathPrefix || 'src/content/posts';
  if (tokenInput) tokenInput.value = session.token || '';
}

// Sign In / Verify Owner via Manual Form
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const owner = authOwnerInput.value.trim() || 'ishara-madu';
    const repo = authRepoInput.value.trim() || 'blog';
    const token = authTokenInput.value.trim();

    if (!token) {
      showAuthNotice(false, 'Please enter your GitHub Access Token for @ishara-madu.');
      return;
    }

    authBtn.disabled = true;
    authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verifying Owner Access...</span>';
    authFeedback.classList.add('hidden');

    try {
      // 1. Get authenticated user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        showAuthNotice(false, err.message || 'Invalid GitHub token. Please verify your token has "repo" scope.');
        authBtn.disabled = false;
        authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verify & Authenticate Token</span>';
        return;
      }

      const userData = await userRes.json();
      const authenticatedUser = userData.login;

      // 2. Strict Owner Verification: must be @ishara-madu
      const isOwner = authenticatedUser.toLowerCase() === 'ishara-madu';

      if (!isOwner) {
        showAuthNotice(
          false,
          `Access Denied: You authenticated as @${authenticatedUser}. Only @ishara-madu is permitted to create, edit, or delete articles in https://github.com/ishara-madu/blog.`
        );
        authBtn.disabled = false;
        authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verify & Authenticate Token</span>';
        return;
      }

      // 3. Verify permissions on repository ishara-madu/blog
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!repoRes.ok) {
        const err = await repoRes.json().catch(() => ({}));
        showAuthNotice(false, err.message || `Cannot access repository ${owner}/${repo}. Check repository permissions.`);
        authBtn.disabled = false;
        authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verify & Authenticate Token</span>';
        return;
      }

      const repoData = await repoRes.json();
      const repoOwner = repoData.owner?.login || owner;
      const permissions = repoData.permissions || {};
      const hasAdminRights = Boolean(permissions.admin || isOwner);

      if (!isOwner && !hasAdminRights) {
        showAuthNotice(
          false,
          `Access Denied: You authenticated as @${authenticatedUser}, but this repository is owned by @${repoOwner}. Only the repository owner can create, edit, or delete articles.`
        );
        authBtn.disabled = false;
        authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verify & Authenticate Token</span>';
        return;
      }

      // Success: Save Owner Session
      const session = {
        isOwner: true,
        username: authenticatedUser,
        avatarUrl: userData.avatar_url,
        owner,
        repo,
        branch: repoData.default_branch || 'main',
        pathPrefix: 'src/content/posts',
        token,
      };

      localStorage.setItem('gh_owner_auth', JSON.stringify(session));
      localStorage.setItem('gh_config', JSON.stringify(session));

      showToast('Welcome Back, Owner', `Verified administrative access granted for @${authenticatedUser}.`);
      checkOwnerAccess();
    } catch (err) {
      showAuthNotice(false, `Network connection error: ${err.message}`);
    } finally {
      authBtn.disabled = false;
      authBtn.innerHTML = '<span class="inline-flex items-center gap-2">Verify & Authenticate Token</span>';
    }
  });
}

// Sign Out Handler
if (btnSignOut) {
  btnSignOut.addEventListener('click', () => {
    localStorage.removeItem('gh_owner_auth');
    showToast('Signed Out', 'Owner administrative session terminated.');
    checkOwnerAccess();
  });
}

// Initialize Auth
checkOwnerAccess();

// ===================================================
// 2. TABS CONTROLLER
// ===================================================
const tabButtons = document.querySelectorAll('.studio-tab');
const panels = document.querySelectorAll('.studio-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => {
      b.classList.remove(
        'active-tab',
        'font-semibold',
        'text-neutral-950',
        'dark:text-white',
        'border-neutral-950',
        'dark:border-white'
      );
      b.classList.add('text-neutral-500', 'dark:text-neutral-400', 'border-transparent');
    });

    btn.classList.add(
      'active-tab',
      'font-semibold',
      'text-neutral-950',
      'dark:text-white',
      'border-neutral-950',
      'dark:border-white'
    );
    btn.classList.remove('text-neutral-500', 'dark:text-neutral-400', 'border-transparent');

    const targetId = btn.getAttribute('data-target');
    panels.forEach((p) => {
      if (p.id === targetId) {
        p.classList.remove('hidden');
      } else {
        p.classList.add('hidden');
      }
    });
  });
});

// ===================================================
// 3. EDIT & DELETE ARTICLE ACTIONS (OWNER ONLY)
// ===================================================
let editingSlug = null;
const composerModeBadge = document.getElementById('composer-mode-badge');
const composerModeText = document.getElementById('composer-mode-text');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const submitBtnText = document.getElementById('submit-btn-text');

// Handle Edit buttons
const editButtons = document.querySelectorAll('.btn-edit-post');
editButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const raw = btn.getAttribute('data-post');
    if (!raw) return;

    try {
      let post;
      try {
        post = JSON.parse(decodeURIComponent(escape(atob(raw))));
      } catch (e1) {
        try {
          post = JSON.parse(atob(raw));
        } catch (e2) {
          post = JSON.parse(raw);
        }
      }

      editingSlug = post.slug;

      // Populate composer fields
      document.getElementById('post-title').value = post.title || '';
      const slugField = document.getElementById('post-slug');
      if (slugField) {
        slugField.value = post.slug || '';
        slugField.readOnly = true;
        slugField.classList.add('opacity-70', 'cursor-not-allowed', 'bg-neutral-100', 'dark:bg-neutral-800');
      }
      document.getElementById('post-excerpt').value = post.excerpt || '';
      document.getElementById('post-readtime').value = post.readTime || '6 min read';
      document.getElementById('post-image').value = post.coverImage || '';
      document.getElementById('post-image-alt').value = post.coverAlt || '';
      document.getElementById('post-tags').value = (post.tags || []).join(', ');
      document.getElementById('post-content').value = post.content || '';

      // Set category select
      const catSelect = document.getElementById('post-category');
      if (catSelect) catSelect.value = post.categorySlug || catSelect.options[0].value;

      // Update image preview
      const coverPreview = document.getElementById('cover-preview');
      const coverPlaceholder = document.getElementById('cover-placeholder');
      if (post.coverImage && coverPreview && coverPlaceholder) {
        coverPreview.src = post.coverImage;
        coverPreview.classList.remove('hidden');
        coverPlaceholder.classList.add('hidden');
      }

      // Update composer mode indicator
      if (composerModeBadge) composerModeBadge.classList.remove('hidden');
      if (composerModeText) composerModeText.textContent = `Editing: "${post.title}"`;
      if (submitBtnText) submitBtnText.textContent = 'Update & Commit to GitHub';

      // Switch to Composer Tab
      document.getElementById('tab-btn-compose').click();
      showToast('Loaded in Editor', `Now editing "${post.title}". Make changes and commit.`);
    } catch (e) {
      console.error('Failed to parse post data for editing', e);
    }
  });
});

// Cancel Edit Mode
if (btnCancelEdit) {
  btnCancelEdit.addEventListener('click', () => {
    resetComposer();
  });
}

function resetComposer() {
  editingSlug = null;
  document.getElementById('composer-form').reset();
  const slugField = document.getElementById('post-slug');
  if (slugField) {
    slugField.readOnly = false;
    slugField.classList.remove('opacity-70', 'cursor-not-allowed', 'bg-neutral-100', 'dark:bg-neutral-800');
  }
  if (composerModeBadge) composerModeBadge.classList.add('hidden');
  if (submitBtnText) submitBtnText.textContent = 'Commit Directly to GitHub';

  const coverPreview = document.getElementById('cover-preview');
  const coverPlaceholder = document.getElementById('cover-placeholder');
  if (coverPreview) coverPreview.classList.add('hidden');
  if (coverPlaceholder) coverPlaceholder.classList.remove('hidden');
}

// Handle Delete buttons (Owner Only)
const deleteButtons = document.querySelectorAll('.btn-delete-post');
deleteButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const session = getOwnerSession();
    if (!session || !session.token) {
      showToast('Authentication Required', 'Please authenticate as the repository owner to delete articles.', true);
      return;
    }

    const slug = btn.getAttribute('data-slug');
    const title = btn.getAttribute('data-title');

    const confirmed = confirm(`Are you sure you want to permanently delete this article from GitHub storage?\n\n"${title}" (${slug}.md)`);
    if (!confirmed) return;

    btn.disabled = true;
    const cleanPrefix = (session.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
    const filePath = `${cleanPrefix}/${slug}.md`;

    try {
      // 1. Get SHA of file in GitHub repo
      const checkRes = await fetch(
        `https://api.github.com/repos/${session.owner}/${session.repo}/contents/${filePath}?ref=${session.branch || 'main'}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      if (!checkRes.ok) {
        showToast('File Not Found on GitHub', `Could not find ${filePath} in repository.`, true);
        btn.disabled = false;
        return;
      }

      const fileData = await checkRes.json();
      const sha = fileData.sha;

      // 2. Send DELETE request to GitHub Contents API
      const delRes = await fetch(
        `https://api.github.com/repos/${session.owner}/${session.repo}/contents/${filePath}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Delete article: ${slug}.md (by @${session.username})`,
            sha,
            branch: session.branch || 'main',
          }),
        }
      );

      if (delRes.ok) {
        showToast('Article Deleted', `Successfully deleted ${slug}.md from GitHub storage.`);
        // Hide or remove row from DOM
        const tr = btn.closest('tr');
        if (tr) {
          tr.style.opacity = '0.3';
          tr.style.textDecoration = 'line-through';
        }
      } else {
        const err = await delRes.json().catch(() => ({}));
        showToast('Delete Failed', err.message || delRes.statusText, true);
      }
    } catch (err) {
      showToast('Network Error', err.message, true);
    } finally {
      btn.disabled = false;
    }
  });
});

// ===================================================
// 4. COMPOSER SLUG & PREVIEW AUTO-SYNC
// ===================================================
const titleInput = document.getElementById('post-title');
const slugInput = document.getElementById('post-slug');
const imageInput = document.getElementById('post-image');
const coverPreview = document.getElementById('cover-preview');
const coverPlaceholder = document.getElementById('cover-placeholder');
const contentInput = document.getElementById('post-content');
const wordCount = document.getElementById('word-count');
const readtimeInput = document.getElementById('post-readtime');

if (titleInput && slugInput) {
  titleInput.addEventListener('input', () => {
    if (!editingSlug) {
      slugInput.value = titleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  });
}

if (imageInput && coverPreview && coverPlaceholder) {
  imageInput.addEventListener('input', () => {
    const url = imageInput.value.trim();
    if (url) {
      coverPreview.src = url;
      coverPreview.classList.remove('hidden');
      coverPlaceholder.classList.add('hidden');
    } else {
      coverPreview.classList.add('hidden');
      coverPlaceholder.classList.remove('hidden');
    }
  });
}

if (contentInput && wordCount && readtimeInput) {
  contentInput.addEventListener('input', () => {
    const text = contentInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `${words} words`;
    const mins = Math.max(1, Math.ceil(words / 200));
    readtimeInput.value = `${mins} min read`;
  });
}

// Toolbar Formatting Helpers
const toolbarButtons = document.querySelectorAll('.toolbar-btn');
toolbarButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const format = btn.getAttribute('data-format');
    if (!contentInput) return;

    const start = contentInput.selectionStart;
    const end = contentInput.selectionEnd;
    const selected = contentInput.value.substring(start, end);
    let replacement = '';

    switch (format) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'h2':
        replacement = `\n\n## ${selected || 'Section Heading'}\n`;
        break;
      case 'h3':
        replacement = `\n\n### ${selected || 'Subheading'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Quote text'}\n`;
        break;
      case 'code':
        replacement = `\n\`\`\`ts\n${selected || '// code snippet'}\n\`\`\`\n`;
        break;
      case 'link':
        replacement = `[${selected || 'link text'}](https://example.com)`;
        break;
    }

    contentInput.setRangeText(replacement, start, end, 'end');
    contentInput.focus();
  });
});

// ===================================================
// 5. COMMIT & SAVE DIRECTLY TO GITHUB STORAGE
// ===================================================
const composerForm = document.getElementById('composer-form');
const btnCommit = document.getElementById('btn-commit-github');
const btnCopy = document.getElementById('btn-copy-markdown');
const btnDownload = document.getElementById('btn-download-md');

function buildMarkdownData() {
  const title = titleInput.value.trim();
  const slug = slugInput.value.trim();
  const excerpt = document.getElementById('post-excerpt').value.trim();
  const readTime = readtimeInput.value.trim();
  const image =
    imageInput.value.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c';
  const imageAlt = document.getElementById('post-image-alt').value.trim() || title;
  const catSelect = document.getElementById('post-category');
  const selectedOpt = catSelect.options[catSelect.selectedIndex];
  const category = selectedOpt.getAttribute('data-name');
  const categorySlug = selectedOpt.value;
  const categoryColor = selectedOpt.getAttribute('data-color');

  const authorSelect = document.getElementById('post-author');
  const aOpt = authorSelect.options[authorSelect.selectedIndex];
  const authorName = aOpt.getAttribute('data-name');
  const authorRole = aOpt.getAttribute('data-role');
  const authorAvatar = aOpt.getAttribute('data-avatar');
  const authorHandle = aOpt.getAttribute('data-handle');
  const authorBio = aOpt.getAttribute('data-bio');

  const tagsRaw = document.getElementById('post-tags').value.trim();
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : ['Engineering'];
  const content = contentInput.value.trim();

  const now = new Date();
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const publishedAt = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
coverImage: "${image}"
coverAlt: "${imageAlt.replace(/"/g, '\\"')}"
category: "${category}"
categorySlug: "${categorySlug}"
categoryColor: "${categoryColor}"
publishedAt: "${publishedAt}"
readTime: "${readTime}"
author:
  name: "${authorName}"
  role: "${authorRole}"
  avatar: "${authorAvatar}"
  handle: "${authorHandle}"
  bio: "${authorBio.replace(/"/g, '\\"')}"
tags:
${tags.map((t) => `  - "${t}"`).join('\n')}
---

${content}
`;

  return {
    slug,
    title,
    frontmatter,
    markdown: frontmatter,
  };
}

// Copy Markdown
if (btnCopy) {
  btnCopy.addEventListener('click', async () => {
    const data = buildMarkdownData();
    await navigator.clipboard.writeText(data.markdown);
    showToast('Copied to Clipboard', 'Full Markdown with frontmatter copied.');
  });
}

// Download .md File
if (btnDownload) {
  btnDownload.addEventListener('click', () => {
    const data = buildMarkdownData();
    const blob = new Blob([data.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.slug || 'article'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded', `Saved ${data.slug}.md to your computer.`);
  });
}

// Commit Form Submission (Owner Only)
if (composerForm) {
  composerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const session = getOwnerSession();
    if (!session || !session.token) {
      showToast(
        'Owner Authentication Required',
        'You must authenticate as the repository owner to publish or edit articles.',
        true
      );
      checkOwnerAccess();
      return;
    }

    const data = buildMarkdownData();
    btnCommit.disabled = true;
    btnCommit.innerText = 'Committing to GitHub...';

    const cleanPrefix = (session.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
    const filePath = `${cleanPrefix}/${data.slug}.md`;
    const encoded = btoa(unescape(encodeURIComponent(data.markdown)));

    try {
      // 1. Check for existing SHA
      let sha;
      const checkRes = await fetch(
        `https://api.github.com/repos/${session.owner}/${session.repo}/contents/${filePath}?ref=${session.branch || 'main'}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${session.token}`,
          },
        }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }

      // 2. Put file to GitHub (Commit)
      const actionVerb = sha ? 'Update' : 'Publish';
      const commitRes = await fetch(
        `https://api.github.com/repos/${session.owner}/${session.repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `${actionVerb} article: ${data.title} (by @${session.username})`,
            content: encoded,
            branch: session.branch || 'main',
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (commitRes.ok) {
        showToast(
          'Committed to GitHub Storage!',
          `Successfully ${actionVerb.toLowerCase()}d ${filePath} to branch ${session.branch || 'main'}.`
        );
        resetComposer();
      } else {
        const errData = await commitRes.json().catch(() => ({}));
        showToast('Commit Error', errData.message || commitRes.statusText, true);
      }
    } catch (err) {
      showToast('Network Error', err.message, true);
    } finally {
      btnCommit.disabled = false;
      if (submitBtnText) {
        submitBtnText.textContent = editingSlug ? 'Update & Commit to GitHub' : 'Commit Directly to GitHub';
      }
    }
  });
}

// Toast Helper
function showToast(title, message, isError = false) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (toast && toastTitle && toastMessage) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    if (toastIcon) {
      toastIcon.className = isError
        ? 'text-rose-500 shrink-0 mt-0.5'
        : 'text-emerald-500 shrink-0 mt-0.5';
    }
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 5000);
  }
}

// ===================================================
// 6. GITHUB STORAGE SETTINGS & TEST CONNECTION
// ===================================================
const settingsForm = document.getElementById('github-settings-form');
const btnTestConnection = document.getElementById('btn-test-connection');
const testFeedback = document.getElementById('test-feedback');
const testMessage = document.getElementById('test-message');

function showTestStatus(isSuccess, message) {
  if (!testFeedback || !testMessage) return;
  testFeedback.classList.remove('hidden');
  testMessage.textContent = message;

  if (isSuccess === true) {
    testFeedback.className =
      'rounded-md border border-emerald-300 bg-emerald-50/70 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
  } else if (isSuccess === false) {
    testFeedback.className =
      'rounded-md border border-rose-300 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
  } else {
    testFeedback.className =
      'rounded-md border border-neutral-300 bg-neutral-100 p-3.5 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  }
}

if (btnTestConnection) {
  btnTestConnection.addEventListener('click', async () => {
    const owner = document.getElementById('gh-owner').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();
    const branch = document.getElementById('gh-branch').value.trim() || 'main';
    const token = document.getElementById('gh-token').value.trim();

    if (!owner || !repo || !token) {
      showTestStatus(false, 'Please provide GitHub Owner, Repository name, and Token before testing.');
      return;
    }

    btnTestConnection.disabled = true;
    btnTestConnection.innerText = 'Testing Connection...';
    showTestStatus(null, 'Verifying GitHub credentials and repository permissions...');

    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        showTestStatus(false, `Authentication failed: ${err.message || 'Invalid Token'}`);
        return;
      }

      const userData = await userRes.json();
      const authenticatedUser = userData.login;

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!repoRes.ok) {
        const err = await repoRes.json().catch(() => ({}));
        showTestStatus(false, `Repository error: ${err.message || 'Repository not found or access denied'}`);
        return;
      }

      const repoData = await repoRes.json();
      const repoOwner = repoData.owner?.login || owner;
      const permissions = repoData.permissions || {};

      const isDirectOwner = authenticatedUser.toLowerCase() === repoOwner.toLowerCase();
      const hasAdminRights = Boolean(permissions.admin || isDirectOwner);

      if (!isDirectOwner && !hasAdminRights) {
        showTestStatus(
          false,
          `Connected as @${authenticatedUser}, but this repository is owned by @${repoOwner}. You are not verified as the repository owner and cannot publish, edit, or delete articles.`
        );
        return;
      }

      showTestStatus(
        true,
        `Connection verified! Authenticated as verified repo owner @${authenticatedUser} on ${repoData.full_name} (${branch} branch). Full administrative privileges confirmed.`
      );
    } catch (err) {
      showTestStatus(false, `Network connection error: ${err.message}`);
    } finally {
      btnTestConnection.disabled = false;
      btnTestConnection.innerText = 'Test Connection';
    }
  });
}

if (settingsForm) {
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const owner = document.getElementById('gh-owner').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();
    const branch = document.getElementById('gh-branch').value.trim() || 'main';
    const pathPrefix = document.getElementById('gh-path').value.trim() || 'src/content/posts';
    const token = document.getElementById('gh-token').value.trim();

    const currentSession = getOwnerSession() || {};
    const updatedSession = {
      ...currentSession,
      owner,
      repo,
      branch,
      pathPrefix,
      token,
      isOwner: true,
    };

    localStorage.setItem('gh_owner_auth', JSON.stringify(updatedSession));
    localStorage.setItem('gh_config', JSON.stringify(updatedSession));

    showToast('Settings Saved', 'GitHub storage parameters updated successfully.');
  });
}

