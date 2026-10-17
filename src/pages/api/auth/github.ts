import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';

export const prerender = false;

const TARGET_OWNER = 'ishara-madu';
const TARGET_REPO = 'blog';
const TARGET_BRANCH = 'main';

function getGitCredentialToken(): string | null {
  try {
    const input = 'protocol=https\nhost=github.com\n\n';
    const output = execSync('git credential fill', {
      input,
      encoding: 'utf-8',
      timeout: 3000,
    });
    const match = output.match(/^password=(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export const GET: APIRoute = async ({ request, redirect, locals }) => {
  const url = new URL(request.url);
  const runtimeEnv = (locals as any)?.runtime?.env || {};

  // 1. Try finding token from Cloudflare runtime env, process.env, import.meta.env, or local git credentials
  const token =
    runtimeEnv.GITHUB_TOKEN ||
    process.env.GITHUB_TOKEN ||
    import.meta.env.GITHUB_TOKEN ||
    getGitCredentialToken();

  if (token) {
    try {
      // 2. Fetch authenticated user profile from GitHub
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'TheDispatched-Blog-Studio',
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        const username = userData.login;

        // 3. Verify if user is the true repository owner (@ishara-madu)
        const isOwner = username.toLowerCase() === TARGET_OWNER.toLowerCase();

        // Also verify repository push/admin permissions on ishara-madu/blog
        const repoRes = await fetch(
          `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Bearer ${token}`,
              'User-Agent': 'TheDispatched-Blog-Studio',
            },
          }
        );

        let hasPermissions = isOwner;
        if (repoRes.ok) {
          const repoData = await repoRes.json();
          const perms = repoData.permissions || {};
          if (perms.admin || perms.push) {
            hasPermissions = true;
          }
        }

        if (isOwner && hasPermissions) {
          // Grant full Owner access!
          const session = {
            isOwner: true,
            username: TARGET_OWNER,
            avatarUrl: userData.avatar_url,
            owner: TARGET_OWNER,
            repo: TARGET_REPO,
            branch: TARGET_BRANCH,
            pathPrefix: 'src/content/posts',
            token,
          };

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Authenticating @${TARGET_OWNER}...</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <div style="text-align: center;">
    <p style="font-size: 15px; color: #10b981; font-weight: 600;">✓ Verified Repository Owner @${TARGET_OWNER}</p>
    <p style="font-size: 12px; color: #a3a3a3;">Entering Studio for ${TARGET_OWNER}/${TARGET_REPO}...</p>
  </div>
  <script>
    const session = ${JSON.stringify(session)};
    localStorage.setItem('gh_owner_auth', JSON.stringify(session));
    localStorage.setItem('gh_config', JSON.stringify(session));
    window.location.replace('/admin');
  </script>
</body>
</html>`;

          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        } else {
          // Unauthorized user attempted to sign in
          const deniedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Access Denied — The Dispatched</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #ededed; }
    .card { max-width: 440px; padding: 2.5rem 2rem; background: #171717; border: 1px solid #262626; border-radius: 12px; text-align: center; }
    h1 { font-size: 1.25rem; font-weight: 700; color: #f43f5e; margin: 0 0 0.75rem; }
    p { font-size: 0.875rem; color: #a3a3a3; line-height: 1.6; margin: 0 0 1.5rem; }
    a { display: inline-flex; padding: 0.625rem 1.25rem; background: #fff; color: #000; border-radius: 6px; text-decoration: none; font-size: 0.8125rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Access Denied: Not Repo Owner</h1>
    <p>You authenticated as <strong>@${username}</strong>. This repository is owned by <strong>@${TARGET_OWNER}</strong> (https://github.com/${TARGET_OWNER}/${TARGET_REPO}). Only @${TARGET_OWNER} can post, edit, or delete articles.</p>
    <a href="/admin">Return to Studio</a>
  </div>
</body>
</html>`;
          return new Response(deniedHtml, {
            status: 403,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
      }
    } catch (e) {
      console.error('Error verifying GitHub owner credentials', e);
    }
  }

  // 2. If no server token, check if GitHub OAuth App credentials are configured
  const clientId =
    runtimeEnv.GITHUB_CLIENT_ID ||
    process.env.GITHUB_CLIENT_ID ||
    import.meta.env.GITHUB_CLIENT_ID;

  if (clientId) {
    const redirectUri = `${url.origin}/api/auth/callback`;
    return redirect(
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=repo&redirect_uri=${encodeURIComponent(redirectUri)}`
    );
  }

  // 3. Fallback: If no server-side token or OAuth app is configured, redirect to admin with prompt
  return redirect('/admin?needs_token=1');
};
