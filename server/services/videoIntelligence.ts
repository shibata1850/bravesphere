import { VideoIntelligenceServiceClient, protos } from '@google-cloud/video-intelligence';
import { Storage } from '@google-cloud/storage';

type Feature = protos.google.cloud.videointelligence.v1.Feature;
import { ENV } from '../_core/env';

/**
 * Google Cloud Video Intelligence API クライアント
 */
let videoClient: VideoIntelligenceServiceClient | null = null;
let storageClient: Storage | null = null;

/**
 * Video Intelligence APIクライアントの初期化
 */
function getVideoClient(): VideoIntelligenceServiceClient {
  if (!videoClient) {
    if (!ENV.googleCloudCredentials) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
    }

    const credentials = JSON.parse(ENV.googleCloudCredentials);
    videoClient = new VideoIntelligenceServiceClient({
      credentials,
      projectId: ENV.googleCloudProjectId,
    });
  }
  return videoClient;
}

/**
 * Cloud Storageクライアントの初期化
 */
function getStorageClient(): Storage {
  if (!storageClient) {
    if (!ENV.googleCloudCredentials) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
    }

    const credentials = JSON.parse(ENV.googleCloudCredentials);
    storageClient = new Storage({
      credentials,
      projectId: ENV.googleCloudProjectId,
    });
  }
  return storageClient;
}

/**
 * 動画をCloud Storageにアップロード
 */
export async function uploadVideoToGCS(
  localPath: string,
  gcsPath: string
): Promise<string> {
  const storage = getStorageClient();
  const bucket = storage.bucket(ENV.googleCloudStorageBucket);
  
  await bucket.upload(localPath, {
    destination: gcsPath,
    metadata: {
      contentType: 'video/mp4',
    },
  });

  return `gs://${ENV.googleCloudStorageBucket}/${gcsPath}`;
}

/**
 * オブジェクト追跡（ボール、選手の位置を追跡）
 */
export async function trackObjects(videoUri: string) {
  const client = getVideoClient();

  console.log('[VideoIntelligence] Starting object tracking for:', videoUri);

  const [operation] = await client.annotateVideo({
    inputUri: videoUri,
    features: [1 as Feature], // OBJECT_TRACKING
    videoContext: {
      objectTrackingConfig: {
        model: 'builtin/latest',
      },
    },
  });

  console.log('[VideoIntelligence] Object tracking operation started');

  // 処理完了を待つ
  const [result] = await operation.promise();
  
  console.log('[VideoIntelligence] Object tracking completed');

  return result;
}

/**
 * テキスト検出（スコアボード、ゲームクロックの読み取り）
 */
export async function detectText(videoUri: string) {
  const client = getVideoClient();

  console.log('[VideoIntelligence] Starting text detection for:', videoUri);

  const [operation] = await client.annotateVideo({
    inputUri: videoUri,
    features: [2 as Feature], // TEXT_DETECTION
  });

  console.log('[VideoIntelligence] Text detection operation started');

  const [result] = await operation.promise();
  
  console.log('[VideoIntelligence] Text detection completed');

  return result;
}

/**
 * ショット検出（シーン変更の検出）
 */
export async function detectShots(videoUri: string) {
  const client = getVideoClient();

  console.log('[VideoIntelligence] Starting shot detection for:', videoUri);

  const [operation] = await client.annotateVideo({
    inputUri: videoUri,
    features: [5 as Feature], // SHOT_CHANGE_DETECTION
  });

  console.log('[VideoIntelligence] Shot detection operation started');

  const [result] = await operation.promise();
  
  console.log('[VideoIntelligence] Shot detection completed');

  return result;
}

/**
 * ラベル検出（「バスケットボール」「ゴール」などのラベル）
 */
export async function detectLabels(videoUri: string) {
  const client = getVideoClient();

  console.log('[VideoIntelligence] Starting label detection for:', videoUri);

  const [operation] = await client.annotateVideo({
    inputUri: videoUri,
    features: [3 as Feature], // LABEL_DETECTION
    videoContext: {
      labelDetectionConfig: {
        labelDetectionMode: 'SHOT_AND_FRAME_MODE',
      },
    },
  });

  console.log('[VideoIntelligence] Label detection operation started');

  const [result] = await operation.promise();
  
  console.log('[VideoIntelligence] Label detection completed');

  return result;
}

/**
 * 全ての解析を一度に実行
 */
export async function analyzeVideo(videoUri: string) {
  const client = getVideoClient();

  console.log('[VideoIntelligence] Starting comprehensive video analysis for:', videoUri);

  const [operation] = await client.annotateVideo({
    inputUri: videoUri,
    features: [
      1 as Feature, // OBJECT_TRACKING
      2 as Feature, // TEXT_DETECTION
      5 as Feature, // SHOT_CHANGE_DETECTION
      3 as Feature, // LABEL_DETECTION
    ],
    videoContext: {
      objectTrackingConfig: {
        model: 'builtin/latest',
      },
      labelDetectionConfig: {
        labelDetectionMode: 'SHOT_AND_FRAME_MODE',
      },
    },
  });

  console.log('[VideoIntelligence] Comprehensive analysis operation started');
  console.log('[VideoIntelligence] Operation name:', operation.name);

  // 処理完了を待つ（長時間かかる可能性がある）
  const [result] = await operation.promise();
  
  console.log('[VideoIntelligence] Comprehensive analysis completed');

  return {
    operationName: operation.name,
    result,
  };
}

/**
 * 解析結果からボールの軌跡データを抽出
 */
export function extractBallTrajectory(result: any): Array<{
  timestamp: number;
  x: number;
  y: number;
  confidence: number;
}> {
  const trajectory: Array<{
    timestamp: number;
    x: number;
    y: number;
    confidence: number;
  }> = [];

  if (!result.annotationResults || !result.annotationResults[0]) {
    return trajectory;
  }

  const annotations = result.annotationResults[0];
  const objectAnnotations = annotations.objectAnnotations || [];

  // "basketball" または "ball" というエンティティを探す
  for (const obj of objectAnnotations) {
    const entityDescription = obj.entity?.description?.toLowerCase() || '';
    
    if (entityDescription.includes('basketball') || entityDescription.includes('ball')) {
      // フレームごとの位置を抽出
      for (const frame of obj.frames || []) {
        const box = frame.normalizedBoundingBox;
        if (box) {
          // バウンディングボックスの中心を計算
          const x = (box.left + box.right) / 2;
          const y = (box.top + box.bottom) / 2;
          
          // タイムスタンプを秒に変換
          const timestamp = parseFloat(frame.timeOffset?.seconds || '0') + 
                          (parseFloat(frame.timeOffset?.nanos || '0') / 1e9);

          trajectory.push({
            timestamp,
            x,
            y,
            confidence: obj.confidence || 0,
          });
        }
      }
    }
  }

  return trajectory;
}

/**
 * 解析結果から選手の位置データを抽出
 */
export function extractPlayerPositions(result: any): Array<{
  entityId: string;
  frames: Array<{
    timestamp: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}> {
  const players: Array<{
    entityId: string;
    frames: Array<{
      timestamp: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  }> = [];

  if (!result.annotationResults || !result.annotationResults[0]) {
    return players;
  }

  const annotations = result.annotationResults[0];
  const objectAnnotations = annotations.objectAnnotations || [];

  // "person" というエンティティを探す
  for (const obj of objectAnnotations) {
    const entityDescription = obj.entity?.description?.toLowerCase() || '';
    
    if (entityDescription.includes('person') || entityDescription.includes('player')) {
      const frames: Array<{
        timestamp: number;
        x: number;
        y: number;
        width: number;
        height: number;
      }> = [];

      for (const frame of obj.frames || []) {
        const box = frame.normalizedBoundingBox;
        if (box) {
          const timestamp = parseFloat(frame.timeOffset?.seconds || '0') + 
                          (parseFloat(frame.timeOffset?.nanos || '0') / 1e9);

          frames.push({
            timestamp,
            x: (box.left + box.right) / 2,
            y: (box.top + box.bottom) / 2,
            width: box.right - box.left,
            height: box.bottom - box.top,
          });
        }
      }

      if (frames.length > 0) {
        players.push({
          entityId: obj.entity?.entityId || `player_${players.length}`,
          frames,
        });
      }
    }
  }

  return players;
}

/**
 * 解析結果からテキスト（スコアボード、時計）を抽出
 */
export function extractTextData(result: any): Array<{
  timestamp: number;
  text: string;
  confidence: number;
}> {
  const textData: Array<{
    timestamp: number;
    text: string;
    confidence: number;
  }> = [];

  if (!result.annotationResults || !result.annotationResults[0]) {
    return textData;
  }

  const annotations = result.annotationResults[0];
  const textAnnotations = annotations.textAnnotations || [];

  for (const textAnnotation of textAnnotations) {
    const text = textAnnotation.text || '';
    
    for (const segment of textAnnotation.segments || []) {
      const startTime = parseFloat(segment.segment?.startTimeOffset?.seconds || '0') + 
                       (parseFloat(segment.segment?.startTimeOffset?.nanos || '0') / 1e9);

      textData.push({
        timestamp: startTime,
        text,
        confidence: segment.confidence || 0,
      });
    }
  }

  return textData;
}

