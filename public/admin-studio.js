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

      // Set author select
      const authorSelect = document.getElementById('post-author');
      if (authorSelect && post.author) {
        for (let i = 0; i < authorSelect.options.length; i++) {
          const opt = authorSelect.options[i];
          if (
            opt.getAttribute('data-name')?.toLowerCase() === post.author.name?.toLowerCase() ||
            opt.getAttribute('data-handle')?.toLowerCase() === post.author.handle?.toLowerCase()
          ) {
            authorSelect.selectedIndex = i;
            break;
          }
        }
        if (typeof updateInlineEditButtonLabel === 'function') {
          updateInlineEditButtonLabel();
        }
      }

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

    const confirmed = confirm(`Are you sure you want to permanently delete this article from local storage and GitHub repository?\n\n"${title}" (${slug}.md)`);
    if (!confirmed) return;

    btn.disabled = true;

    try {
      let isDeleted = false;
      let deleteNotice = '';

      // 1. Try local server endpoint /api/admin/posts (handles local disk + GitHub sync)
      try {
        const delRes = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            slug,
            title,
            token: session.token,
            branch: session.branch || 'main',
          }),
        });

        const resData = await delRes.json().catch(() => ({}));
        if (delRes.ok && resData.success) {
          isDeleted = true;
          deleteNotice = `Successfully deleted "${slug}.md" from storage.`;
        }
      } catch (localErr) {
        // Local endpoint not available (e.g. static Cloudflare Pages)
      }

      // 2. Direct GitHub API fallback (for Cloudflare Pages edge deployments)
      if (!isDeleted) {
        const cleanPrefix = (session.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
        const filePath = `${cleanPrefix}/${slug}.md`;
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
          const fileData = await checkRes.json();
          const ghDelRes = await fetch(
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
                sha: fileData.sha,
                branch: session.branch || 'main',
              }),
            }
          );
          if (ghDelRes.ok) {
            isDeleted = true;
            deleteNotice = `Successfully deleted "${slug}.md" from GitHub storage.`;
          }
        } else if (checkRes.status === 404) {
          isDeleted = true;
          deleteNotice = `Already removed from GitHub storage.`;
        }
      }

      if (isDeleted) {
        showToast('Article Deleted', deleteNotice);
        // Remove row smoothly from DOM
        const tr = btn.closest('tr');
        if (tr) {
          tr.style.opacity = '0';
          tr.style.transform = 'scale(0.98)';
          setTimeout(() => tr.remove(), 250);
        }
      } else {
        showToast('Delete Failed', 'Could not delete article from storage.', true);
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
  const authorFollowUrl = aOpt.getAttribute('data-follow-url') || '';
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
  followUrl: "${authorFollowUrl}"
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
    btnCommit.innerText = 'Saving & Committing...';

    try {
      let isSaved = false;
      let saveNotice = '';

      // 1. Try local server endpoint /api/admin/posts
      try {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'save',
            slug: data.slug,
            title: data.title,
            markdown: data.markdown,
            token: session.token,
            branch: session.branch || 'main',
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (res.ok && resData.success) {
          isSaved = true;
          saveNotice = resData.githubCommitted
            ? `Successfully saved "${data.slug}.md" locally and committed to GitHub storage!`
            : `Saved locally. (${resData.githubMessage || 'GitHub commit synced.'})`;
        }
      } catch (localErr) {
        // Local endpoint not available
      }

      // 2. Direct GitHub API fallback (for Cloudflare Pages edge deployments)
      if (!isSaved) {
        const cleanPrefix = (session.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
        const filePath = `${cleanPrefix}/${data.slug}.md`;
        const encoded = btoa(unescape(encodeURIComponent(data.markdown)));

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
          isSaved = true;
          saveNotice = `Successfully committed "${data.slug}.md" directly to GitHub storage!`;
        }
      }

      if (isSaved) {
        showToast('Article Published & Synced!', saveNotice);
        resetComposer();
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast('Save Failed', 'Could not save article to storage.', true);
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

// ===================================================
// 7. COMPREHENSIVE AUTHOR PROFILES CONTROLLER
// ===================================================
const adminProfileForm = document.getElementById('admin-profile-form');
const btnEditAuthorInline = document.getElementById('btn-edit-author-inline');
const btnEditAuthorInlineText = document.getElementById('btn-edit-author-inline-text');
const tabBtnAuthor = document.getElementById('tab-btn-author');
const adminAvatarInput = document.getElementById('admin-avatar');
const adminAvatarPreview = document.getElementById('admin-avatar-preview');
const postAuthorSelect = document.getElementById('post-author');
const authorCardsList = document.getElementById('author-cards-list');
const btnNewAuthor = document.getElementById('btn-new-author');
const btnDeleteProfile = document.getElementById('btn-delete-profile');
const authorKeyInput = document.getElementById('author-key');
const authorKeyGroup = document.getElementById('author-key-group');
const authorKeyNewInput = document.getElementById('author-key-input');
const authorFormTitle = document.getElementById('author-form-title');
const authorFormSubtitle = document.getElementById('author-form-subtitle');
const authorKeyBadge = document.getElementById('author-key-badge');

let currentEditingAuthorKey = 'ishara';
let authorsMap = {};

// Initialize authorsMap from existing DOM options
function initAuthorsMapFromDOM() {
  if (!postAuthorSelect) return;
  for (const opt of postAuthorSelect.options) {
    const key = opt.value;
    authorsMap[key] = {
      name: opt.getAttribute('data-name') || opt.textContent.split(' (')[0],
      role: opt.getAttribute('data-role') || '',
      avatar: opt.getAttribute('data-avatar') || '/images/authors/author-ishara.jpg',
      handle: opt.getAttribute('data-handle') || `@${key}`,
      followUrl: opt.getAttribute('data-follow-url') || `https://github.com/${key}`,
      bio: opt.getAttribute('data-bio') || '',
    };
  }
}

initAuthorsMapFromDOM();

// Fetch latest authors from API
async function fetchLatestAuthors() {
  try {
    const res = await fetch('/api/admin/profile');
    if (res.ok) {
      const data = await res.json();
      if (data.authors && Object.keys(data.authors).length > 0) {
        authorsMap = data.authors;
        renderAuthorCards();
        syncAuthorSelect(currentEditingAuthorKey || 'ishara');
        if (currentEditingAuthorKey && authorsMap[currentEditingAuthorKey]) {
          selectAuthorForEditing(currentEditingAuthorKey);
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch authors dynamically', e);
  }
}

fetchLatestAuthors();

// Render author cards shelf in Tab 4
function renderAuthorCards() {
  if (!authorCardsList) return;
  authorCardsList.innerHTML = '';

  Object.entries(authorsMap).forEach(([key, a]) => {
    const isSelected = key === currentEditingAuthorKey;
    const card = document.createElement('button');
    card.type = 'button';
    card.setAttribute('data-author-key', key);
    card.className = `author-card-select text-left p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer ${
      isSelected
        ? 'border-neutral-900 bg-neutral-100/80 dark:border-white dark:bg-neutral-800'
        : 'border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600'
    }`;

    card.innerHTML = `
      <img
        src="${a.avatar || '/images/authors/author-ishara.jpg'}"
        alt="${a.name}"
        class="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
      />
      <div class="min-w-0 flex-1">
        <div class="text-xs font-semibold text-neutral-950 dark:text-white truncate">
          ${a.name}
        </div>
        <div class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
          ${a.role || a.handle}
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      selectAuthorForEditing(key);
    });

    authorCardsList.appendChild(card);
  });
}

// Select an author and populate the editing form
function selectAuthorForEditing(key) {
  const author = authorsMap[key];
  if (!author) return;

  currentEditingAuthorKey = key;

  // Form Fields
  if (authorKeyInput) authorKeyInput.value = key;
  if (authorKeyGroup) authorKeyGroup.classList.add('hidden');
  if (authorKeyNewInput) authorKeyNewInput.required = false;

  const nameInput = document.getElementById('admin-name');
  const roleInput = document.getElementById('admin-role');
  const handleInput = document.getElementById('admin-handle');
  const followInput = document.getElementById('admin-follow');
  const avatarInput = document.getElementById('admin-avatar');
  const bioInput = document.getElementById('admin-bio');

  if (nameInput) nameInput.value = author.name || '';
  if (roleInput) roleInput.value = author.role || '';
  if (handleInput) handleInput.value = author.handle || '';
  if (followInput) followInput.value = author.followUrl || '';
  if (avatarInput) avatarInput.value = author.avatar || '';
  if (adminAvatarPreview) adminAvatarPreview.src = author.avatar || '/images/authors/author-ishara.jpg';
  if (bioInput) bioInput.value = author.bio || '';

  // Form Headers & Badges
  if (authorFormTitle) authorFormTitle.textContent = `Editing Profile: ${author.name}`;
  if (authorFormSubtitle) {
    authorFormSubtitle.innerHTML = `Key: <code class="font-mono text-neutral-800 dark:text-neutral-200">${key}</code> ${
      key === 'ishara' ? '(Primary Repository Owner)' : '(Editorial Contributor)'
    }`;
  }

  if (authorKeyBadge) {
    if (key === 'ishara') {
      authorKeyBadge.textContent = '● Owner Profile';
      authorKeyBadge.className = 'text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold';
    } else {
      authorKeyBadge.textContent = '● Contributor Profile';
      authorKeyBadge.className = 'text-xs font-mono text-neutral-500 dark:text-neutral-400 font-semibold';
    }
  }

  // Delete button visibility (Owner cannot be deleted)
  if (btnDeleteProfile) {
    if (key === 'ishara') {
      btnDeleteProfile.classList.add('hidden');
    } else {
      btnDeleteProfile.classList.remove('hidden');
    }
  }

  // Update card highlights
  const allCards = document.querySelectorAll('.author-card-select');
  allCards.forEach((c) => {
    const cKey = c.getAttribute('data-author-key');
    if (cKey === key) {
      c.className = 'author-card-select text-left p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer border-neutral-900 bg-neutral-100/80 dark:border-white dark:bg-neutral-800';
    } else {
      c.className = 'author-card-select text-left p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600';
    }
  });
}

// Switch to New Author Creation Mode
function setupNewAuthorMode() {
  currentEditingAuthorKey = null;

  if (authorKeyGroup) authorKeyGroup.classList.remove('hidden');
  if (authorKeyNewInput) {
    authorKeyNewInput.required = true;
    authorKeyNewInput.value = '';
    authorKeyNewInput.focus();
  }
  if (authorKeyInput) authorKeyInput.value = '';

  const nameInput = document.getElementById('admin-name');
  const roleInput = document.getElementById('admin-role');
  const handleInput = document.getElementById('admin-handle');
  const followInput = document.getElementById('admin-follow');
  const avatarInput = document.getElementById('admin-avatar');
  const bioInput = document.getElementById('admin-bio');

  if (nameInput) nameInput.value = '';
  if (roleInput) roleInput.value = 'Author & Contributor';
  if (handleInput) handleInput.value = '';
  if (followInput) followInput.value = '';
  if (avatarInput) avatarInput.value = '/images/authors/author-ishara.jpg';
  if (adminAvatarPreview) adminAvatarPreview.src = '/images/authors/author-ishara.jpg';
  if (bioInput) bioInput.value = '';

  if (authorFormTitle) authorFormTitle.textContent = 'Add New Author Profile';
  if (authorFormSubtitle) authorFormSubtitle.textContent = 'Create a new author to appear in the Lead Author selector and articles';
  if (authorKeyBadge) {
    authorKeyBadge.textContent = '● New Author';
    authorKeyBadge.className = 'text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold';
  }

  if (btnDeleteProfile) btnDeleteProfile.classList.add('hidden');

  // Deselect all cards
  const allCards = document.querySelectorAll('.author-card-select');
  allCards.forEach((c) => {
    c.className = 'author-card-select text-left p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600';
  });
}

if (btnNewAuthor) {
  btnNewAuthor.addEventListener('click', () => {
    setupNewAuthorMode();
  });
}

// Synchronize #post-author select dropdown
function syncAuthorSelect(selectedKey) {
  if (!postAuthorSelect) return;
  postAuthorSelect.innerHTML = '';

  Object.entries(authorsMap).forEach(([key, a]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${a.name} (${a.role || 'Contributor'})`;
    opt.setAttribute('data-name', a.name);
    opt.setAttribute('data-role', a.role || '');
    opt.setAttribute('data-avatar', a.avatar || '');
    opt.setAttribute('data-handle', a.handle || '');
    opt.setAttribute('data-follow-url', a.followUrl || '');
    opt.setAttribute('data-bio', a.bio || '');

    if (key === selectedKey) opt.selected = true;
    postAuthorSelect.appendChild(opt);
  });

  updateInlineEditButtonLabel();
}

function updateInlineEditButtonLabel() {
  if (!postAuthorSelect || !btnEditAuthorInlineText) return;
  const currentKey = postAuthorSelect.value;
  const author = authorsMap[currentKey];
  if (author) {
    btnEditAuthorInlineText.textContent = `Edit "${author.name}" Profile`;
  } else {
    btnEditAuthorInlineText.textContent = 'Edit Author Profile';
  }
}

if (postAuthorSelect) {
  postAuthorSelect.addEventListener('change', () => {
    updateInlineEditButtonLabel();
  });
}

// Inline "Edit Author Details" click in Composer
if (btnEditAuthorInline && tabBtnAuthor) {
  btnEditAuthorInline.addEventListener('click', () => {
    const currentKey = postAuthorSelect ? postAuthorSelect.value : 'ishara';
    tabBtnAuthor.click();
    selectAuthorForEditing(currentKey);
    if (adminProfileForm) {
      adminProfileForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Live Avatar Preview in Profile Form
if (adminAvatarInput && adminAvatarPreview) {
  adminAvatarInput.addEventListener('input', () => {
    const url = adminAvatarInput.value.trim();
    if (url) {
      adminAvatarPreview.src = url;
    }
  });
}

// Form Submit: Save or Update Author Profile
if (adminProfileForm) {
  adminProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let authorId = currentEditingAuthorKey;
    if (!authorId) {
      const rawSlug = authorKeyNewInput?.value.trim().toLowerCase() || '';
      authorId = rawSlug.replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
      if (!authorId) {
        showToast('Validation Error', 'Please enter a valid author slug/identifier (e.g. "kasun-perera").', true);
        return;
      }
    }

    const name = document.getElementById('admin-name').value.trim();
    const role = document.getElementById('admin-role').value.trim();
    const handle = document.getElementById('admin-handle').value.trim();
    const followUrl = document.getElementById('admin-follow').value.trim();
    const avatar = document.getElementById('admin-avatar').value.trim();
    const bio = document.getElementById('admin-bio').value.trim();

    if (!name) {
      showToast('Validation Error', 'Display Name is required.', true);
      return;
    }

    const session = getOwnerSession();
    const token = session?.token;

    const btnSubmit = document.getElementById('btn-save-profile');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Saving Profile...</span>';
    }

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: authorId,
          name,
          role,
          handle,
          followUrl,
          avatar,
          bio,
          token,
          action: 'save',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        authorsMap[authorId] = {
          name,
          role,
          handle,
          followUrl,
          avatar,
          bio,
        };

        if (authorId === 'ishara') {
          localStorage.setItem('gh_admin_profile', JSON.stringify(authorsMap[authorId]));
          if (ownerNameEl) ownerNameEl.textContent = `@${handle.replace(/^@/, '') || 'ishara-madu'}`;
          if (ownerAvatarEl && avatar) ownerAvatarEl.src = avatar;
        }

        renderAuthorCards();
        syncAuthorSelect(authorId);
        selectAuthorForEditing(authorId);

        const syncMsg = data.githubCommitted
          ? `Committed to repository storage and active across all articles!`
          : `Saved locally and ready for publishing!`;

        showToast('Author Profile Saved', syncMsg);
      } else {
        showToast('Profile Error', data.error || 'Failed to update author profile', true);
      }
    } catch (err) {
      showToast('Network Error', err.message, true);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<svg class="w-4 h-4 fill-current" viewBox="0 0 256 256"><path d="M219.31,72,184,36.69A15.86,15.86,0,0,0,172.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V83.31A15.86,15.86,0,0,0,219.31,72ZM168,48V80H88V48ZM208,208H48V48H72V88a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V51.31L208,75.31Z"/></svg><span>Save & Update Author Profile</span>';
      }
    }
  });
}

// Delete Author Profile
if (btnDeleteProfile) {
  btnDeleteProfile.addEventListener('click', async () => {
    if (!currentEditingAuthorKey || currentEditingAuthorKey === 'ishara') {
      showToast('Action Denied', 'The primary owner profile cannot be deleted.', true);
      return;
    }

    const author = authorsMap[currentEditingAuthorKey];
    const confirmed = confirm(`Are you sure you want to permanently delete author profile "${author?.name || currentEditingAuthorKey}"?`);
    if (!confirmed) return;

    const session = getOwnerSession();
    const token = session?.token;

    btnDeleteProfile.disabled = true;

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentEditingAuthorKey,
          action: 'delete',
          token,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        delete authorsMap[currentEditingAuthorKey];
        renderAuthorCards();
        syncAuthorSelect('ishara');
        selectAuthorForEditing('ishara');
        showToast('Author Deleted', `Successfully deleted author profile "${author?.name || currentEditingAuthorKey}".`);
      } else {
        showToast('Delete Failed', data.error || 'Could not delete author', true);
      }
    } catch (err) {
      showToast('Network Error', err.message, true);
    } finally {
      btnDeleteProfile.disabled = false;
    }
  });
}

// Initial selection & label setup
selectAuthorForEditing('ishara');
updateInlineEditButtonLabel();


