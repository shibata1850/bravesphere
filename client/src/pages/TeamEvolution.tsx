import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { Link, useParams } from "wouter";

interface GameData {
  gameNumber: number;
  date: string;
  opponent: string;
  result: "W" | "L";
  score: string;
  offensiveRating: number;
  defensiveRating: number;
  pace: number;
  effectiveFG: number;
  turnoverRate: number;
  reboundRate: number;
  freeThrowRate: number;
}

interface PlayerEvolution {
  playerId: string;
  playerName: string;
  games: {
    gameNumber: number;
    points: number;
    fieldGoalPercentage: number;
    assists: number;
    rebounds: number;
    plusMinus: number;
  }[];
}

export default function TeamEvolution() {
  const { teamId } = useParams<{ teamId: string }>();

  // TODO: APIからデータを取得する
  const teamName = "";
  const season = "";

  const gamesData: GameData[] = [];

  const playerEvolutions: PlayerEvolution[] = [];

  const wins = gamesData.filter(g => g.result === "W").length;
  const losses = gamesData.filter(g => g.result === "L").length;
  const winRate = gamesData.length > 0 ? ((wins / gamesData.length) * 100).toFixed(1) : "0";

  const latestGame = gamesData[gamesData.length - 1];
  const firstGame = gamesData[0];

  const offensiveImprovement = firstGame && latestGame
    ? ((latestGame.offensiveRating - firstGame.offensiveRating) / firstGame.offensiveRating * 100).toFixed(1)
    : "0";
  const defensiveImprovement = firstGame && latestGame
    ? ((firstGame.defensiveRating - latestGame.defensiveRating) / firstGame.defensiveRating * 100).toFixed(1)
    : "0";

  // データがない場合は早期リターン
  const hasData = gamesData.length > 0;

  const renderLineChart = (data: number[], label: string, color: string) => {
    if (data.length === 0) {
      return (
        <div className="relative h-48 border rounded-lg p-4 bg-muted/20 flex items-center justify-center">
          <div className="text-muted-foreground">データがありません</div>
        </div>
      );
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="relative h-48 border rounded-lg p-4 bg-muted/20">
        <div className="absolute top-2 left-4 text-sm font-semibold text-muted-foreground">{label}</div>
        <svg className="w-full h-full" viewBox="0 0 800 180" preserveAspectRatio="none">
          <polyline
            points={data.map((val, idx) => {
              const x = (idx / (data.length - 1)) * 780 + 10;
              const y = 170 - ((val - min) / range) * 150;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * 780 + 10;
            const y = 170 - ((val - min) / range) * 150;
            return (
              <circle key={idx} cx={x} cy={y} r="4" fill={color} />
            );
          })}
        </svg>
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">試合1</div>
        <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">試合{data.length}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
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
        </div>
      </header>

      <main className="container py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/teams">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold mb-2">チーム進化グラフ</h2>
            <p className="text-lg text-muted-foreground">
              {teamName} - {season}シーズン
            </p>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardDescription>試合数</CardDescription>
              <CardTitle className="text-3xl">{gamesData.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {wins}勝 {losses}敗 ({winRate}%)
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/50">
            <CardHeader className="pb-3">
              <CardDescription>オフェンス改善</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                +{offensiveImprovement}%
                <TrendingUp className="h-6 w-6 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {firstGame.offensiveRating} → {latestGame.offensiveRating}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/50">
            <CardHeader className="pb-3">
              <CardDescription>ディフェンス改善</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                +{defensiveImprovement}%
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {firstGame.defensiveRating} → {latestGame.defensiveRating}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/50">
            <CardHeader className="pb-3">
              <CardDescription>最新ペース</CardDescription>
              <CardTitle className="text-3xl">{latestGame.pace}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                ポゼッション/試合
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">チーム指標</TabsTrigger>
            <TabsTrigger value="players">選手別成長</TabsTrigger>
          </TabsList>

          {/* チーム指標タブ */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  オフェンス/ディフェンスレーティング
                </CardTitle>
                <CardDescription>100ポゼッションあたりの得点/失点</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderLineChart(gamesData.map(g => g.offensiveRating), "オフェンスレーティング", "#22c55e")}
                {renderLineChart(gamesData.map(g => g.defensiveRating), "ディフェンスレーティング", "#3b82f6")}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  4ファクターの進化
                </CardTitle>
                <CardDescription>勝敗を決める4つの重要指標</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderLineChart(gamesData.map(g => g.effectiveFG), "実効FG%", "#f59e0b")}
                {renderLineChart(gamesData.map(g => g.turnoverRate), "ターンオーバー率（低い方が良い）", "#ef4444")}
                {renderLineChart(gamesData.map(g => g.reboundRate), "リバウンド率", "#8b5cf6")}
                {renderLineChart(gamesData.map(g => g.freeThrowRate), "フリースロー率", "#06b6d4")}
              </CardContent>
            </Card>

            {/* 試合結果一覧 */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>試合結果一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gamesData.map((game) => (
                    <div key={game.gameNumber} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <Badge variant={game.result === "W" ? "default" : "destructive"}>
                          {game.result}
                        </Badge>
                        <div>
                          <div className="font-semibold">第{game.gameNumber}試合 vs {game.opponent}</div>
                          <div className="text-sm text-muted-foreground">{game.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{game.score}</div>
                        <div className="text-xs text-muted-foreground">
                          ORtg: {game.offensiveRating} / DRtg: {game.defensiveRating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 選手別成長タブ */}
          <TabsContent value="players" className="space-y-6">
            {playerEvolutions.map((player) => (
              <Card key={player.playerId} className="border-2">
                <CardHeader>
                  <CardTitle>{player.playerName}の成長曲線</CardTitle>
                  <CardDescription>シーズンを通じたパフォーマンスの変化</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderLineChart(player.games.map(g => g.points), "得点", "#22c55e")}
                  {renderLineChart(player.games.map(g => g.fieldGoalPercentage), "FG%", "#f59e0b")}
                  {renderLineChart(player.games.map(g => g.assists), "アシスト", "#3b82f6")}
                  {renderLineChart(player.games.map(g => g.rebounds), "リバウンド", "#8b5cf6")}
                  {renderLineChart(player.games.map(g => g.plusMinus), "+/-", "#06b6d4")}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
