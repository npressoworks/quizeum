import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * ローカルジャンル画像アセット配信API
 * GET /api/assets/genre/[...path]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const pathParams = resolvedParams?.path;

    if (!pathParams || !Array.isArray(pathParams) || pathParams.length === 0) {
      return NextResponse.json(
        { error: 'bad-request', message: 'パスパラメータが指定されていません。' },
        { status: 400 }
      );
    }

    const baseDir = path.join(process.cwd(), 'assets', 'genre');
    const resolvedPath = path.join(baseDir, ...pathParams);

    // ディレクトリトラバーサル防止のセキュリティガード (SEC-08 準拠の入力サニタイズ)
    // 解決された絶対パスがベースディレクトリの配下にあるかを確認
    if (!resolvedPath.startsWith(baseDir)) {
      return NextResponse.json(
        { error: 'bad-request', message: '不正なアセットパスです。' },
        { status: 400 }
      );
    }

    // パラメータそのものにトラバーサル用の記号が含まれていないか二重検証
    const hasTraversal = pathParams.some(
      (segment) =>
        segment.includes('..') ||
        segment.includes('/') ||
        segment.includes('\\')
    );
    if (hasTraversal) {
      return NextResponse.json(
        { error: 'bad-request', message: '不正な文字が含まれています。' },
        { status: 400 }
      );
    }

    // ファイル存在検証
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: 'not-found', message: '指定された画像アセットが存在しません。' },
        { status: 404 }
      );
    }

    // 拡張子に応じた適切な Content-Type 設定
    const ext = path.extname(resolvedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }

    // ファイルデータの読み込みとバイナリ返却
    const fileBuffer = fs.readFileSync(resolvedPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('[API/assets/genre] 配信エラー:', error);
    return NextResponse.json(
      { error: 'internal-error', message: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}
