import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Video, Users, BarChart3, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: games, isLoading: gamesLoading } = trpc.games.list.useQuery();
  const { data: teams, isLoading: teamsLoading } = trpc.teams.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <nav className="flex gap-4">
            <Link href="/teams">
              <Button variant="ghost">チーム管理</Button>
            </Link>
            <Link href="/games">
              <Button variant="ghost">試合一覧</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">ようこそ、{user?.name}さん</h2>
            <p className="text-muted-foreground">
              データとエビデンスに基づく指導を始めましょう。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">登録チーム数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamsLoading ? "..." : teams?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">登録試合数</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gamesLoading ? "..." : games?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">解析完了</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gamesLoading
                    ? "..."
                    : games?.filter((g) => g.analysisStatus === "completed").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
                <CardDescription>よく使う操作</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/teams">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    新しいチームを作成
                  </Button>
                </Link>
                <Link href="/games">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    試合を登録
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近の試合</CardTitle>
                <CardDescription>直近の登録試合</CardDescription>
              </CardHeader>
              <CardContent>
                {gamesLoading ? (
                  <p className="text-muted-foreground">読み込み中...</p>
                ) : games && games.length > 0 ? (
                  <div className="space-y-2">
                    {games.slice(0, 5).map((game) => (
                      <Link key={game.id} href={`/games/${game.id}`}>
                        <div className="p-3 border rounded hover:bg-muted/50 cursor-pointer">
                          <p className="font-medium">
                            {new Date(game.gameDate).toLocaleDateString("ja-JP")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {game.analysisStatus === "completed"
                              ? "解析完了"
                              : game.analysisStatus === "processing"
                              ? "解析中"
                              : "解析待ち"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">まだ試合が登録されていません。</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
