export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 根據 Grid Size 與傳入選項，產生剛好 N*N 個隨機選項
export function generateGridOptions(options: string[], count: number): string[] {
  if (options.length === 0) return Array(count).fill('?');
  
  let result: string[] = [];
  // 如果選項不夠，就重複補滿
  while (result.length < count) {
    result = result.concat(shuffleArray(options));
  }
  
  // 裁切成剛好 count 個並再次洗牌
  return shuffleArray(result.slice(0, count));
}
