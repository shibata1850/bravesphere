import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useState } from "react";

interface PlayerComparisonData {
  playerId: string;
  playerName: string;
  jerseyNumber: string;
  position: string;
  team: string;
  
  // スタッツ
  points: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  assists: number;
  turnovers: number;
  rebounds: number;
  steals: number;
  blocks: number;
  plusMinus: number;
  
  // 高度な指標
  effectiveFieldGoalPercentage: number;
  trueShootingPercentage: number;
  assistToTurnoverRatio: number;
  usageRate: number;
  offensiveRating: number;
  defensiveRating: number;
}

export default function PlayerComparison() {
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const player1Id = searchParams.get('player1') || '10';
  const player2Id = searchParams.get('player2') || '23';

  // サンプルデータ
  const players: PlayerComparisonData[] = [
    {
      playerId: '10',
      playerName: '田中 太郎',
      jerseyNumber: '10',
      position: 'PG',
      team: '東京ドラゴンズ',
      points: 18,
      fieldGoalPercentage: 45.5,
      threePointPercentage: 38.5,
      freeThrowPercentage: 85.0,
      assists: 7,
      turnovers: 3,
      rebounds: 5,
      steals: 2,
      blocks: 0,
      plusMinus: 12,
      effectiveFieldGoalPercentage: 52.3,
      trueShootingPercentage: 58.7,
      assistToTurnoverRatio: 2.33,
      usageRate: 28.5,
      offensiveRating: 115,
      defensiveRating: 108,
    },
    {
      playerId: '23',
      playerName: '佐藤 次郎',
      jerseyNumber: '23',
      position: 'SG',
      team: '東京ドラゴンズ',
      points: 22,
      fieldGoalPercentage: 48.2,
      threePointPercentage: 35.8,
      freeThrowPercentage: 78.5,
      assists: 4,
      turnovers: 2,
      rebounds: 6,
      steals: 1,
      blocks: 1,
      plusMinus: 8,
      effectiveFieldGoalPercentage: 54.1,
      trueShootingPercentage: 59.3,
      assistToTurnoverRatio: 2.0,
      usageRate: 32.1,
      offensiveRating: 118,
      defensiveRating: 110,
    },
  ];

  const player1 = players.find(p => p.playerId === player1Id) || players[0];
  const player2 = players.find(p => p.playerId === player2Id) || players[1];

  const compareValue = (val1: number, val2: number, higherIsBetter: boolean = true) => {
    if (Math.abs(val1 - val2) < 0.1) return 'equal';
    if (higherIsBetter) {
      return val1 > val2 ? 'player1' : 'player2';
    } else {
      return val1 < val2 ? 'player1' : 'player2';
    }
  };

  const getComparisonColor = (comparison: string, player: 'player1' | 'player2') => {
    if (comparison === 'equal') return 'text-muted-foreground';
    return comparison === player ? 'text-green-600 font-bold' : 'text-muted-foreground';
  };

  const getComparisonIcon = (comparison: string, player: 'player1' | 'player2') => {
    if (comparison === 'equal') return null;
    if (comparison === player) {
      return <TrendingUp className="h-4 w-4 text-green-600 inline ml-1" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600 inline ml-1" />;
  };

  const StatRow = ({ 
    label, 
    value1, 
    value2, 
    higherIsBetter = true,
    showProgress = false,
    unit = ''
  }: { 
    label: string; 
    value1: number; 
    value2: number; 
    higherIsBetter?: boolean;
    showProgress?: boolean;
    unit?: string;
  }) => {
    const comparison = compareValue(value1, value2, higherIsBetter);
    
    return (
      <div className="py-3 border-b last:border-b-0">
        <div className="text-sm font-medium text-muted-foreground mb-2">{label}</div>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className={`text-right ${getComparisonColor(comparison, 'player1')}`}>
            {value1.toFixed(1)}{unit}
            {getComparisonIcon(comparison, 'player1')}
          </div>
          {showProgress && (
            <div className="flex gap-2 items-center">
              <Progress value={value1} className="h-2 flex-1" />
              <Progress value={value2} className="h-2 flex-1" />
            </div>
          )}
          {!showProgress && (
            <div className="text-center text-xs text-muted-foreground">vs</div>
          )}
          <div className={`text-left ${getComparisonColor(comparison, 'player2')}`}>
            {value2.toFixed(1)}{unit}
            {getComparisonIcon(comparison, 'player2')}
          </div>
        </div>
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
          <Link href={`/games/${id}/scouting`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">選手比較分析</h2>
            <p className="text-lg text-muted-foreground">
              2人の選手のパフォーマンスを詳細に比較
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/games/${id}/training/${player1Id}`}>
              <Button variant="outline" size="sm">
                {player1.playerName}のトレーニング
              </Button>
            </Link>
            <Link href={`/games/${id}/training/${player2Id}`}>
              <Button variant="outline" size="sm">
                {player2.playerName}のトレーニング
              </Button>
            </Link>
          </div>
        </div>

        {/* 選手情報ヘッダー */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/50">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">#{player1.jerseyNumber}</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{player1.playerName}</CardTitle>
                  <CardDescription className="text-base">
                    {player1.position} • {player1.team}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-1">{player1.points}</div>
                <div className="text-sm text-muted-foreground">得点</div>
                <Badge variant={player1.plusMinus > 0 ? "default" : "destructive"} className="mt-2">
                  +/- {player1.plusMinus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/50">
            <CardHeader className="bg-blue-500/5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">#{player2.jerseyNumber}</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{player2.playerName}</CardTitle>
                  <CardDescription className="text-base">
                    {player2.position} • {player2.team}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-1">{player2.points}</div>
                <div className="text-sm text-muted-foreground">得点</div>
                <Badge variant={player2.plusMinus > 0 ? "default" : "destructive"} className="mt-2">
                  +/- {player2.plusMinus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 比較データ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* シュート効率 */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                シュート効率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow 
                label="FG%" 
                value1={player1.fieldGoalPercentage} 
                value2={player2.fieldGoalPercentage}
                unit="%"
                showProgress
              />
              <StatRow 
                label="3P%" 
                value1={player1.threePointPercentage} 
                value2={player2.threePointPercentage}
                unit="%"
                showProgress
              />
              <StatRow 
                label="FT%" 
                value1={player1.freeThrowPercentage} 
                value2={player2.freeThrowPercentage}
                unit="%"
                showProgress
              />
              <StatRow 
                label="eFG%" 
                value1={player1.effectiveFieldGoalPercentage} 
                value2={player2.effectiveFieldGoalPercentage}
                unit="%"
                showProgress
              />
              <StatRow 
                label="TS%" 
                value1={player1.trueShootingPercentage} 
                value2={player2.trueShootingPercentage}
                unit="%"
                showProgress
              />
            </CardContent>
          </Card>

          {/* プレイメイキング */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>プレイメイキング</CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow 
                label="アシスト" 
                value1={player1.assists} 
                value2={player2.assists}
              />
              <StatRow 
                label="ターンオーバー" 
                value1={player1.turnovers} 
                value2={player2.turnovers}
                higherIsBetter={false}
              />
              <StatRow 
                label="AST/TO比" 
                value1={player1.assistToTurnoverRatio} 
                value2={player2.assistToTurnoverRatio}
              />
              <StatRow 
                label="使用率" 
                value1={player1.usageRate} 
                value2={player2.usageRate}
                unit="%"
              />
            </CardContent>
          </Card>

          {/* リバウンド＆ディフェンス */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>リバウンド＆ディフェンス</CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow 
                label="リバウンド" 
                value1={player1.rebounds} 
                value2={player2.rebounds}
              />
              <StatRow 
                label="スティール" 
                value1={player1.steals} 
                value2={player2.steals}
              />
              <StatRow 
                label="ブロック" 
                value1={player1.blocks} 
                value2={player2.blocks}
              />
              <StatRow 
                label="ディフェンスレーティング" 
                value1={player1.defensiveRating} 
                value2={player2.defensiveRating}
                higherIsBetter={false}
              />
            </CardContent>
          </Card>

          {/* 高度な指標 */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>高度な指標</CardTitle>
            </CardHeader>
            <CardContent>
              <StatRow 
                label="オフェンスレーティング" 
                value1={player1.offensiveRating} 
                value2={player2.offensiveRating}
              />
              <StatRow 
                label="ディフェンスレーティング" 
                value1={player1.defensiveRating} 
                value2={player2.defensiveRating}
                higherIsBetter={false}
              />
              <StatRow 
                label="+/-" 
                value1={player1.plusMinus} 
                value2={player2.plusMinus}
              />
            </CardContent>
          </Card>
        </div>

        {/* サマリー */}
        <Card className="mt-8 border-2 bg-muted/30">
          <CardHeader>
            <CardTitle>比較サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-primary">{player1.playerName}の優位性</h4>
                <ul className="space-y-1 text-sm">
                  {player1.threePointPercentage > player2.threePointPercentage && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      3Pシュートの精度が高い
                    </li>
                  )}
                  {player1.assistToTurnoverRatio > player2.assistToTurnoverRatio && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      ターンオーバーが少なく安定
                    </li>
                  )}
                  {player1.assists > player2.assists && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      アシスト能力が優れている
                    </li>
                  )}
                  {player1.steals > player2.steals && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      ディフェンスのプレッシャーが強い
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">{player2.playerName}の優位性</h4>
                <ul className="space-y-1 text-sm">
                  {player2.points > player1.points && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      得点能力が高い
                    </li>
                  )}
                  {player2.fieldGoalPercentage > player1.fieldGoalPercentage && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      FG%が優れている
                    </li>
                  )}
                  {player2.rebounds > player1.rebounds && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      リバウンド能力が高い
                    </li>
                  )}
                  {player2.offensiveRating > player1.offensiveRating && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      オフェンス効率が良い
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
