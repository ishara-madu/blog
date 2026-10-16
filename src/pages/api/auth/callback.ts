import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  if (error || !code) {
    return redirect(
      `/admin?error=${encodeURIComponent(errorDesc || 'GitHub authorization was cancelled or failed.')}`
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID || import.meta.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || import.meta.env.GITHUB_CLIENT_SECRET;
  const configuredOwner = (process.env.GITHUB_OWNER || import.meta.env.GITHUB_OWNER || '').trim();
  const configuredRepo = (process.env.GITHUB_REPO || import.meta.env.GITHUB_REPO || 'blog').trim();
  const configuredBranch = (process.env.GITHUB_BRANCH || import.meta.env.GITHUB_BRANCH || 'main').trim();

  if (!clientId || !clientSecret) {
    return redirect('/admin?error=Missing+GitHub+OAuth+App+credentials+in+.env');
  }

  try {
    // 1. Exchange OAuth code for an access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'TheDispatched-Blog-Studio',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      return redirect(
        `/admin?error=${encodeURIComponent(tokenData.error_description || 'Failed to exchange OAuth token with GitHub')}`
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'TheDispatched-Blog-Studio',
      },
    });

    if (!userRes.ok) {
      return redirect('/admin?error=Failed+to+fetch+authenticated+user+profile+from+GitHub');
    }

    const userData = await userRes.json();
    const authenticatedUsername = userData.login;

    // 3. STRICT OWNER VERIFICATION
    let isOwner = false;
    let repoOwnerName = configuredOwner || authenticatedUsername;

    if (configuredOwner) {
      // Check if username matches configured owner
      if (authenticatedUsername.toLowerCase() === configuredOwner.toLowerCase()) {
        isOwner = true;
      } else {
        // Check if user has admin permissions on the repository
        const repoRes = await fetch(`https://api.github.com/repos/${configuredOwner}/${configuredRepo}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'TheDispatched-Blog-Studio',
          },
        });

        if (repoRes.ok) {
          const repoData = await repoRes.json();
          repoOwnerName = repoData.owner?.login || configuredOwner;
          const permissions = repoData.permissions || {};
          if (
            authenticatedUsername.toLowerCase() === repoOwnerName.toLowerCase() ||
            permissions.admin === true
          ) {
            isOwner = true;
          }
        }
      }
    } else {
      // If GITHUB_OWNER wasn't explicitly configured in .env, check against user's own repo
      isOwner = true;
      repoOwnerName = authenticatedUsername;
    }

    // IF NOT THE OWNER: STRICT ACCESS DENIAL
    if (!isOwner) {
      const deniedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied — The Dispatched</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0a0a0a;
      color: #ededed;
      padding: 1rem;
    }
    .card {
      max-width: 440px;
      padding: 2.5rem 2rem;
      background: #171717;
      border: 1px solid #262626;
      border-radius: 12px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      color: #f43f5e;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.75rem;
    }
    p {
      font-size: 0.875rem;
      color: #a3a3a3;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }
    .highlight {
      color: #ffffff;
      font-family: monospace;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.625rem 1.25rem;
      background: #ffffff;
      color: #0a0a0a;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    a:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Strict Security Gate</div>
    <h1>Access Denied: Not Repo Owner</h1>
    <p>
      You logged in as <span class="highlight">@${authenticatedUsername}</span>.<br><br>
      This blog repository belongs to <span class="highlight">@${repoOwnerName}</span>. Creating, editing, and deleting articles is strictly permitted for the verified repository owner only.
    </p>
    <a href="/admin">Return to Studio</a>
  </div>
</body>
</html>`;

      return new Response(deniedHtml, {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // IF VERIFIED OWNER: SAVE SESSION AND REDIRECT
    const session = {
      isOwner: true,
      username: authenticatedUsername,
      avatarUrl: userData.avatar_url,
      owner: repoOwnerName,
      repo: configuredRepo,
      branch: configuredBranch,
      pathPrefix: 'src/content/posts',
      token: accessToken,
    };

    const successHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Owner Authenticated — The Dispatched</title>
</head>
<body style="font-family: sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <p style="font-size: 14px; color: #10b981;">✓ Verified Owner @${authenticatedUsername}. Entering Studio...</p>
  <script>
    localStorage.setItem('gh_owner_auth', ${JSON.stringify(JSON.stringify(session))});
    localStorage.setItem('gh_config', ${JSON.stringify(JSON.stringify(session))});
    window.location.href = '/admin';
  </script>
</body>
</html>`;

    return new Response(successHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    return redirect(`/admin?error=${encodeURIComponent(err.message || 'OAuth network error')}`);
  }
};
