import ReactMarkdown from 'react-markdown';

// Renders markdown (bio, abstracts…) as styled HTML. react-markdown does not
// pass through raw HTML, so CMS content can't inject scripts into the site.
export default function RichText({ text, className = '' }) {
  if (!text) return null;
  return <div className={`rich-text ${className}`.trim()}><ReactMarkdown>{text}</ReactMarkdown></div>;
}
