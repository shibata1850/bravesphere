import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { storagePut } from '../storage';

/**
 * YouTube URLから動画IDを抽出
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube動画をダウンロード
 */
export async function downloadYouTubeVideo(
  url: string,
  outputDir: string = '/tmp'
): Promise<{
  localPath: string;
  videoId: string;
  title: string;
  duration: number;
}> {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  console.log('[VideoDownloader] Downloading YouTube video:', videoId);

  // 動画情報を取得
  const info = await ytdl.getInfo(videoId);
  const title = info.videoDetails.title;
  const duration = parseInt(info.videoDetails.lengthSeconds);

  // 出力パス
  const outputPath = path.join(outputDir, `${videoId}.mp4`);

  // 既にダウンロード済みの場合はスキップ
  if (fs.existsSync(outputPath)) {
    console.log('[VideoDownloader] Video already exists:', outputPath);
    return {
      localPath: outputPath,
      videoId,
      title,
      duration,
    };
  }

  // ダウンロード開始
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, {
      quality: 'highest',
      filter: 'videoandaudio',
    });

    const writeStream = fs.createWriteStream(outputPath);

    stream.pipe(writeStream);

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = ((downloaded / total) * 100).toFixed(2);
      console.log(`[VideoDownloader] Progress: ${percent}%`);
    });

    writeStream.on('finish', () => {
      console.log('[VideoDownloader] Download completed:', outputPath);
      resolve({
        localPath: outputPath,
        videoId,
        title,
        duration,
      });
    });

    stream.on('error', (error) => {
      console.error('[VideoDownloader] Download error:', error);
      reject(error);
    });

    writeStream.on('error', (error) => {
      console.error('[VideoDownloader] Write error:', error);
      reject(error);
    });
  });
}

/**
 * ローカル動画をS3にアップロード
 */
export async function uploadVideoToS3(
  localPath: string,
  gameId: string
): Promise<{
  s3Key: string;
  s3Url: string;
}> {
  console.log('[VideoDownloader] Uploading video to S3:', localPath);

  const fileName = path.basename(localPath);
  const s3Key = `videos/${gameId}/${fileName}`;

  // S3にアップロード
  const fileBuffer = fs.readFileSync(localPath);
  const { key, url } = await storagePut(s3Key, fileBuffer, 'video/mp4');

  console.log('[VideoDownloader] Upload completed:', url);

  return {
    s3Key: key,
    s3Url: url,
  };
}

/**
 * YouTube動画をダウンロードしてS3にアップロード
 */
export async function downloadAndUploadYouTubeVideo(
  youtubeUrl: string,
  gameId: string
): Promise<{
  localPath: string;
  s3Key: string;
  s3Url: string;
  videoId: string;
  title: string;
  duration: number;
}> {
  // YouTube動画をダウンロード
  const downloadResult = await downloadYouTubeVideo(youtubeUrl);

  // S3にアップロード
  const uploadResult = await uploadVideoToS3(downloadResult.localPath, gameId);

  return {
    ...downloadResult,
    ...uploadResult,
  };
}

/**
 * 一時ファイルを削除
 */
export function cleanupTempFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('[VideoDownloader] Cleaned up temp file:', filePath);
  }
}

