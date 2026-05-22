import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { getDocBySlug, type DocEntry } from '@/lib/docs-manifest';

export {
  DOC_ENTRIES,
  getAllDocSlugs,
  getDocBySlug,
  getDocGroupLabel,
  getDocsByGroup,
  type DocEntry,
  type DocGroup,
} from '@/lib/docs-manifest';

const DOCS_DIR = join(process.cwd(), 'docs');

function filenameToSlug(filename: string): string {
  const base = filename.replace(/\.md$/i, '');
  if (base === 'README') return 'index';
  return base.toLowerCase().replace(/_/g, '-');
}

function rewriteDocLinks(html: string): string {
  return html.replace(/href="([^"]*?)"/g, (match, href: string) => {
    if (!href.endsWith('.md')) return match;
    const name = href.split('/').pop()?.replace(/\.md$/i, '') ?? '';
    const slug = filenameToSlug(`${name}.md`);
    const path = slug === 'index' ? '/docs' : `/docs/${slug}`;
    return `href="${path}"`;
  });
}

export function markdownToHtml(markdown: string): string {
  const html = marked.parse(markdown, {
    gfm: true,
    async: false,
  }) as string;
  return rewriteDocLinks(html);
}

export function readDocMarkdown(entry: DocEntry): string {
  const path = join(DOCS_DIR, entry.filename);
  if (!existsSync(path)) {
    throw new Error(`Missing doc file: ${entry.filename}`);
  }
  return readFileSync(path, 'utf8');
}

export function getDocHtml(slug: string): { entry: DocEntry; html: string } | null {
  const entry = getDocBySlug(slug);
  if (!entry) return null;
  const markdown = readDocMarkdown(entry);
  return { entry, html: markdownToHtml(markdown) };
}
