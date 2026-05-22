export function DocsArticle({ html }: { html: string }) {
  return (
    <article className="docs-prose" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
