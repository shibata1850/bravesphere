import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, Video, Calendar, MapPin } from "lucide-react";
import { Link, useParams } from "wouter";
import { VideoAnalysisPanel } from "@/components/VideoAnalysisPanel";

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
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">試合が見つかりません</p>
      </div>
    );
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const embedUrl = game.videoUrl ? getYouTubeEmbedUrl(game.videoUrl) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-base">ダッシュボード</Button>
            </Link>
            <Link href="/teams">
              <Button variant="ghost" className="text-base">チーム管理</Button>
            </Link>
            <Link href="/games">
              <Button variant="ghost" className="text-base font-medium">試合一覧</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/games">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold mb-2">試合詳細</h2>
            <p className="text-lg text-muted-foreground">
              {new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Match Info Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">試合情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Teams */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">ホームチーム</p>
                  <p className="text-2xl font-bold">{homeTeam?.name || "読み込み中..."}</p>
                  {homeTeam?.organization && (
                    <p className="text-sm text-muted-foreground mt-1">{homeTeam.organization}</p>
                  )}
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/20">
                  <p className="text-sm text-muted-foreground mb-2">アウェイチーム</p>
                  <p className="text-2xl font-bold">{awayTeam?.name || "読み込み中..."}</p>
                  {awayTeam?.organization && (
                    <p className="text-sm text-muted-foreground mt-1">{awayTeam.organization}</p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">試合日</p>
                    <p className="font-medium">
                      {new Date(game.gameDate).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                {game.venue && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">会場</p>
                      <p className="font-medium">{game.venue}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">解析状況</p>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Player */}
          {embedUrl && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Video className="h-6 w-6 text-primary" />
                  試合映像
                </CardTitle>
                <CardDescription className="text-base">YouTube映像プレビュー</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
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
                <p className="text-sm text-muted-foreground mt-3">
                  元のURL:{" "}
                  <a
                    href={game.videoUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {game.videoUrl}
                  </a>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Video Analysis Panel */}
          <VideoAnalysisPanel 
            gameId={game.id} 
            homeTeamId={game.homeTeamId} 
            awayTeamId={game.awayTeamId} 
          />

          {/* Actions */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                スタッツ分析
              </CardTitle>
              <CardDescription className="text-base">
                ボックススコアと詳細スタッツを確認
              </CardDescription>
            </CardHeader>
            <CardContent>
              {game.analysisStatus === "completed" ? (
                <Link href={`/games/${game.id}/analysis`}>
                  <Button size="lg" className="w-full text-lg h-14">
                    ボックススコアを見る
                  </Button>
                </Link>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    {game.analysisStatus === "processing"
                      ? "現在解析中です。しばらくお待ちください。"
                      : game.analysisStatus === "failed"
                      ? "解析に失敗しました。もう一度お試しください。"
                      : "解析を開始するには、映像をアップロードしてください。"}
                  </p>
                  <Button size="lg" disabled variant="outline">
                    解析待ち
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
