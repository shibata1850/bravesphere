import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Video } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Games() {
  const [open, setOpen] = useState(false);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [venue, setVenue] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: games, isLoading } = trpc.games.listAll.useQuery();
  const { data: teams } = trpc.teams.listAll.useQuery();
  const utils = trpc.useUtils();

  const createGame = trpc.games.create.useMutation({
    onSuccess: () => {
      utils.games.listAll.invalidate();
      setOpen(false);
      setHomeTeamId("");
      setAwayTeamId("");
      setGameDate("");
      setVenue("");
      setVideoUrl("");
      toast.success("試合を登録しました");
    },
    onError: (error) => {
      toast.error("試合の登録に失敗しました: " + error.message);
    },
  });

  const handleCreate = () => {
    if (!homeTeamId || !awayTeamId || !gameDate) {
      toast.error("必須項目を入力してください");
      return;
    }
    if (homeTeamId === awayTeamId) {
      toast.error("ホームチームとアウェイチームは異なるチームを選択してください");
      return;
    }
    createGame.mutate({
      homeTeamId,
      awayTeamId,
      gameDate,
      venue,
      videoUrl,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/"><div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">{APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />}<h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{APP_TITLE}</h1></div></Link>
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                試合を登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新しい試合を登録</DialogTitle>
                <DialogDescription>
                  試合情報とYouTube映像URLを入力してください。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">ホームチーム *</Label>
                    <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                      <SelectTrigger id="homeTeam">
                        <SelectValue placeholder="チームを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">アウェイチーム *</Label>
                    <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                      <SelectTrigger id="awayTeam">
                        <SelectValue placeholder="チームを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gameDate">試合日 *</Label>
                  <Input
                    id="gameDate"
                    type="date"
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">会場（任意）</Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="例: 東京体育館"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube映像URL（任意）</Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="例: https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTubeの試合映像URLを入力すると、自動解析が可能になります。
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate} disabled={createGame.isPending}>
                  {createGame.isPending ? "登録中..." : "登録"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                      <div className="flex-1">
                        <p className="font-medium">
                          {new Date(game.gameDate).toLocaleDateString("ja-JP")}
                        </p>
                        {game.venue && (
                          <p className="text-sm text-muted-foreground">{game.venue}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">状態:</span>
                        <span
                          className={
                            game.analysisStatus === "completed"
                              ? "text-green-600 font-medium"
                              : game.analysisStatus === "processing"
                              ? "text-blue-600 font-medium"
                              : game.analysisStatus === "failed"
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground"
                          }
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
                      {game.videoUrl && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Video className="h-3 w-3" />
                          <span>映像あり</span>
                        </div>
                      )}
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
              <Button onClick={() => setOpen(true)}>
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
