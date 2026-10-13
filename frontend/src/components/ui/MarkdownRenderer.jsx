import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import FlipCard from '../interactive/FlipCard';

/**
 * MarkdownRenderer — renders lesson Markdown with support for custom
 * interactive components embedded as HTML tags.
 *
 * Supported custom tags:
 *   <flipcard front="..." back="..." image="..."></flipcard>
 *
 * Pass allowHtml={false} for untrusted content (e.g. AI output) so raw HTML
 * is never rendered.
 */
export default function MarkdownRenderer({ content, allowHtml = true }) {
  if (!content) return null;

  return (
    <div className="markdown-content">
      <Markdown
        rehypePlugins={allowHtml ? [rehypeRaw] : []}
        components={{
          // Map the custom <flipcard> HTML tag to the React FlipCard component
          flipcard: ({ node, ...props }) => {
            const front = props.front || '';
            const back = props.back || '';
            const image = props.image || '';
            return (
              <FlipCard
                frontText={front}
                backText={back}
                image={image || undefined}
              />
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
