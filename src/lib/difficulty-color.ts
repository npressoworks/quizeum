/**
 * 難易度（1〜10）の値から、対応するHSLカラーコードを算出します。
 * 難易度1〜3は緑、難易度4〜7は黄色からオレンジ、難易度8〜10は赤へと滑らかに変化します。
 *
 * @param difficulty 難易度数値（1〜10）
 * @returns HSLカラーコード文字列（例：'hsl(120, 100%, 45%)'）
 */
export function getDifficultyColor(difficulty: number): string {
  // 1未満の入力は難易度1として補正
  const safeDifficulty = Math.max(1, difficulty);
  
  // 難易度1のとき Hue=120(緑)、難易度10のとき Hue=3(赤)
  const hue = Math.max(0, 120 - (safeDifficulty - 1) * 13);
  
  return `hsl(${hue}, 100%, 45%)`;
}
