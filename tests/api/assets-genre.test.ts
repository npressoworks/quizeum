import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// テスト対象APIの遅延ロード
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/assets/genre/[...path]/route') as typeof import('@/app/api/assets/genre/[...path]/route');

const TEST_ASSETS_DIR = path.join(process.cwd(), 'assets', 'genre');
const TEST_FILE_PATH = path.join(TEST_ASSETS_DIR, 'test-genre', 'icon.png');

describe('Assets Genre API Route', () => {
  beforeAll(() => {
    // テスト用のディレクトリとファイルを準備
    fs.mkdirSync(path.dirname(TEST_FILE_PATH), { recursive: true });
    fs.writeFileSync(TEST_FILE_PATH, 'dummy image content');
  });

  afterAll(() => {
    // テスト用ファイルのクレンジング
    try {
      if (fs.existsSync(TEST_FILE_PATH)) {
        fs.unlinkSync(TEST_FILE_PATH);
      }
      const testGenreDir = path.dirname(TEST_FILE_PATH);
      if (fs.existsSync(testGenreDir)) {
        fs.rmdirSync(testGenreDir);
      }
    } catch (err) {
      console.error('テストファイルのクレンジングに失敗しました:', err);
    }
  });

  function buildRequest(pathParams: string[]): NextRequest {
    const url = `http://localhost/api/assets/genre/${pathParams.join('/')}`;
    return new NextRequest(url);
  }

  test('正常系: 存在するファイルを指定した場合、200 OK と画像バイナリを返すこと', async () => {
    const req = buildRequest(['test-genre', 'icon.png']);
    // Next.js App RouterのGETは、第二引数に { params: Promise<{ path: string[] }> } などを取る
    const res = await GET(req, { params: Promise.resolve({ path: ['test-genre', 'icon.png'] }) });

    expect(res.status).toBe(200);
    const content = await res.text();
    expect(content).toBe('dummy image content');
    expect(res.headers.get('Content-Type')).toBe('image/png');
  });

  test('異常系: ディレクトリトラバーサル攻撃を含む不正なパスの場合は 400 Bad Request を返すこと', async () => {
    const req = buildRequest(['..', '..', 'package.json']);
    const res = await GET(req, { params: Promise.resolve({ path: ['..', '..', 'package.json'] }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('bad-request');
  });

  test('異常系: 存在しないファイルを指定した場合は 404 Not Found を返すこと', async () => {
    const req = buildRequest(['test-genre', 'not-found-icon.png']);
    const res = await GET(req, { params: Promise.resolve({ path: ['test-genre', 'not-found-icon.png'] }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('not-found');
  });
});
