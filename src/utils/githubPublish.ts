export type GitHubPublishConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  postsDir: string;
  commitMessage?: string;
};

type GitHubContentResponse = {
  sha?: string;
  message?: string;
};

export type PublishMarkdownInput = GitHubPublishConfig & {
  filePath: string;
  content: string;
};

const githubApiBase = "https://api.github.com";

const encodeBase64Utf8 = (content: string): string => {
  const bytes = new TextEncoder().encode(content);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const buildHeaders = (token: string): HeadersInit => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
});

const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, "");

export const buildRepoFilePath = (postsDir: string, fileName: string): string => {
  const normalizedDir = trimSlashes(postsDir);
  return normalizedDir ? `${normalizedDir}/${fileName}` : fileName;
};

const getExistingFileSha = async (
  config: GitHubPublishConfig,
  filePath: string
): Promise<string | null> => {
  const url = `${githubApiBase}/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${encodeURIComponent(
    config.branch
  )}`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(config.token),
  });

  if (response.status === 404) {
    return null;
  }

  const data = (await response.json()) as GitHubContentResponse;

  if (!response.ok) {
    throw new Error(data.message || "Failed to read the target file from GitHub.");
  }

  return data.sha || null;
};

export const publishMarkdownToGitHub = async ({
  token,
  owner,
  repo,
  branch,
  postsDir,
  commitMessage,
  filePath,
  content,
}: PublishMarkdownInput): Promise<void> => {
  const config: GitHubPublishConfig = {
    token,
    owner,
    repo,
    branch,
    postsDir,
    commitMessage,
  };

  const sha = await getExistingFileSha(config, filePath);
  const url = `${githubApiBase}/repos/${owner}/${repo}/contents/${filePath}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify({
      message: commitMessage?.trim() || `publish: ${filePath}`,
      content: encodeBase64Utf8(content),
      branch,
      sha: sha || undefined,
    }),
  });

  const data = (await response.json()) as GitHubContentResponse;

  if (!response.ok) {
    throw new Error(data.message || "Publishing to GitHub failed.");
  }
};
