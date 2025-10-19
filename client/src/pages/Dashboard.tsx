import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, Video, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: teams } = trpc.teams.listAll.useQuery();
  const { data: games } = trpc.games.listAll.useQuery();

  const recentGames = games?.slice(0, 5) || [];
  const completedGames = games?.filter(g => g.analysisStatus === "completed").length || 0;
  const processingGames = games?.filter(g => g.analysisStatus === "processing").length || 0;

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
              <Button variant="ghost" className="text-base font-medium">ダッシュボード</Button>
            </Link>
            <Link href="/teams">
              <Button variant="ghost" className="text-base">チーム管理</Button>
            </Link>
            <Link href="/games">
              <Button variant="ghost" className="text-base">試合一覧</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3">
            ようこそ、<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.name || "ユーザー"}さん</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            データ駆動型のバスケットボール分析を始めましょう
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">総チーム数</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teams?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">登録済みチーム</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">総試合数</CardTitle>
                <Video className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{games?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">登録済み試合</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">解析完了</CardTitle>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedGames}</div>
              <p className="text-xs text-muted-foreground mt-1">分析可能な試合</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">解析中</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{processingGames}</div>
              <p className="text-xs text-muted-foreground mt-1">処理中の試合</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Video className="h-6 w-6 text-primary" />
                試合を登録
              </CardTitle>
              <CardDescription className="text-base">
                新しい試合映像をアップロードして自動解析を開始
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/games">
                <Button size="lg" className="w-full group">
                  試合登録ページへ
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                チームを管理
              </CardTitle>
              <CardDescription className="text-base">
                チームと選手のロスター情報を管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teams">
                <Button size="lg" variant="outline" className="w-full group">
                  チーム管理ページへ
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Games */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">最近の試合</CardTitle>
                <CardDescription className="text-base mt-1">直近に登録された試合</CardDescription>
              </div>
              <Link href="/games">
                <Button variant="ghost">すべて見る</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentGames.length > 0 ? (
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <Link key={game.id} href={`/games/${game.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(game.gameDate).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {game.venue && (
                            <p className="text-sm text-muted-foreground">{game.venue}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            game.analysisStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : game.analysisStatus === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : game.analysisStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {game.analysisStatus === "completed"
                            ? "解析完了"
                            : game.analysisStatus === "processing"
                            ? "解析中"
                            : game.analysisStatus === "failed"
                            ? "解析失敗"
                            : "解析待ち"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">まだ試合が登録されていません</p>
                <Link href="/games">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    最初の試合を登録
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
