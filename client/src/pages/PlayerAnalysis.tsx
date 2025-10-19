import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Shield, Activity, Zap, Award, AlertTriangle } from "lucide-react";
import { Link, useParams } from "wouter";

interface PlayerDetailedStats {
  playerId: string;
  playerName: string;
  jerseyNumber: string;
  position: string;
  
  // オフェンススタッツ
  points: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  effectiveFieldGoalPercentage: number;
  trueShootingPercentage: number;
  
  // シュート分布
  shotsAtRim: { attempts: number; made: number; percentage: number };
  midRangeShots: { attempts: number; made: number; percentage: number };
  threePointers: { attempts: number; made: number; percentage: number };
  
  // プレイメイキング
  assists: number;
  turnovers: number;
  assistToTurnoverRatio: number;
  
  // リバウンド
  offensiveRebounds: number;
  defensiveRebounds: number;
  totalRebounds: number;
  reboundRate: number;
  
  // ディフェンス
  steals: number;
  blocks: number;
  defensiveRating: number;
  
  // 高度な指標
  plusMinus: number;
  offensiveRating: number;
  usageRate: number;
  
  // 傾向
  strengths: string[];
  weaknesses: string[];
  tendencies: string[];
  defensiveRole: string;
}

export default function PlayerAnalysis() {
  const { id, playerId } = useParams<{ id: string; playerId: string }>();
  const { data: game } = trpc.games.get.useQuery({ id: id! });
  
  // サンプルデータ（実際はAPIから取得）
  const playerData: PlayerDetailedStats = {
    playerId: playerId!,
    playerName: "田中 太郎",
    jerseyNumber: "10",
    position: "PG",
    points: 18,
    fieldGoalPercentage: 45.5,
    threePointPercentage: 38.5,
    freeThrowPercentage: 85.0,
    effectiveFieldGoalPercentage: 52.3,
    trueShootingPercentage: 58.7,
    shotsAtRim: { attempts: 8, made: 5, percentage: 62.5 },
    midRangeShots: { attempts: 6, made: 2, percentage: 33.3 },
    threePointers: { attempts: 10, made: 4, percentage: 40.0 },
    assists: 7,
    turnovers: 3,
    assistToTurnoverRatio: 2.33,
    offensiveRebounds: 1,
    defensiveRebounds: 4,
    totalRebounds: 5,
    reboundRate: 8.5,
    steals: 2,
    blocks: 0,
    defensiveRating: 108,
    plusMinus: 12,
    offensiveRating: 115,
    usageRate: 28.5,
    strengths: [
      "3Pシュートの精度が高い（38.5%）",
      "アシスト/ターンオーバー比が優秀（2.33）",
      "ペイントアタックが効果的",
      "ピック&ロールでの判断力"
    ],
    weaknesses: [
      "ミドルレンジの成功率が低い（33.3%）",
      "ディフェンスリバウンドが少ない",
      "ブロックショットがない",
      "ファウルトラブルになりやすい"
    ],
    tendencies: [
      "右サイドからのドライブを好む",
      "ピック&ロール後の3Pシュートを多用",
      "第4クォーターで使用率が上昇",
      "プレッシャー下でのターンオーバーが増加"
    ],
    defensiveRole: "ボールプレッシャー重視、オンボールディフェンス"
  };

  const getStatColor = (value: number, threshold: { good: number; average: number }) => {
    if (value >= threshold.good) return "text-green-600";
    if (value >= threshold.average) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number, threshold: { good: number; average: number }) => {
    if (value >= threshold.good) return "bg-green-600";
    if (value >= threshold.average) return "bg-yellow-600";
    return "bg-red-600";
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
          <div>
            <h2 className="text-4xl font-bold mb-2">選手別傾向分析</h2>
            <p className="text-lg text-muted-foreground">
              {playerData.playerName}（#{playerData.jerseyNumber}）の詳細パフォーマンス分析
            </p>
          </div>
        </div>

        {/* 選手基本情報 */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">#{playerData.jerseyNumber}</span>
                </div>
                <div>
                  <CardTitle className="text-3xl">{playerData.playerName}</CardTitle>
                  <CardDescription className="text-lg">{playerData.position} • +/- {playerData.plusMinus}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{playerData.points}</div>
                <div className="text-sm text-muted-foreground">得点</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="shooting" className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="shooting">シュート</TabsTrigger>
            <TabsTrigger value="playmaking">プレイメイク</TabsTrigger>
            <TabsTrigger value="rebounding">リバウンド</TabsTrigger>
            <TabsTrigger value="defense">ディフェンス</TabsTrigger>
            <TabsTrigger value="tendencies">傾向</TabsTrigger>
          </TabsList>

          {/* シュート分析 */}
          <TabsContent value="shooting">
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    シュート効率
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">FG%</span>
                        <span className={`text-sm font-bold ${getStatColor(playerData.fieldGoalPercentage, { good: 45, average: 40 })}`}>
                          {playerData.fieldGoalPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={playerData.fieldGoalPercentage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">3P%</span>
                        <span className={`text-sm font-bold ${getStatColor(playerData.threePointPercentage, { good: 35, average: 30 })}`}>
                          {playerData.threePointPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={playerData.threePointPercentage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">FT%</span>
                        <span className={`text-sm font-bold ${getStatColor(playerData.freeThrowPercentage, { good: 75, average: 65 })}`}>
                          {playerData.freeThrowPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={playerData.freeThrowPercentage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">eFG%</span>
                        <span className={`text-sm font-bold ${getStatColor(playerData.effectiveFieldGoalPercentage, { good: 50, average: 45 })}`}>
                          {playerData.effectiveFieldGoalPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={playerData.effectiveFieldGoalPercentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>シュート分布</CardTitle>
                  <CardDescription>エリア別のシュート成功率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">リム周辺</div>
                        <div className="text-sm text-muted-foreground">
                          {playerData.shotsAtRim.made}/{playerData.shotsAtRim.attempts}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getStatColor(playerData.shotsAtRim.percentage, { good: 60, average: 50 })}`}>
                          {playerData.shotsAtRim.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">ミドルレンジ</div>
                        <div className="text-sm text-muted-foreground">
                          {playerData.midRangeShots.made}/{playerData.midRangeShots.attempts}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getStatColor(playerData.midRangeShots.percentage, { good: 40, average: 35 })}`}>
                          {playerData.midRangeShots.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">3ポイント</div>
                        <div className="text-sm text-muted-foreground">
                          {playerData.threePointers.made}/{playerData.threePointers.attempts}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getStatColor(playerData.threePointers.percentage, { good: 35, average: 30 })}`}>
                          {playerData.threePointers.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* プレイメイキング */}
          <TabsContent value="playmaking">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  プレイメイキング能力
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">{playerData.assists}</div>
                    <div className="text-sm text-muted-foreground">アシスト</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-red-600 mb-2">{playerData.turnovers}</div>
                    <div className="text-sm text-muted-foreground">ターンオーバー</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {playerData.assistToTurnoverRatio.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">AST/TO比</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">使用率（Usage Rate）</span>
                    <span className="text-sm font-bold">{playerData.usageRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={playerData.usageRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    チームのオフェンスにおける関与度
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* リバウンド */}
          <TabsContent value="rebounding">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  リバウンド能力
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-orange-600 mb-2">{playerData.offensiveRebounds}</div>
                    <div className="text-sm text-muted-foreground">オフェンスリバウンド</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{playerData.defensiveRebounds}</div>
                    <div className="text-sm text-muted-foreground">ディフェンスリバウンド</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">{playerData.totalRebounds}</div>
                    <div className="text-sm text-muted-foreground">合計</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">リバウンド率</span>
                    <span className="text-sm font-bold">{playerData.reboundRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={playerData.reboundRate * 2} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ディフェンス */}
          <TabsContent value="defense">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  ディフェンス能力
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-green-600 mb-2">{playerData.steals}</div>
                    <div className="text-sm text-muted-foreground">スティール</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{playerData.blocks}</div>
                    <div className="text-sm text-muted-foreground">ブロック</div>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">{playerData.defensiveRating}</div>
                    <div className="text-sm text-muted-foreground">ディフェンスレーティング</div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">ディフェンスの役割</h4>
                  <p className="text-sm text-muted-foreground">{playerData.defensiveRole}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 傾向 */}
          <TabsContent value="tendencies">
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    強み
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {playerData.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    弱点
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {playerData.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600 mt-1" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    プレイ傾向
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {playerData.tendencies.map((tendency, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm">{tendency}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
