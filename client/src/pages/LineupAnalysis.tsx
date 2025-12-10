import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Users, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Link, useParams } from "wouter";

interface LineupStat {
  players: string[];
  minutes: number;
  plusMinus: number;
  offRating: number;
  defRating: number;
  netRating: number;
  pace: number;
  possessions: number;
  points: number;
  pointsAllowed: number;
}

export default function LineupAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { data: game } = trpc.games.get.useQuery({ id: id! });
  const { data: homeTeam } = trpc.teams.get.useQuery(
    { id: game?.homeTeamId || "" },
    { enabled: !!game?.homeTeamId }
  );
  const { data: awayTeam } = trpc.teams.get.useQuery(
    { id: game?.awayTeamId || "" },
    { enabled: !!game?.awayTeamId }
  );

  // TODO: APIからデータを取得する
  const homeLineups: LineupStat[] = [];

  const awayLineups: LineupStat[] = [];

  const renderPlusMinusBadge = (value: number) => {
    if (value > 0) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+{value}</Badge>;
    } else if (value < 0) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{value}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">0</Badge>;
  };

  const renderNetRating = (value: number) => {
    const color = value > 5 ? "text-green-600" : value < -5 ? "text-red-600" : "text-gray-600";
    const icon = value > 0 ? <TrendingUp className="h-4 w-4 inline" /> : value < 0 ? <TrendingDown className="h-4 w-4 inline" /> : <Activity className="h-4 w-4 inline" />;
    return (
      <span className={`font-bold ${color} flex items-center gap-1 justify-center`}>
        {icon}
        {value > 0 ? "+" : ""}{value.toFixed(1)}
      </span>
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
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/games/${id}/analysis`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold mb-2">ラインナップ効率分析</h2>
            <p className="text-lg text-muted-foreground">
              {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Explanation Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">オフェンスレーティング</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">100ポゼッションあたりの得点</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ディフェンスレーティング</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">100ポゼッションあたりの失点</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ネットレーティング</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">オフェンス - ディフェンスレーティング</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ペース</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">40分あたりのポゼッション数</p>
            </CardContent>
          </Card>
        </div>

        {/* Home Team Lineups */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {homeTeam?.name || "ホームチーム"} - ラインナップ統計
            </CardTitle>
            <CardDescription className="text-base">
              出場時間が長い順に表示（上位5ラインナップ）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold min-w-[300px]">ラインナップ</TableHead>
                    <TableHead className="text-center font-bold">時間</TableHead>
                    <TableHead className="text-center font-bold">+/-</TableHead>
                    <TableHead className="text-center font-bold">OffRtg</TableHead>
                    <TableHead className="text-center font-bold">DefRtg</TableHead>
                    <TableHead className="text-center font-bold">NetRtg</TableHead>
                    <TableHead className="text-center font-bold">ペース</TableHead>
                    <TableHead className="text-center font-bold">得点</TableHead>
                    <TableHead className="text-center font-bold">失点</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeLineups.map((lineup, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div className="flex flex-wrap gap-1">
                          {lineup.players.map((player, pidx) => (
                            <Badge key={pidx} variant="outline" className="text-xs">
                              {player}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{lineup.minutes.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{renderPlusMinusBadge(lineup.plusMinus)}</TableCell>
                      <TableCell className="text-center font-medium text-blue-600">{lineup.offRating.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-medium text-orange-600">{lineup.defRating.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{renderNetRating(lineup.netRating)}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{lineup.pace.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-medium">{lineup.points}</TableCell>
                      <TableCell className="text-center font-medium">{lineup.pointsAllowed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Away Team Lineups */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" />
              {awayTeam?.name || "アウェイチーム"} - ラインナップ統計
            </CardTitle>
            <CardDescription className="text-base">
              出場時間が長い順に表示（上位4ラインナップ）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold min-w-[300px]">ラインナップ</TableHead>
                    <TableHead className="text-center font-bold">時間</TableHead>
                    <TableHead className="text-center font-bold">+/-</TableHead>
                    <TableHead className="text-center font-bold">OffRtg</TableHead>
                    <TableHead className="text-center font-bold">DefRtg</TableHead>
                    <TableHead className="text-center font-bold">NetRtg</TableHead>
                    <TableHead className="text-center font-bold">ペース</TableHead>
                    <TableHead className="text-center font-bold">得点</TableHead>
                    <TableHead className="text-center font-bold">失点</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awayLineups.map((lineup, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div className="flex flex-wrap gap-1">
                          {lineup.players.map((player, pidx) => (
                            <Badge key={pidx} variant="outline" className="text-xs">
                              {player}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{lineup.minutes.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{renderPlusMinusBadge(lineup.plusMinus)}</TableCell>
                      <TableCell className="text-center font-medium text-blue-600">{lineup.offRating.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-medium text-orange-600">{lineup.defRating.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{renderNetRating(lineup.netRating)}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{lineup.pace.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-medium">{lineup.points}</TableCell>
                      <TableCell className="text-center font-medium">{lineup.pointsAllowed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
