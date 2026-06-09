import { parseMarkdownToHtml } from '@/lib/security/sanitize';
import { cn } from '@/lib/utils';

type MarkdownContentProps = {
  markdown: string;
  className?: string;
  /** ラッパー要素。見出し表示には h2 を指定 */
  as?: 'div' | 'p' | 'h2' | 'span';
};

export function MarkdownContent({
  markdown,
  className,
  as: Tag = 'div',
}: MarkdownContentProps) {
  if (!markdown) {
    return <Tag className={className} />;
  }

  return (
    <Tag
      className={cn(
        '[&_a]:text-primary [&_a]:underline [&_strong]:font-bold',
        className
      )}
      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(markdown) }}
    />
  );
}
