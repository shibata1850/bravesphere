import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Target, TrendingUp, Shield, Repeat, Zap } from "lucide-react";
import { Link, useParams } from "wouter";

interface TeamFactors {
  efg: number; // Effective Field Goal %
  tovPct: number; // Turnover %
  orbPct: number; // Offensive Rebound %
  ftRate: number; // Free Throw Rate
}

export default function FourFactors() {
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

  // サンプルデータ
  const homeFactors: TeamFactors = {
    efg: 56.8,
    tovPct: 12.5,
    orbPct: 32.4,
    ftRate: 28.6,
  };

  const awayFactors: TeamFactors = {
    efg: 51.2,
    tovPct: 15.8,
    orbPct: 28.1,
    ftRate: 24.3,
  };

  const renderComparison = (
    homeValue: number,
    awayValue: number,
    higherIsBetter: boolean,
    label: string,
    icon: React.ReactNode,
    description: string
  ) => {
    const homeAdvantage = higherIsBetter
      ? homeValue > awayValue
      : homeValue < awayValue;
    const diff = Math.abs(homeValue - awayValue);

    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {icon}
              {label}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              差: {diff.toFixed(1)}%
            </div>
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home Team */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {homeTeam?.name || "ホームチーム"}
              </span>
              <span
                className={`text-lg font-bold ${
                  homeAdvantage ? "text-green-600" : "text-gray-600"
                }`}
              >
                {homeValue.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={homeValue}
              className="h-3"
              
            />
          </div>

          {/* Away Team */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {awayTeam?.name || "アウェイチーム"}
              </span>
              <span
                className={`text-lg font-bold ${
                  !homeAdvantage ? "text-green-600" : "text-gray-600"
                }`}
              >
                {awayValue.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={awayValue}
              className="h-3"
              
            />
          </div>

          {/* Winner Badge */}
          <div className="pt-2 border-t">
            <div className="text-center">
              <span className="text-sm font-medium text-muted-foreground">優位: </span>
              <span className="text-sm font-bold text-green-600">
                {homeAdvantage
                  ? homeTeam?.name || "ホームチーム"
                  : awayTeam?.name || "アウェイチーム"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 総合評価の計算
  const calculateOverallScore = (factors: TeamFactors) => {
    // Dean Oliver's Four Factors weights: eFG% (40%), TOV% (25%), ORB% (20%), FT Rate (15%)
    const efgScore = factors.efg * 0.4;
    const tovScore = (100 - factors.tovPct) * 0.25; // Lower is better
    const orbScore = factors.orbPct * 0.2;
    const ftScore = factors.ftRate * 0.15;
    return efgScore + tovScore + orbScore + ftScore;
  };

  const homeOverall = calculateOverallScore(homeFactors);
  const awayOverall = calculateOverallScore(awayFactors);

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
            <h2 className="text-4xl font-bold mb-2">4ファクター分析</h2>
            <p className="text-lg text-muted-foreground">
              {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="border-2 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-2xl">総合評価</CardTitle>
            <CardDescription className="text-base">
              Dean Oliverの4ファクター重み付け評価（eFG% 40%, TOV% 25%, ORB% 20%, FT Rate 15%）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <p className="text-sm text-muted-foreground mb-2">
                  {homeTeam?.name || "ホームチーム"}
                </p>
                <p className="text-5xl font-bold text-primary mb-2">
                  {homeOverall.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">総合スコア</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5">
                <p className="text-sm text-muted-foreground mb-2">
                  {awayTeam?.name || "アウェイチーム"}
                </p>
                <p className="text-5xl font-bold text-accent mb-2">
                  {awayOverall.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">総合スコア</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg">
                <span className="text-muted-foreground">優位: </span>
                <span className="font-bold text-green-600">
                  {homeOverall > awayOverall
                    ? homeTeam?.name || "ホームチーム"
                    : awayTeam?.name || "アウェイチーム"}
                </span>
                <span className="text-muted-foreground ml-2">
                  (差: {Math.abs(homeOverall - awayOverall).toFixed(1)})
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Four Factors Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {renderComparison(
            homeFactors.efg,
            awayFactors.efg,
            true,
            "実効FG%",
            <Target className="h-5 w-5 text-blue-600" />,
            "3ポイントシュートの価値を考慮したシュート成功率。高いほど効率的。"
          )}

          {renderComparison(
            homeFactors.tovPct,
            awayFactors.tovPct,
            false,
            "ターンオーバー率",
            <Shield className="h-5 w-5 text-red-600" />,
            "ポゼッションあたりのターンオーバー率。低いほど良い。"
          )}

          {renderComparison(
            homeFactors.orbPct,
            awayFactors.orbPct,
            true,
            "オフェンスリバウンド率",
            <Repeat className="h-5 w-5 text-green-600" />,
            "自チームのミスショット後のリバウンド獲得率。高いほどセカンドチャンスが多い。"
          )}

          {renderComparison(
            homeFactors.ftRate,
            awayFactors.ftRate,
            true,
            "フリースロー率",
            <Zap className="h-5 w-5 text-orange-600" />,
            "FGA（フィールドゴール試投）あたりのフリースロー試投数。高いほどファウルを誘発している。"
          )}
        </div>

        {/* Explanation */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              4ファクターとは
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>4ファクター（Four Factors）</strong>は、バスケットボール統計学者のDean Oliverが提唱した、
              チームの勝敗を決定する4つの重要な要素です。これらの指標を分析することで、
              チームの強みと弱みを客観的に評価できます。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  1. 実効FG%（eFG%）
                </h4>
                <p className="text-xs text-muted-foreground">
                  重み: 40% | 計算式: (FGM + 0.5 × 3PM) / FGA
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  2. ターンオーバー率（TOV%）
                </h4>
                <p className="text-xs text-muted-foreground">
                  重み: 25% | 計算式: TOV / (FGA + 0.44 × FTA + TOV)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  3. オフェンスリバウンド率（ORB%）
                </h4>
                <p className="text-xs text-muted-foreground">
                  重み: 20% | 計算式: ORB / (ORB + 相手DRB)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  4. フリースロー率（FT Rate）
                </h4>
                <p className="text-xs text-muted-foreground">
                  重み: 15% | 計算式: FTA / FGA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
