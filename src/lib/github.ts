/**
 * GitHub Storage API Client
 * Manages repository ownership verification, reading, writing, updating, and deleting articles.
 */

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  pathPrefix: string;
}

export interface PostPayload {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  publishedAt: string;
  readTime: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  authorHandle: string;
  authorBio: string;
  tags: string[];
  content: string;
}

export interface OwnerVerificationResult {
  isOwner: boolean;
  username: string;
  avatarUrl: string;
  repoFullName: string;
  message: string;
  permissions?: {
    admin: boolean;
    push: boolean;
  };
}

/**
 * Format article metadata and body into standard Markdown frontmatter
 */
export function formatMarkdown(payload: PostPayload): string {
  const frontmatter = `---
title: "${payload.title.replace(/"/g, '\\"')}"
excerpt: "${payload.excerpt.replace(/"/g, '\\"')}"
coverImage: "${payload.coverImage}"
coverAlt: "${payload.coverAlt.replace(/"/g, '\\"')}"
category: "${payload.category}"
categorySlug: "${payload.categorySlug}"
categoryColor: "${payload.categoryColor}"
publishedAt: "${payload.publishedAt}"
readTime: "${payload.readTime}"
author:
  name: "${payload.authorName}"
  role: "${payload.authorRole}"
  avatar: "${payload.authorAvatar}"
  handle: "${payload.authorHandle}"
  bio: "${payload.authorBio.replace(/"/g, '\\"')}"
tags:
${payload.tags.map((t) => `  - "${t.trim()}"`).join('\n')}
---

${payload.content.trim()}
`;

  return frontmatter;
}

/**
 * Verify if the authenticated user is the true Owner or Admin of the repository
 */
export async function verifyRepositoryOwner(
  owner: string,
  repo: string,
  token: string
): Promise<OwnerVerificationResult> {
  try {
    // 1. Get authenticated user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'TheDispatched-Blog-Studio',
      },
    });

    if (!userRes.ok) {
      const err = await userRes.json().catch(() => ({}));
      return {
        isOwner: false,
        username: '',
        avatarUrl: '',
        repoFullName: `${owner}/${repo}`,
        message: err.message || 'Invalid GitHub token or authentication expired.',
      };
    }

    const userData = await userRes.json();
    const authenticatedUsername = userData.login;

    // 2. Get repository details and permissions
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'TheDispatched-Blog-Studio',
      },
    });

    if (!repoRes.ok) {
      const err = await repoRes.json().catch(() => ({}));
      return {
        isOwner: false,
        username: authenticatedUsername,
        avatarUrl: userData.avatar_url,
        repoFullName: `${owner}/${repo}`,
        message: err.message || `Cannot access repository ${owner}/${repo}. Check repo name and permissions.`,
      };
    }

    const repoData = await repoRes.json();
    const repoOwner = repoData.owner?.login;
    const permissions = repoData.permissions || {};

    // Is owner if username matches repo owner login, or user has explicit admin permissions on the repo
    const isDirectOwner =
      authenticatedUsername.toLowerCase() === (repoOwner || owner).toLowerCase();
    const hasAdminRights = Boolean(permissions.admin || isDirectOwner);

    if (isDirectOwner || hasAdminRights) {
      return {
        isOwner: true,
        username: authenticatedUsername,
        avatarUrl: userData.avatar_url,
        repoFullName: repoData.full_name,
        message: `Authenticated as verified owner @${authenticatedUsername}. Full administrative rights granted.`,
        permissions: {
          admin: Boolean(permissions.admin),
          push: Boolean(permissions.push),
        },
      };
    }

    return {
      isOwner: false,
      username: authenticatedUsername,
      avatarUrl: userData.avatar_url,
      repoFullName: repoData.full_name,
      message: `Access denied: Authenticated as @${authenticatedUsername}, but this repository is owned by @${repoOwner}. Only the repository owner can publish or manage articles.`,
    };
  } catch (error: any) {
    return {
      isOwner: false,
      username: '',
      avatarUrl: '',
      repoFullName: `${owner}/${repo}`,
      message: error.message || 'Network error verifying repository ownership with GitHub.',
    };
  }
}

/**
 * Commit a new or updated Markdown file directly to GitHub storage
 */
export async function commitPostToGitHub(
  config: GitHubConfig,
  payload: PostPayload,
  commitMessage?: string
): Promise<{ success: boolean; message: string; commitUrl?: string; sha?: string }> {
  const cleanPrefix = (config.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
  const filePath = `${cleanPrefix}/${payload.slug}.md`;
  const content = formatMarkdown(payload);
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  try {
    // 1. Check if file already exists to obtain its SHA (required by GitHub for updates)
    let fileSha: string | undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'TheDispatched-Blog-Studio',
        },
      }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      fileSha = existing.sha;
    }

    // 2. Put / Commit the file
    const message = commitMessage || `${fileSha ? 'Update' : 'Publish'} article: ${payload.title}`;
    const putRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TheDispatched-Blog-Studio',
        },
        body: JSON.stringify({
          message,
          content: encodedContent,
          branch: config.branch,
          ...(fileSha ? { sha: fileSha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `Failed to commit to GitHub: ${putRes.statusText}`,
      };
    }

    const result = await putRes.json();
    return {
      success: true,
      message: `Committed ${filePath} successfully to GitHub (${config.branch} branch).`,
      commitUrl: result.commit?.html_url,
      sha: result.content?.sha,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error occurred while committing to GitHub',
    };
  }
}

/**
 * Delete a post file from GitHub storage
 */
export async function deletePostFromGitHub(
  config: GitHubConfig,
  slug: string,
  commitMessage?: string
): Promise<{ success: boolean; message: string }> {
  const cleanPrefix = (config.pathPrefix || 'src/content/posts').replace(/^\/+|\/+$/g, '');
  const filePath = `${cleanPrefix}/${slug}.md`;

  try {
    // 1. Get file SHA
    const checkRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'TheDispatched-Blog-Studio',
        },
      }
    );

    if (!checkRes.ok) {
      return {
        success: false,
        message: `File ${filePath} not found in repository.`,
      };
    }

    const fileData = await checkRes.json();
    const sha = fileData.sha;

    // 2. Delete file via GitHub Contents API
    const deleteRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TheDispatched-Blog-Studio',
        },
        body: JSON.stringify({
          message: commitMessage || `Delete article: ${slug}.md`,
          sha,
          branch: config.branch,
        }),
      }
    );

    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `Failed to delete from GitHub: ${deleteRes.statusText}`,
      };
    }

    return {
      success: true,
      message: `Successfully deleted ${filePath} from GitHub repository.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error deleting file from GitHub repository',
    };
  }
}
