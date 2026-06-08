import { markdownToPlainText } from '@/lib/markdown-typewriter';
import {
  buildQuickPressReservedTokens,
  parseMarkdownToQuickPressTokens,
  parseQuickPressStreamLayoutLine,
  parseQuickPressStreamLine,
  serializeQuickPressStreamLayout,
  serializeQuickPressStreamToken,
} from '@/lib/quick-press-plain-text';

describe('parseMarkdownToQuickPressTokens', () => {
  it('matches markdownToPlainText and marks bold segments', () => {
    const markdown = '**早押し**テスト';
    const tokens = parseMarkdownToQuickPressTokens(markdown);
    expect(tokens.map((t) => t.char).join('')).toBe(markdownToPlainText(markdown));
    expect(tokens.filter((t) => t.bold).map((t) => t.char).join('')).toBe('早押し');
  });

  it('strips link syntax and keeps label text', () => {
    const tokens = parseMarkdownToQuickPressTokens('[公式](https://example.com)');
    expect(tokens.map((t) => t.char).join('')).toBe('公式');
    expect(tokens.every((t) => !t.bold)).toBe(true);
  });

  it('converts newlines to spaces', () => {
    const tokens = parseMarkdownToQuickPressTokens('A\nB');
    expect(tokens.map((t) => t.char).join('')).toBe('A B');
  });
});

describe('quick-press stream line', () => {
  it('round-trips a token', () => {
    const token = { char: '字', bold: true };
    const line = serializeQuickPressStreamToken(token);
    expect(parseQuickPressStreamLine(line)).toEqual(token);
  });

  it('parses layout preamble', () => {
    const bodyTokens = parseMarkdownToQuickPressTokens('A\nB');
    const line = serializeQuickPressStreamLayout(bodyTokens);
    expect(parseQuickPressStreamLayoutLine(line)?.tokens).toEqual(bodyTokens);
  });

  it('builds reserved tokens with label prefix', () => {
    const bodyTokens = parseMarkdownToQuickPressTokens('本文');
    const reserved = buildQuickPressReservedTokens(bodyTokens);
    expect(reserved.slice(0, 3).map((t) => t.char).join('')).toBe('問題：');
    expect(reserved.slice(3)).toEqual(bodyTokens);
  });
});
