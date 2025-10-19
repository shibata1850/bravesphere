import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, Target, TrendingUp, Users as UsersIcon, Crosshair } from "lucide-react";
import { Link, useParams } from "wouter";

export default function AnalysisResult() {
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

  // サンプルデータ（実際のデータは解析エンジンから取得）
  const homeStats = [
    { number: "4", name: "田中 太郎", pts: 24, reb: 8, ast: 5, stl: 2, blk: 1, to: 3, fgm: 9, fga: 15, fg: "60.0%", tpm: 3, tpa: 6, tp: "50.0%", ftm: 3, fta: 4, ft: "75.0%" },
    { number: "7", name: "佐藤 次郎", pts: 18, reb: 12, ast: 2, stl: 1, blk: 3, to: 2, fgm: 7, fga: 12, fg: "58.3%", tpm: 0, tpa: 0, tp: "0.0%", ftm: 4, fta: 6, ft: "66.7%" },
    { number: "10", name: "鈴木 三郎", pts: 15, reb: 3, ast: 8, stl: 3, blk: 0, to: 4, fgm: 5, fga: 10, fg: "50.0%", tpm: 2, tpa: 5, tp: "40.0%", ftm: 3, fta: 3, ft: "100%" },
    { number: "12", name: "高橋 四郎", pts: 12, reb: 6, ast: 3, stl: 1, blk: 2, to: 1, fgm: 5, fga: 9, fg: "55.6%", tpm: 1, tpa: 3, tp: "33.3%", ftm: 1, fta: 2, ft: "50.0%" },
    { number: "15", name: "伊藤 五郎", pts: 8, reb: 4, ast: 2, stl: 0, blk: 1, to: 2, fgm: 3, fga: 7, fg: "42.9%", tpm: 1, tpa: 4, tp: "25.0%", ftm: 1, fta: 1, ft: "100%" },
  ];

  const awayStats = [
    { number: "5", name: "山田 一郎", pts: 22, reb: 7, ast: 6, stl: 2, blk: 0, to: 3, fgm: 8, fga: 14, fg: "57.1%", tpm: 2, tpa: 5, tp: "40.0%", ftm: 4, fta: 5, ft: "80.0%" },
    { number: "8", name: "中村 二郎", pts: 16, reb: 10, ast: 1, stl: 1, blk: 2, to: 2, fgm: 6, fga: 11, fg: "54.5%", tpm: 0, tpa: 1, tp: "0.0%", ftm: 4, fta: 6, ft: "66.7%" },
    { number: "11", name: "小林 三郎", pts: 14, reb: 2, ast: 7, stl: 2, blk: 0, to: 5, fgm: 5, fga: 12, fg: "41.7%", tpm: 2, tpa: 6, tp: "33.3%", ftm: 2, fta: 2, ft: "100%" },
    { number: "13", name: "加藤 四郎", pts: 11, reb: 5, ast: 2, stl: 1, blk: 1, to: 1, fgm: 4, fga: 8, fg: "50.0%", tpm: 1, tpa: 3, tp: "33.3%", ftm: 2, fta: 3, ft: "66.7%" },
    { number: "20", name: "渡辺 五郎", pts: 7, reb: 3, ast: 1, stl: 0, blk: 0, to: 2, fgm: 3, fga: 6, fg: "50.0%", tpm: 0, tpa: 2, tp: "0.0%", ftm: 1, fta: 2, ft: "50.0%" },
  ];

  const homeTotal = { pts: 77, reb: 33, ast: 20, stl: 7, blk: 7, to: 12 };
  const awayTotal = { pts: 70, reb: 27, ast: 17, stl: 6, blk: 3, to: 13 };

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
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/games/${id}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold mb-2">スタッツ分析</h2>
            <p className="text-lg text-muted-foreground">
              {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="border-2 mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <p className="text-sm text-muted-foreground mb-2">ホームチーム</p>
                <p className="text-2xl font-bold mb-2">{homeTeam?.name || "ホーム"}</p>
                <p className="text-5xl font-bold text-primary">{homeTotal.pts}</p>
              </div>
              <div className="text-center">
                <div className="inline-block px-6 py-3 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                  勝利
                </div>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5">
                <p className="text-sm text-muted-foreground mb-2">アウェイチーム</p>
                <p className="text-2xl font-bold mb-2">{awayTeam?.name || "アウェイ"}</p>
                <p className="text-5xl font-bold text-accent">{awayTotal.pts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">リバウンド</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homeTotal.reb} - {awayTotal.reb}</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">アシスト</CardTitle>
                <UsersIcon className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homeTotal.ast} - {awayTotal.ast}</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">スティール</CardTitle>
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homeTotal.stl} - {awayTotal.stl}</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">ブロック</CardTitle>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homeTotal.blk} - {awayTotal.blk}</div>
            </CardContent>
          </Card>
        </div>

        {/* Box Score Tables */}
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="home" className="text-base">
              {homeTeam?.name || "ホームチーム"}
            </TabsTrigger>
            <TabsTrigger value="away" className="text-base">
              {awayTeam?.name || "アウェイチーム"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">ボックススコア - {homeTeam?.name || "ホームチーム"}</CardTitle>
                <CardDescription className="text-base">個人スタッツ詳細</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">#</TableHead>
                        <TableHead className="font-bold">選手名</TableHead>
                        <TableHead className="text-center font-bold">PTS</TableHead>
                        <TableHead className="text-center font-bold">REB</TableHead>
                        <TableHead className="text-center font-bold">AST</TableHead>
                        <TableHead className="text-center font-bold">STL</TableHead>
                        <TableHead className="text-center font-bold">BLK</TableHead>
                        <TableHead className="text-center font-bold">TO</TableHead>
                        <TableHead className="text-center font-bold">FG</TableHead>
                        <TableHead className="text-center font-bold">3P</TableHead>
                        <TableHead className="text-center font-bold">FT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {homeStats.map((player) => (
                        <TableRow key={player.number}>
                          <TableCell className="font-medium">{player.number}</TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell className="text-center font-bold text-primary">{player.pts}</TableCell>
                          <TableCell className="text-center">{player.reb}</TableCell>
                          <TableCell className="text-center">{player.ast}</TableCell>
                          <TableCell className="text-center">{player.stl}</TableCell>
                          <TableCell className="text-center">{player.blk}</TableCell>
                          <TableCell className="text-center">{player.to}</TableCell>
                          <TableCell className="text-center text-sm">
                            {player.fgm}/{player.fga}
                            <br />
                            <span className="text-muted-foreground">{player.fg}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {player.tpm}/{player.tpa}
                            <br />
                            <span className="text-muted-foreground">{player.tp}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {player.ftm}/{player.fta}
                            <br />
                            <span className="text-muted-foreground">{player.ft}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>合計</TableCell>
                        <TableCell className="text-center text-primary">{homeTotal.pts}</TableCell>
                        <TableCell className="text-center">{homeTotal.reb}</TableCell>
                        <TableCell className="text-center">{homeTotal.ast}</TableCell>
                        <TableCell className="text-center">{homeTotal.stl}</TableCell>
                        <TableCell className="text-center">{homeTotal.blk}</TableCell>
                        <TableCell className="text-center">{homeTotal.to}</TableCell>
                        <TableCell colSpan={3}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="away">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">ボックススコア - {awayTeam?.name || "アウェイチーム"}</CardTitle>
                <CardDescription className="text-base">個人スタッツ詳細</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">#</TableHead>
                        <TableHead className="font-bold">選手名</TableHead>
                        <TableHead className="text-center font-bold">PTS</TableHead>
                        <TableHead className="text-center font-bold">REB</TableHead>
                        <TableHead className="text-center font-bold">AST</TableHead>
                        <TableHead className="text-center font-bold">STL</TableHead>
                        <TableHead className="text-center font-bold">BLK</TableHead>
                        <TableHead className="text-center font-bold">TO</TableHead>
                        <TableHead className="text-center font-bold">FG</TableHead>
                        <TableHead className="text-center font-bold">3P</TableHead>
                        <TableHead className="text-center font-bold">FT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awayStats.map((player) => (
                        <TableRow key={player.number}>
                          <TableCell className="font-medium">{player.number}</TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell className="text-center font-bold text-accent">{player.pts}</TableCell>
                          <TableCell className="text-center">{player.reb}</TableCell>
                          <TableCell className="text-center">{player.ast}</TableCell>
                          <TableCell className="text-center">{player.stl}</TableCell>
                          <TableCell className="text-center">{player.blk}</TableCell>
                          <TableCell className="text-center">{player.to}</TableCell>
                          <TableCell className="text-center text-sm">
                            {player.fgm}/{player.fga}
                            <br />
                            <span className="text-muted-foreground">{player.fg}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {player.tpm}/{player.tpa}
                            <br />
                            <span className="text-muted-foreground">{player.tp}</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {player.ftm}/{player.fta}
                            <br />
                            <span className="text-muted-foreground">{player.ft}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>合計</TableCell>
                        <TableCell className="text-center text-accent">{awayTotal.pts}</TableCell>
                        <TableCell className="text-center">{awayTotal.reb}</TableCell>
                        <TableCell className="text-center">{awayTotal.ast}</TableCell>
                        <TableCell className="text-center">{awayTotal.stl}</TableCell>
                        <TableCell className="text-center">{awayTotal.blk}</TableCell>
                        <TableCell className="text-center">{awayTotal.to}</TableCell>
                        <TableCell colSpan={3}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="border-2 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crosshair className="h-6 w-6 text-accent" />
                詳細分析
              </CardTitle>
              <CardDescription className="text-base">
                ショットチャートで視覚的に分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/games/${id}/shotchart`}>
                <Button size="lg" variant="outline" className="w-full text-lg h-14">
                  ショットチャートを見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <UsersIcon className="h-6 w-6 text-primary" />
                ラインナップ効率
              </CardTitle>
              <CardDescription className="text-base">
                各ラインナップの効率性を分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/games/${id}/lineup`}>
                <Button size="lg" variant="outline" className="w-full text-lg h-14">
                  ラインナップ効率を見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                4ファクター分析
              </CardTitle>
              <CardDescription className="text-base">
                勝敗を決める4つの重要指標
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/games/${id}/fourfactors`}>
                <Button size="lg" variant="outline" className="w-full text-lg h-14">
                  4ファクターを見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
