import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const TARGET_OWNER = 'ishara-madu';
const TARGET_REPO = 'blog';
const TARGET_BRANCH = 'main';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, role, handle, avatar, bio, token } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Update local src/data/authors.json
    const authorsFilePath = path.join(process.cwd(), 'src/data/authors.json');
    let currentAuthors: Record<string, any> = {};

    if (fs.existsSync(authorsFilePath)) {
      try {
        currentAuthors = JSON.parse(fs.readFileSync(authorsFilePath, 'utf-8'));
      } catch (e) {}
    }

    currentAuthors.ishara = {
      name,
      role: role || 'Lead Publisher & Systems Architect',
      avatar: avatar || '/images/authors/author-ishara.jpg',
      handle: handle || '@ishara-madu',
      bio: bio || '',
    };

    const updatedJsonString = JSON.stringify(currentAuthors, null, 2);
    fs.writeFileSync(authorsFilePath, updatedJsonString, 'utf-8');

    // 2. If token is present, commit to GitHub repository storage
    let githubCommitted = false;
    let githubMessage = '';

    if (token) {
      const filePath = 'src/data/authors.json';
      try {
        // Get file SHA
        let sha: string | undefined;
        const checkRes = await fetch(
          `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${filePath}?ref=${TARGET_BRANCH}`,
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
          sha = fileData.sha;
        }

        const encoded = Buffer.from(updatedJsonString, 'utf-8').toString('base64');
        const commitRes = await fetch(
          `https://api.github.com/repos/${TARGET_OWNER}/${TARGET_REPO}/contents/${filePath}`,
          {
            method: 'PUT',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'User-Agent': 'TheDispatched-Blog-Studio',
            },
            body: JSON.stringify({
              message: `Update admin author profile (@${handle || TARGET_OWNER})`,
              content: encoded,
              branch: TARGET_BRANCH,
              ...(sha ? { sha } : {}),
            }),
          }
        );

        if (commitRes.ok) {
          githubCommitted = true;
          githubMessage = 'Committed to GitHub storage successfully.';
        } else {
          const err = await commitRes.json().catch(() => ({}));
          githubMessage = err.message || 'GitHub commit returned non-200';
        }
      } catch (err: any) {
        githubMessage = err.message || 'Error committing to GitHub';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        author: currentAuthors.ishara,
        githubCommitted,
        githubMessage,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
