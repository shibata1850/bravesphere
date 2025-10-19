import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, Video } from "lucide-react";
import { Link, useParams } from "wouter";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading } = trpc.games.get.useQuery({ id: id! });
  const { data: homeTeam } = trpc.teams.get.useQuery(
    { id: game?.homeTeamId || "" },
    { enabled: !!game?.homeTeamId }
  );
  const { data: awayTeam } = trpc.teams.get.useQuery(
    { id: game?.awayTeamId || "" },
    { enabled: !!game?.awayTeamId }
  );

  if (isLoading) {
    return <div className="container py-8">読み込み中...</div>;
  }

  if (!game) {
    return <div className="container py-8">試合が見つかりません</div>;
  }

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = game.videoUrl ? getYouTubeEmbedUrl(game.videoUrl) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/games">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">試合詳細</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>試合情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">ホームチーム</span>
                  <p className="font-medium">{homeTeam?.name || "読み込み中..."}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">アウェイチーム</span>
                  <p className="font-medium">{awayTeam?.name || "読み込み中..."}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">試合日</span>
                <p className="font-medium">
                  {new Date(game.gameDate).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </p>
              </div>
              {game.venue && (
                <div>
                  <span className="text-sm text-muted-foreground">会場</span>
                  <p className="font-medium">{game.venue}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">解析状況</span>
                <p
                  className={`font-medium ${
                    game.analysisStatus === "completed"
                      ? "text-green-600"
                      : game.analysisStatus === "processing"
                      ? "text-blue-600"
                      : game.analysisStatus === "failed"
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {game.analysisStatus === "completed"
                    ? "解析完了"
                    : game.analysisStatus === "processing"
                    ? "解析中"
                    : game.analysisStatus === "failed"
                    ? "解析失敗"
                    : "解析待ち"}
                </p>
              </div>
            </CardContent>
          </Card>

          {embedUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  試合映像
                </CardTitle>
                <CardDescription>YouTube映像プレビュー</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  元のURL: <a href={game.videoUrl!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{game.videoUrl}</a>
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {!embedUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    映像
                  </CardTitle>
                  <CardDescription>試合映像の確認</CardDescription>
                </CardHeader>
                <CardContent>
                  {game.videoUrl || game.videoPath ? (
                    <p className="text-sm text-muted-foreground">映像が登録されています</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">映像が登録されていません</p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  スタッツ
                </CardTitle>
                <CardDescription>詳細スタッツの確認</CardDescription>
              </CardHeader>
              <CardContent>
                {game.analysisStatus === "completed" ? (
                  <Link href={`/games/${game.id}/analysis`}>
                    <Button className="w-full">スタッツを見る</Button>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">解析が完了していません</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
