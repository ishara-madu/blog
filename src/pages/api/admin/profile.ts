import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const TARGET_OWNER = 'ishara-madu';
const TARGET_REPO = 'blog';
const TARGET_BRANCH = 'main';

function getAuthorsData(): Record<string, any> {
  const authorsFilePath = path.join(process.cwd(), 'src/data/authors.json');
  if (fs.existsSync(authorsFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(authorsFilePath, 'utf-8'));
    } catch (e) {}
  }
  return {};
}

export const GET: APIRoute = async () => {
  try {
    const authors = getAuthorsData();
    return new Response(JSON.stringify({ success: true, authors }), {
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
    const { id, name, role, handle, avatar, followUrl, bio, token, action } = body;

    const authorId = (id || 'ishara').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!authorId) {
      return new Response(JSON.stringify({ error: 'Valid author ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentAuthors = getAuthorsData();
    const authorsFilePath = path.join(process.cwd(), 'src/data/authors.json');

    if (action === 'delete') {
      if (authorId === 'ishara') {
        return new Response(
          JSON.stringify({ error: 'The primary owner profile (@ishara-madu) cannot be deleted.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      if (!currentAuthors[authorId]) {
        return new Response(JSON.stringify({ error: 'Author profile not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      delete currentAuthors[authorId];
    } else {
      if (!name) {
        return new Response(JSON.stringify({ error: 'Author Name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      currentAuthors[authorId] = {
        name,
        role: role || 'Author & Contributor',
        avatar: avatar || '/images/authors/author-ishara.jpg',
        handle: handle || `@${authorId}`,
        followUrl: followUrl || `https://github.com/${(handle || authorId).replace('@', '')}`,
        bio: bio || '',
      };
    }

    const updatedJsonString = JSON.stringify(currentAuthors, null, 2);
    fs.writeFileSync(authorsFilePath, updatedJsonString, 'utf-8');

    // 2. If token is present, commit to GitHub repository storage
    let githubCommitted = false;
    let githubMessage = '';

    if (token) {
      const filePath = 'src/data/authors.json';
      try {
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
        const commitMsg =
          action === 'delete'
            ? `Delete author profile (${authorId})`
            : `Update author profile: ${name} (${authorId})`;

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
              message: commitMsg,
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
        authorId,
        author: currentAuthors[authorId] || null,
        authors: currentAuthors,
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
