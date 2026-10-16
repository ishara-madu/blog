import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
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
  } catch (e) {}
  return null;
}

export const GET: APIRoute = async () => {
  try {
    const postsDir = path.join(process.cwd(), 'src/content/posts');
    const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];
    const posts = files
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const slug = f.replace(/\.md$/, '');
        return { slug, filename: f };
      });

    return new Response(JSON.stringify({ success: true, count: posts.length, posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, slug, title, markdown, token: userToken, branch: reqBranch } = body;

    const cleanSlug = (slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');

    if (!cleanSlug) {
      return new Response(JSON.stringify({ error: 'A valid article slug is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const postsDir = path.join(process.cwd(), 'src/content/posts');
    const localFilePath = path.join(postsDir, `${cleanSlug}.md`);
    const repoFilePath = `src/content/posts/${cleanSlug}.md`;
    const branch = reqBranch || TARGET_BRANCH;
    const token =
      userToken ||
      process.env.GITHUB_TOKEN ||
      import.meta.env.GITHUB_TOKEN ||
      getGitCredentialToken();

    // ----------------------------------------------------
    // ACTION: DELETE
    // ----------------------------------------------------
    if (action === 'delete') {
      let localDeleted = false;
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        localDeleted = true;
      }

      let githubDeleted = false;
      let githubMessage = '';

      if (token) {
        try {
          // 1. Check if file exists on GitHub to obtain its SHA
          const checkRes = await fetch(
            `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${repoFilePath}?ref=${branch}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `Bearer ${token}`,
                'User-Agent': 'TheDispatched-Blog-Studio',
              },
            }
          );

          if (checkRes.ok) {
            const fileData = await checkRes.json();
            const sha = fileData.sha;

            // 2. Delete file via GitHub Contents API
            const delRes = await fetch(
              `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${repoFilePath}`,
              {
                method: 'DELETE',
                headers: {
                  Accept: 'application/vnd.github.v3+json',
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'User-Agent': 'TheDispatched-Blog-Studio',
                },
                body: JSON.stringify({
                  message: `Delete article: ${cleanSlug}.md (by @${TARGET_OWNER})`,
                  sha,
                  branch,
                }),
              }
            );

            if (delRes.ok) {
              githubDeleted = true;
              githubMessage = 'Deleted from GitHub repository.';
            } else {
              const errData = await delRes.json().catch(() => ({}));
              githubMessage = errData.message || 'GitHub delete API returned non-200.';
            }
          } else if (checkRes.status === 404) {
            // Already deleted on GitHub
            githubDeleted = true;
            githubMessage = 'Already removed from GitHub repository.';
          } else {
            githubMessage = `GitHub check returned status ${checkRes.status}`;
          }
        } catch (err: any) {
          githubMessage = err.message || 'Network error syncing with GitHub';
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          slug: cleanSlug,
          localDeleted,
          githubDeleted,
          githubMessage,
          message: `Article "${cleanSlug}.md" successfully deleted.`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ----------------------------------------------------
    // ACTION: SAVE (Create or Update)
    // ----------------------------------------------------
    if (action === 'save') {
      if (!markdown || typeof markdown !== 'string') {
        return new Response(JSON.stringify({ error: 'Markdown content is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Ensure directory exists
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }

      // 1. Write to local filesystem
      fs.writeFileSync(localFilePath, markdown, 'utf-8');

      // 2. Sync to GitHub repository
      let githubCommitted = false;
      let githubMessage = '';

      if (token) {
        try {
          let sha: string | undefined;
          const checkRes = await fetch(
            `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${repoFilePath}?ref=${branch}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `Bearer ${token}`,
                'User-Agent': 'TheDispatched-Blog-Studio',
              },
            }
          );

          if (checkRes.ok) {
            const existing = await checkRes.json();
            sha = existing.sha;
          }

          const actionVerb = sha ? 'Update' : 'Publish';
          const encoded = Buffer.from(markdown, 'utf-8').toString('base64');

          const commitRes = await fetch(
            `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${repoFilePath}`,
            {
              method: 'PUT',
              headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'TheDispatched-Blog-Studio',
              },
              body: JSON.stringify({
                message: `${actionVerb} article: ${title || cleanSlug} (by @${TARGET_OWNER})`,
                content: encoded,
                branch,
                ...(sha ? { sha } : {}),
              }),
            }
          );

          if (commitRes.ok) {
            githubCommitted = true;
            githubMessage = `Successfully ${actionVerb.toLowerCase()}d to GitHub repository branch ${branch}.`;
          } else {
            const errData = await commitRes.json().catch(() => ({}));
            githubMessage = errData.message || 'GitHub commit returned non-200.';
          }
        } catch (err: any) {
          githubMessage = err.message || 'Network error syncing to GitHub';
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          slug: cleanSlug,
          localSaved: true,
          githubCommitted,
          githubMessage,
          message: `Article "${cleanSlug}.md" saved successfully.`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: `Invalid action: "${action}". Must be "delete" or "save".` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
