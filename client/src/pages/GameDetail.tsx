import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, Video } from "lucide-react";
import { Link, useParams } from "wouter";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: game, isLoading } = trpc.games.get.useQuery({ id: id! });

  if (isLoading) {
    return <div className="container py-8">読み込み中...</div>;
  }

  if (!game) {
    return <div className="container py-8">試合が見つかりません</div>;
  }

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
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">試合日:</span>{" "}
                {new Date(game.gameDate).toLocaleDateString("ja-JP")}
              </div>
              {game.venue && (
                <div>
                  <span className="font-medium">会場:</span> {game.venue}
                </div>
              )}
              <div>
                <span className="font-medium">解析状況:</span>{" "}
                {game.analysisStatus === "completed"
                  ? "解析完了"
                  : game.analysisStatus === "processing"
                  ? "解析中"
                  : game.analysisStatus === "failed"
                  ? "解析失敗"
                  : "解析待ち"}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
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
