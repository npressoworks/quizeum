import { readFileSync } from 'fs';
import { join } from 'path';

describe('firestore.rules announcements protection', () => {
  const rules = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8');

  it('announcements コレクションのルールが定義されていること', () => {
    expect(rules).toContain('match /announcements/{announcementId}');
  });

  it('読み取りルールが適切に設定されていること', () => {
    // published または admin のみ読み取り可
    expect(rules).toMatch(/allow read: if resource == null\s*\|\| resource\.data\.status == 'published'\s*\|\| isSystemAdmin\(\)/);
  });

  it('書き込みルールが管理者に制限されていること', () => {
    expect(rules).toMatch(/allow write: if isSystemAdmin\(\)/);
  });
});
