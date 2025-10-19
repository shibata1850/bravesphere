import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Target, TrendingUp, Crosshair } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

const COURT_WIDTH = 500;
const COURT_HEIGHT = 470;

interface Shot {
  x: number;
  y: number;
  made: boolean;
  player: string;
  quarter: number;
  shotType: "2P" | "3P";
  time: string;
}

export default function ShotChart() {
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

  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("all");

  const homeShotsData: Shot[] = [
    { x: 50, y: 5, made: true, player: "田中 太郎", quarter: 1, shotType: "2P", time: "9:45" },
    { x: 45, y: 8, made: false, player: "田中 太郎", quarter: 1, shotType: "2P", time: "8:32" },
    { x: 55, y: 7, made: true, player: "田中 太郎", quarter: 2, shotType: "2P", time: "7:15" },
    { x: 30, y: 15, made: true, player: "佐藤 次郎", quarter: 1, shotType: "2P", time: "6:20" },
    { x: 70, y: 15, made: false, player: "佐藤 次郎", quarter: 2, shotType: "2P", time: "5:45" },
    { x: 50, y: 25, made: true, player: "鈴木 三郎", quarter: 1, shotType: "2P", time: "4:30" },
    { x: 40, y: 30, made: false, player: "鈴木 三郎", quarter: 3, shotType: "2P", time: "9:10" },
    { x: 60, y: 30, made: true, player: "鈴木 三郎", quarter: 3, shotType: "2P", time: "8:05" },
    { x: 20, y: 40, made: true, player: "高橋 四郎", quarter: 2, shotType: "3P", time: "7:22" },
    { x: 80, y: 40, made: false, player: "高橋 四郎", quarter: 4, shotType: "3P", time: "6:18" },
    { x: 35, y: 50, made: true, player: "伊藤 五郎", quarter: 3, shotType: "2P", time: "5:55" },
    { x: 65, y: 50, made: true, player: "伊藤 五郎", quarter: 4, shotType: "2P", time: "4:40" },
    { x: 50, y: 60, made: false, player: "田中 太郎", quarter: 4, shotType: "2P", time: "3:25" },
    { x: 25, y: 70, made: true, player: "佐藤 次郎", quarter: 3, shotType: "3P", time: "9:50" },
    { x: 75, y: 70, made: false, player: "鈴木 三郎", quarter: 4, shotType: "3P", time: "2:10" },
    { x: 15, y: 80, made: true, player: "高橋 四郎", quarter: 1, shotType: "3P", time: "8:15" },
    { x: 85, y: 80, made: true, player: "伊藤 五郎", quarter: 2, shotType: "3P", time: "7:30" },
    { x: 50, y: 85, made: false, player: "田中 太郎", quarter: 3, shotType: "3P", time: "1:45" },
  ];

  const awayShotsData: Shot[] = [
    { x: 50, y: 5, made: true, player: "山田 一郎", quarter: 1, shotType: "2P", time: "9:30" },
    { x: 48, y: 8, made: true, player: "山田 一郎", quarter: 2, shotType: "2P", time: "8:20" },
    { x: 52, y: 7, made: false, player: "山田 一郎", quarter: 3, shotType: "2P", time: "7:10" },
    { x: 35, y: 15, made: true, player: "中村 二郎", quarter: 1, shotType: "2P", time: "6:45" },
    { x: 65, y: 15, made: true, player: "中村 二郎", quarter: 2, shotType: "2P", time: "5:30" },
    { x: 50, y: 28, made: false, player: "小林 三郎", quarter: 1, shotType: "2P", time: "4:15" },
    { x: 42, y: 35, made: true, player: "小林 三郎", quarter: 3, shotType: "2P", time: "9:25" },
    { x: 58, y: 35, made: true, player: "小林 三郎", quarter: 4, shotType: "2P", time: "8:40" },
    { x: 25, y: 45, made: false, player: "加藤 四郎", quarter: 2, shotType: "3P", time: "7:55" },
    { x: 75, y: 45, made: true, player: "加藤 四郎", quarter: 3, shotType: "3P", time: "6:20" },
    { x: 30, y: 55, made: true, player: "渡辺 五郎", quarter: 2, shotType: "2P", time: "5:10" },
    { x: 70, y: 55, made: false, player: "渡辺 五郎", quarter: 4, shotType: "2P", time: "4:05" },
    { x: 50, y: 65, made: true, player: "山田 一郎", quarter: 4, shotType: "2P", time: "3:50" },
    { x: 20, y: 75, made: false, player: "中村 二郎", quarter: 3, shotType: "3P", time: "2:35" },
    { x: 80, y: 75, made: true, player: "小林 三郎", quarter: 4, shotType: "3P", time: "1:20" },
  ];

  const shots = selectedTeam === "home" ? homeShotsData : awayShotsData;
  let filteredShots = selectedPlayer === "all" ? shots : shots.filter(s => s.player === selectedPlayer);
  filteredShots = selectedQuarter === "all" ? filteredShots : filteredShots.filter(s => s.quarter === parseInt(selectedQuarter));

  const players = Array.from(new Set(shots.map(s => s.player)));
  
  // 統計計算
  const madeShots = filteredShots.filter(s => s.made).length;
  const totalShots = filteredShots.length;
  const fgPercentage = totalShots > 0 ? ((madeShots / totalShots) * 100).toFixed(1) : "0.0";
  
  const twoPointers = filteredShots.filter(s => s.shotType === "2P");
  const made2P = twoPointers.filter(s => s.made).length;
  const total2P = twoPointers.length;
  const fg2Percentage = total2P > 0 ? ((made2P / total2P) * 100).toFixed(1) : "0.0";
  
  const threePointers = filteredShots.filter(s => s.shotType === "3P");
  const made3P = threePointers.filter(s => s.made).length;
  const total3P = threePointers.length;
  const fg3Percentage = total3P > 0 ? ((made3P / total3P) * 100).toFixed(1) : "0.0";

  // 選手別統計
  const playerStats = players.map(player => {
    const playerShots = shots.filter(s => s.player === player);
    const made = playerShots.filter(s => s.made).length;
    const total = playerShots.length;
    const fg = total > 0 ? ((made / total) * 100).toFixed(1) : "0.0";
    
    const p2 = playerShots.filter(s => s.shotType === "2P");
    const m2 = p2.filter(s => s.made).length;
    const t2 = p2.length;
    
    const p3 = playerShots.filter(s => s.shotType === "3P");
    const m3 = p3.filter(s => s.made).length;
    const t3 = p3.length;
    
    return { player, made, total, fg, m2, t2, m3, t3 };
  });

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
            <h2 className="text-4xl font-bold mb-2">ショットチャート</h2>
            <p className="text-lg text-muted-foreground">
              {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  フィルター
                </CardTitle>
                <CardDescription>表示するデータを選択</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">チーム</label>
                  <Select value={selectedTeam} onValueChange={(v) => setSelectedTeam(v as "home" | "away")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{homeTeam?.name || "ホームチーム"}</SelectItem>
                      <SelectItem value="away">{awayTeam?.name || "アウェイチーム"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">選手</label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全選手</SelectItem>
                      {players.map(player => (
                        <SelectItem key={player} value={player}>{player}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">クォーター</label>
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全クォーター</SelectItem>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  シュート統計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <div className="text-sm text-muted-foreground mb-1">総合成功率</div>
                  <div className="text-5xl font-bold text-primary mb-2">{fgPercentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {madeShots} / {totalShots} 本
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div className="text-xs text-muted-foreground mb-1">2P成功率</div>
                    <div className="text-2xl font-bold text-blue-600">{fg2Percentage}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {made2P}/{total2P}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <div className="text-xs text-muted-foreground mb-1">3P成功率</div>
                    <div className="text-2xl font-bold text-orange-600">{fg3Percentage}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {made3P}/{total3P}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{madeShots}</div>
                    <div className="text-xs text-muted-foreground">成功</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{totalShots - madeShots}</div>
                    <div className="text-xs text-muted-foreground">失敗</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">凡例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-green-700"></div>
                  <span className="text-sm">シュート成功</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-red-700"></div>
                  <span className="text-sm">シュート失敗</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shot Chart */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crosshair className="h-6 w-6 text-primary" />
                  {selectedTeam === "home" ? homeTeam?.name : awayTeam?.name}
                  {selectedPlayer !== "all" && ` - ${selectedPlayer}`}
                </CardTitle>
                <CardDescription className="text-base">
                  ハーフコートビュー（{filteredShots.length}本のシュート）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-xl">
                  <svg
                    viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
                    className="w-full h-auto"
                    style={{ maxHeight: "600px" }}
                  >
                    <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="#8B4513" strokeWidth="3" />
                    <rect x="170" y="0" width="160" height="190" fill="none" stroke="#8B4513" strokeWidth="2" />
                    <circle cx="250" cy="190" r="60" fill="none" stroke="#8B4513" strokeWidth="2" />
                    <path d="M 30 0 Q 30 237.5 250 237.5 Q 470 237.5 470 0" fill="none" stroke="#8B4513" strokeWidth="2" />
                    <circle cx="250" cy="5" r="9" fill="none" stroke="#FF6347" strokeWidth="2" />
                    <line x1="250" y1="0" x2="250" y2="40" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2" />
                    <circle cx="250" cy="470" r="60" fill="none" stroke="#8B4513" strokeWidth="2" />
                    
                    {filteredShots.map((shot, idx) => {
                      const cx = (shot.x / 100) * COURT_WIDTH;
                      const cy = COURT_HEIGHT - (shot.y / 100) * COURT_HEIGHT;
                      return (
                        <g key={idx}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r="8"
                            fill={shot.made ? "#22c55e" : "#ef4444"}
                            stroke={shot.made ? "#166534" : "#991b1b"}
                            strokeWidth="2"
                            opacity="0.8"
                            className="hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <title>{`${shot.player} - Q${shot.quarter} ${shot.time}\n${shot.shotType} - ${shot.made ? "成功" : "失敗"}`}</title>
                          </circle>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Player Stats Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">選手別シュート統計</CardTitle>
            <CardDescription className="text-base">
              {selectedTeam === "home" ? homeTeam?.name : awayTeam?.name}の全選手
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">選手名</TableHead>
                  <TableHead className="text-center font-bold">総FG</TableHead>
                  <TableHead className="text-center font-bold">FG%</TableHead>
                  <TableHead className="text-center font-bold">2P</TableHead>
                  <TableHead className="text-center font-bold">3P</TableHead>
                  <TableHead className="text-center font-bold">成功/試投</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map((stat) => (
                  <TableRow key={stat.player}>
                    <TableCell className="font-medium">{stat.player}</TableCell>
                    <TableCell className="text-center font-bold text-primary">{stat.fg}%</TableCell>
                    <TableCell className="text-center text-sm">{stat.made}/{stat.total}</TableCell>
                    <TableCell className="text-center text-sm">{stat.m2}/{stat.t2}</TableCell>
                    <TableCell className="text-center text-sm">{stat.m3}/{stat.t3}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{stat.made}</span>
                      {" / "}
                      <span className="text-muted-foreground">{stat.total}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
