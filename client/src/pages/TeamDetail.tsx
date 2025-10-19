import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading: teamLoading } = trpc.teams.get.useQuery({ id: id! });
  const { data: players, isLoading: playersLoading } = trpc.players.listByTeam.useQuery({ teamId: id! });

  if (teamLoading) {
    return <div className="container py-8">読み込み中...</div>;
  }

  if (!team) {
    return <div className="container py-8">チームが見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/teams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>チーム情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">チーム名:</span> {team.name}
              </div>
              {team.organization && (
                <div>
                  <span className="font-medium">所属組織:</span> {team.organization}
                </div>
              )}
              <div>
                <span className="font-medium">作成日:</span>{" "}
                {new Date(team.createdAt!).toLocaleDateString("ja-JP")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>選手ロスター</CardTitle>
              <CardDescription>
                {playersLoading ? "読み込み中..." : `${players?.length || 0}名の選手`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : players && players.length > 0 ? (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            #{player.number} {player.name}
                          </p>
                          {player.position && (
                            <p className="text-sm text-muted-foreground">{player.position}</p>
                          )}
                        </div>
                        {player.height && (
                          <p className="text-sm text-muted-foreground">{player.height}cm</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">まだ選手が登録されていません。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
