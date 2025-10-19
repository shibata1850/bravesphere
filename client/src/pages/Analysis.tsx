import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading: gameLoading } = trpc.games.get.useQuery({ id: id! });
  const { data: stats, isLoading: statsLoading } = trpc.stats.listByGame.useQuery({ gameId: id! });
  const { data: events, isLoading: eventsLoading } = trpc.events.listByGame.useQuery({ gameId: id! });

  if (gameLoading) {
    return <div className="container py-8">読み込み中...</div>;
  }

  if (!game) {
    return <div className="container py-8">試合が見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4">
          <Link href={`/games/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">解析結果</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>試合概要</CardTitle>
              <CardDescription>
                {new Date(game.gameDate).toLocaleDateString("ja-JP")} {game.venue && `@ ${game.venue}`}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>スタッツサマリー</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : stats && stats.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {stats.length}名の選手のスタッツが記録されています
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">選手</th>
                          <th className="text-right p-2">得点</th>
                          <th className="text-right p-2">REB</th>
                          <th className="text-right p-2">AST</th>
                          <th className="text-right p-2">STL</th>
                          <th className="text-right p-2">BLK</th>
                          <th className="text-right p-2">TO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((stat) => (
                          <tr key={stat.id} className="border-b">
                            <td className="p-2">{stat.playerId}</td>
                            <td className="text-right p-2">{stat.points}</td>
                            <td className="text-right p-2">{stat.rebounds}</td>
                            <td className="text-right p-2">{stat.assists}</td>
                            <td className="text-right p-2">{stat.steals}</td>
                            <td className="text-right p-2">{stat.blocks}</td>
                            <td className="text-right p-2">{stat.turnovers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">スタッツデータがありません</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>イベントタイムライン</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : events && events.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {events.length}件のイベントが記録されています
                </p>
              ) : (
                <p className="text-muted-foreground">イベントデータがありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
