import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Video } from "lucide-react";
import { Link } from "wouter";

export default function Games() {
  const { data: games, isLoading } = trpc.games.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">試合一覧</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">ダッシュボード</Button>
            </Link>
            <Link href="/teams">
              <Button variant="ghost">チーム管理</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">試合一覧</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            試合を登録
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">読み込み中...</p>
        ) : games && games.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(game.gameDate).toLocaleDateString("ja-JP")}
                        </p>
                        {game.venue && (
                          <p className="text-sm text-muted-foreground">{game.venue}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {game.analysisStatus === "completed"
                          ? "解析完了"
                          : game.analysisStatus === "processing"
                          ? "解析中"
                          : "解析待ち"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">まだ試合が登録されていません。</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                最初の試合を登録
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
