import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import styles from "../css/WritePage.module.scss";
import { createPostFromMarkdown } from "../utils/localPosts";
import { buildRepoFilePath, publishMarkdownToGitHub, type GitHubPublishConfig } from "../utils/githubPublish";

const settingsStorageKey = "blog-github-publish-settings-v1";

type PublishSettings = GitHubPublishConfig & {
  rememberToken: boolean;
};

const today = (): string => new Date().toISOString().slice(0, 10);

const slugify = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";

const defaultSettings: PublishSettings = {
  token: "",
  owner: "giftirace",
  repo: "giftirace.github.io",
  branch: "main",
  postsDir: "posts",
  commitMessage: "",
  rememberToken: true,
};

const readStoredSettings = (): PublishSettings => {
  const raw = localStorage.getItem(settingsStorageKey);
  if (!raw) return defaultSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<PublishSettings>;
    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      owner: typeof parsed.owner === "string" && parsed.owner.trim() ? parsed.owner : defaultSettings.owner,
      repo: typeof parsed.repo === "string" && parsed.repo.trim() ? parsed.repo : defaultSettings.repo,
      branch: typeof parsed.branch === "string" && parsed.branch.trim() ? parsed.branch : "main",
      postsDir:
        typeof parsed.postsDir === "string" && parsed.postsDir.trim() ? parsed.postsDir : defaultSettings.postsDir,
      commitMessage: typeof parsed.commitMessage === "string" ? parsed.commitMessage : "",
      rememberToken: Boolean(parsed.rememberToken),
    };
  } catch {
    return defaultSettings;
  }
};

const toMarkdown = (input: {
  title: string;
  date: string;
  category: string;
  tags: string[];
  body: string;
}): string => {
  const tagsBlock = input.tags.length > 0 ? `[${input.tags.join(", ")}]` : "[]";

  return [
    "---",
    `title: ${input.title.trim()}`,
    `date: ${input.date.trim() || today()}`,
    `category: ${input.category.trim() || "Uncategorized"}`,
    `tags: ${tagsBlock}`,
    "---",
    "",
    input.body.trim(),
    "",
  ].join("\n");
};

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");
  const [body, setBody] = useState("# New Post\n\nWrite here...");
  const [fileName, setFileName] = useState(`${today()}-new-post.md`);
  const [settings, setSettings] = useState<PublishSettings>(defaultSettings);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setSettings(readStoredSettings());
  }, []);

  useEffect(() => {
    const nextSettings = settings.rememberToken ? settings : { ...settings, token: "" };
    localStorage.setItem(settingsStorageKey, JSON.stringify(nextSettings));
  }, [settings]);

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [tagsInput]
  );

  const markdown = useMemo(
    () =>
      toMarkdown({
        title: title.trim() || "Untitled",
        date,
        category,
        tags,
        body,
      }),
    [body, category, date, tags, title]
  );

  const targetPath = useMemo(
    () => buildRepoFilePath(settings.postsDir, fileName.trim() || `${today()}-${slugify(title || "post")}.md`),
    [fileName, settings.postsDir, title]
  );

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError("");
    setStatus("");

    try {
      const content = await file.text();
      const parsed = createPostFromMarkdown(file.name, content);
      setTitle(parsed.title);
      setDate(parsed.date.slice(0, 10));
      setCategory(parsed.category);
      setTagsInput(parsed.tags.join(", "));
      setBody(parsed.content);
      setFileName(file.name.toLowerCase().endsWith(".md") ? file.name : `${file.name}.md`);
      setStatus("Markdown imported. You can edit it before publishing.");
    } catch {
      setError("Failed to read the Markdown file.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const fillFileNameFromTitle = () => {
    const next = `${date || today()}-${slugify(title || "post")}.md`;
    setFileName(next);
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!body.trim()) {
      setError("Markdown content is required.");
      return;
    }

    if (!settings.token.trim() || !settings.owner.trim() || !settings.repo.trim() || !settings.branch.trim()) {
      setError("Complete the GitHub publish settings before publishing.");
      return;
    }

    setIsPublishing(true);

    try {
      await publishMarkdownToGitHub({
        token: settings.token.trim(),
        owner: settings.owner.trim(),
        repo: settings.repo.trim(),
        branch: settings.branch.trim(),
        postsDir: settings.postsDir.trim(),
        commitMessage: settings.commitMessage?.trim() || `publish: ${fileName}`,
        filePath: targetPath,
        content: markdown,
      });

      setStatus("Published to GitHub. GitHub Pages should rebuild after the commit is processed.");
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : "Publishing failed.";
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearSavedToken = () => {
    setSettings((prev) => ({ ...prev, token: "", rememberToken: false }));
    setStatus("Saved token cleared from this device.");
    setError("");
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Editor</p>
        <h1>Write or upload Markdown, then publish to GitHub</h1>
        <p className={styles.lead}>
          This page commits Markdown files into your repository so GitHub Pages can rebuild the blog automatically.
        </p>
      </section>

      <div className={styles.layout}>
        <form className={styles.editorCard} onSubmit={handlePublish}>
          <div className={styles.sectionHead}>
            <h2>Article</h2>
            <label className={styles.importButton}>
              {isImporting ? "Importing..." : "Import .md"}
              <input type="file" accept=".md,text/markdown" onChange={handleImport} disabled={isImporting} />
            </label>
          </div>

          <div className={styles.grid}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" />
            </label>

            <label>
              <span>Date</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>

            <label>
              <span>Category</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="General"
              />
            </label>

            <label>
              <span>Tags</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="react, notes, life"
              />
            </label>
          </div>

          <label>
            <span>Markdown file name</span>
            <div className={styles.inlineRow}>
              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="2026-06-02-post.md"
              />
              <button type="button" onClick={fillFileNameFromTitle}>
                Generate
              </button>
            </div>
          </label>

          <label className={styles.textareaField}>
            <span>Markdown content</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} />
          </label>

          <div className={styles.sectionHead}>
            <h2>Publish settings</h2>
          </div>

          <div className={styles.grid}>
            <label>
              <span>GitHub owner</span>
              <input
                value={settings.owner}
                onChange={(event) => setSettings((prev) => ({ ...prev, owner: event.target.value }))}
                placeholder="your-name"
              />
            </label>

            <label>
              <span>Repository</span>
              <input
                value={settings.repo}
                onChange={(event) => setSettings((prev) => ({ ...prev, repo: event.target.value }))}
                placeholder="your-blog-repo"
              />
            </label>

            <label>
              <span>Branch</span>
              <input
                value={settings.branch}
                onChange={(event) => setSettings((prev) => ({ ...prev, branch: event.target.value }))}
                placeholder="main"
              />
            </label>

            <label>
              <span>Posts directory</span>
              <input
                value={settings.postsDir}
                onChange={(event) => setSettings((prev) => ({ ...prev, postsDir: event.target.value }))}
                placeholder="blog/posts"
              />
            </label>

            <label className={styles.fullWidth}>
              <span>Commit message</span>
              <input
                value={settings.commitMessage}
                onChange={(event) => setSettings((prev) => ({ ...prev, commitMessage: event.target.value }))}
                placeholder="publish: my new post"
              />
            </label>

            <label className={styles.fullWidth}>
              <span>GitHub token</span>
              <input
                type="password"
                value={settings.token}
                onChange={(event) => setSettings((prev) => ({ ...prev, token: event.target.value }))}
                placeholder="Fine-grained PAT with contents:write"
              />
            </label>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={settings.rememberToken}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  rememberToken: event.target.checked,
                  token: event.target.checked ? prev.token : "",
                }))
              }
            />
            <span>Remember token on this device so you only enter it once</span>
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          {status ? <p className={styles.status}>{status}</p> : null}

          <div className={styles.footerRow}>
            <div>
              <strong>Publish path:</strong> <code>{targetPath}</code>
            </div>
            <div className={styles.actionRow}>
              <button type="button" className={styles.secondaryButton} onClick={handleClearSavedToken}>
                Clear saved token
              </button>
              <button type="submit" disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish to GitHub"}
              </button>
            </div>
          </div>
        </form>

        <aside className={styles.sideCard}>
          <h2>What this fixes</h2>
          <ul>
            <li>You no longer need to manually drag Markdown files into the repository.</li>
            <li>Publishing creates or updates a real file in GitHub, so GitHub Pages can rebuild the site.</li>
            <li>Imported Markdown can be edited before publishing.</li>
          </ul>

          <h2>Important note</h2>
          <ul>
            <li>The current articles page import only saves into browser localStorage and is not public publishing.</li>
            <li>Your existing `blog-api` server cannot run on GitHub Pages because Pages is static hosting only.</li>
            <li>The token can now be saved on this device so you do not need to paste it every time.</li>
            <li>For safer long-term publishing, move the token flow to a serverless function later.</li>
          </ul>

          <h2>Recommended settings</h2>
          <ul>
            <li>`Branch`: usually `main`</li>
            <li>`Repository`: `giftirace/giftirace.github.io`</li>
            <li>`Posts directory`: use `posts` with the current repository structure</li>
            <li>`Token scope`: fine-grained PAT with repository contents write permission</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
