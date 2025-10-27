import { invokeLLM } from '../_core/llm';

/**
 * バスケットボールイベントの型定義
 */
export interface BasketballEvent {
  type: 'shot' | 'rebound' | 'assist' | 'turnover' | 'steal' | 'block' | 'foul' | 'substitution';
  timestamp: number;
  playerNumber?: number;
  teamId: string;
  xCoord?: number;
  yCoord?: number;
  success?: boolean;
  shotType?: '2P' | '3P' | 'FT';
  assistedBy?: number;
  confidence: number;
  description: string;
}

/**
 * Video Intelligence APIのデータをGemini用のテキストに変換
 */
export function formatTrackingDataForGemini(data: {
  ballTrajectory: Array<{ timestamp: number; x: number; y: number; confidence: number }>;
  playerPositions: Array<{
    entityId: string;
    frames: Array<{ timestamp: number; x: number; y: number; width: number; height: number }>;
  }>;
  textData: Array<{ timestamp: number; text: string; confidence: number }>;
  startTime: number;
  endTime: number;
}): string {
  const { ballTrajectory, playerPositions, textData, startTime, endTime } = data;

  let prompt = `以下はバスケットボール試合の動画解析データです（${startTime.toFixed(1)}秒 〜 ${endTime.toFixed(1)}秒）。\n\n`;

  // ボールの軌跡データ
  if (ballTrajectory.length > 0) {
    prompt += `【ボールの軌跡データ】\n`;
    for (const point of ballTrajectory) {
      prompt += `時刻 ${point.timestamp.toFixed(1)}s: (${point.x.toFixed(3)}, ${point.y.toFixed(3)})\n`;
    }
    prompt += `\n`;
  }

  // 選手の位置データ（最初の5人のみ）
  if (playerPositions.length > 0) {
    prompt += `【選手の位置データ】\n`;
    const topPlayers = playerPositions.slice(0, 5);
    for (const player of topPlayers) {
      const firstFrame = player.frames[0];
      const lastFrame = player.frames[player.frames.length - 1];
      prompt += `${player.entityId}: (${firstFrame.x.toFixed(3)}, ${firstFrame.y.toFixed(3)}) → (${lastFrame.x.toFixed(3)}, ${lastFrame.y.toFixed(3)})\n`;
    }
    prompt += `\n`;
  }

  // スコアボード・時計データ
  if (textData.length > 0) {
    prompt += `【スコアボード・時計データ】\n`;
    for (const text of textData) {
      prompt += `時刻 ${text.timestamp.toFixed(1)}s: "${text.text}"\n`;
    }
    prompt += `\n`;
  }

  return prompt;
}

/**
 * Gemini APIを使用してバスケットボールイベントを検出
 */
export async function analyzeBasketballEvents(
  trackingData: {
    ballTrajectory: Array<{ timestamp: number; x: number; y: number; confidence: number }>;
    playerPositions: Array<{
      entityId: string;
      frames: Array<{ timestamp: number; x: number; y: number; width: number; height: number }>;
    }>;
    textData: Array<{ timestamp: number; text: string; confidence: number }>;
    startTime: number;
    endTime: number;
  },
  homeTeamId: string,
  awayTeamId: string
): Promise<BasketballEvent[]> {
  const dataText = formatTrackingDataForGemini(trackingData);

  const systemPrompt = `あなたはバスケットボール試合の動画解析AIです。
動画追跡データから以下のイベントを検出してください：

1. **ショット試行（shot）**
   - ボールの放物線軌道を検出
   - シューターを特定（ボールに最も近い選手）
   - ショットタイプを判定（2P/3P）
   - 成功/失敗を判定（スコア変化 + ボール消失位置）

2. **リバウンド（rebound）**
   - ショット失敗後のボール争奪を検出
   - リバウンドを取った選手を特定

3. **アシスト（assist）**
   - パス → ショットの連続性を検出
   - パスした選手を特定

4. **スティール（steal）**
   - ボールの急激な移動を検出
   - スティールした選手を特定

5. **ターンオーバー（turnover）**
   - ボールの所持チーム変更を検出

出力形式：JSON配列
[
  {
    "type": "shot",
    "timestamp": 1.5,
    "playerNumber": 10,
    "teamId": "${homeTeamId}",
    "xCoord": 0.8,
    "yCoord": 0.3,
    "success": true,
    "shotType": "3P",
    "confidence": 0.92,
    "description": "#10が3ポイントシュートを成功"
  }
]

重要な注意事項：
- timestamp は秒単位の小数
- xCoord, yCoord は 0.0〜1.0 の正規化座標
- confidence は 0.0〜1.0 の信頼度スコア
- 確実なイベントのみを出力（confidence >= 0.7）
- 選手番号が不明な場合は playerNumber を省略
`;

  const userPrompt = `${dataText}

【分析タスク】
上記のデータから、バスケットボールイベントを検出してJSON形式で出力してください。
ホームチームID: ${homeTeamId}
アウェイチームID: ${awayTeamId}
`;

  console.log('[EventAnalyzer] Analyzing events with Gemini API...');

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'basketball_events',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['shot', 'rebound', 'assist', 'turnover', 'steal', 'block', 'foul', 'substitution'],
                  },
                  timestamp: { type: 'number' },
                  playerNumber: { type: 'number' },
                  teamId: { type: 'string' },
                  xCoord: { type: 'number' },
                  yCoord: { type: 'number' },
                  success: { type: 'boolean' },
                  shotType: { type: 'string', enum: ['2P', '3P', 'FT'] },
                  assistedBy: { type: 'number' },
                  confidence: { type: 'number' },
                  description: { type: 'string' },
                },
                required: ['type', 'timestamp', 'teamId', 'confidence', 'description'],
                additionalProperties: false,
              },
            },
          },
          required: ['events'],
          additionalProperties: false,
        },
      },
    },
  });

  console.log('[EventAnalyzer] Gemini API response received');

  // レスポンスをパース
  const content = response.choices[0].message.content;
  if (!content) {
    console.warn('[EventAnalyzer] No content in Gemini response');
    return [];
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  const result = JSON.parse(contentText);
  const events: BasketballEvent[] = result.events || [];

  console.log(`[EventAnalyzer] Detected ${events.length} events`);

  return events;
}

/**
 * キーフレームを抽出すべきタイムスタンプを決定
 */
export function identifyKeyFrameTimestamps(
  ballTrajectory: Array<{ timestamp: number; x: number; y: number }>,
  textData: Array<{ timestamp: number; text: string }>
): Array<{
  timestamp: number;
  frameType: 'shot_attempt' | 'score_change' | 'ball_possession_change' | 'period_start' | 'period_end';
  reason: string;
}> {
  const keyFrames: Array<{
    timestamp: number;
    frameType: 'shot_attempt' | 'score_change' | 'ball_possession_change' | 'period_start' | 'period_end';
    reason: string;
  }> = [];

  // ボールの軌跡から放物線を検出（ショット試行の可能性）
  for (let i = 2; i < ballTrajectory.length - 2; i++) {
    const prev = ballTrajectory[i - 1];
    const curr = ballTrajectory[i];
    const next = ballTrajectory[i + 1];

    // Y座標が上昇→下降のパターン（放物線）
    if (prev.y > curr.y && next.y > curr.y) {
      keyFrames.push({
        timestamp: curr.timestamp,
        frameType: 'shot_attempt',
        reason: 'ボールの放物線軌道を検出',
      });
    }
  }

  // スコアボードのテキスト変化を検出
  let prevScore = '';
  for (const text of textData) {
    if (text.text !== prevScore && /\d+/.test(text.text)) {
      keyFrames.push({
        timestamp: text.timestamp,
        frameType: 'score_change',
        reason: `スコア変化: ${prevScore} → ${text.text}`,
      });
      prevScore = text.text;
    }
  }

  // タイムスタンプでソート
  keyFrames.sort((a, b) => a.timestamp - b.timestamp);

  // 重複を削除（1秒以内のキーフレームは統合）
  const uniqueKeyFrames: typeof keyFrames = [];
  for (const frame of keyFrames) {
    const isDuplicate = uniqueKeyFrames.some(
      (existing) => Math.abs(existing.timestamp - frame.timestamp) < 1.0
    );
    if (!isDuplicate) {
      uniqueKeyFrames.push(frame);
    }
  }

  return uniqueKeyFrames;
}

/**
 * イベントデータを時系列でグループ化（セグメント分割）
 */
export function segmentTrackingData(
  ballTrajectory: Array<{ timestamp: number; x: number; y: number; confidence: number }>,
  playerPositions: Array<{
    entityId: string;
    frames: Array<{ timestamp: number; x: number; y: number; width: number; height: number }>;
  }>,
  textData: Array<{ timestamp: number; text: string; confidence: number }>,
  segmentDuration: number = 10.0 // 10秒ごとにセグメント分割
): Array<{
  startTime: number;
  endTime: number;
  ballTrajectory: typeof ballTrajectory;
  playerPositions: typeof playerPositions;
  textData: typeof textData;
}> {
  if (ballTrajectory.length === 0) {
    return [];
  }

  const minTime = Math.min(...ballTrajectory.map((p) => p.timestamp));
  const maxTime = Math.max(...ballTrajectory.map((p) => p.timestamp));

  const segments: Array<{
    startTime: number;
    endTime: number;
    ballTrajectory: typeof ballTrajectory;
    playerPositions: typeof playerPositions;
    textData: typeof textData;
  }> = [];

  for (let start = minTime; start < maxTime; start += segmentDuration) {
    const end = Math.min(start + segmentDuration, maxTime);

    const segmentBall = ballTrajectory.filter(
      (p) => p.timestamp >= start && p.timestamp < end
    );

    const segmentPlayers = playerPositions.map((player) => ({
      entityId: player.entityId,
      frames: player.frames.filter((f) => f.timestamp >= start && f.timestamp < end),
    })).filter((p) => p.frames.length > 0);

    const segmentText = textData.filter(
      (t) => t.timestamp >= start && t.timestamp < end
    );

    if (segmentBall.length > 0 || segmentPlayers.length > 0) {
      segments.push({
        startTime: start,
        endTime: end,
        ballTrajectory: segmentBall,
        playerPositions: segmentPlayers,
        textData: segmentText,
      });
    }
  }

  return segments;
}

