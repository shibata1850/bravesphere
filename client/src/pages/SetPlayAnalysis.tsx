import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Target, AlertTriangle, CheckCircle2, Clock, MapPin, Users, TrendingUp } from "lucide-react";
import { Link, useParams } from "wouter";

interface SetPlayDetail {
  name: string;
  category: string;
  frequency: string;
  successRate: number;
  avgPoints: number;
  situations: string[];
  formation: string;
  steps: {
    step: number;
    action: string;
    players: string[];
    timing: string;
  }[];
  options: {
    name: string;
    condition: string;
    result: string;
  }[];
  counters: {
    strategy: string;
    keyPoints: string[];
    difficulty: "易" | "中" | "難";
  }[];
  videoTimestamps?: string[];
}

export default function SetPlayAnalysis() {
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

  const homeSetPlays: SetPlayDetail[] = [
    {
      name: "Horns Flex",
      category: "ハーフコートオフェンス",
      frequency: "高頻度（試合中15-20回）",
      successRate: 68.5,
      avgPoints: 1.12,
      situations: ["Q1/Q3開始時", "タイムアウト後", "サイドアウト"],
      formation: "2-1-2（ホーンズ）",
      steps: [
        {
          step: 1,
          action: "#10がトップでボールを受ける",
          players: ["田中 太郎 (#10)"],
          timing: "0-2秒",
        },
        {
          step: 2,
          action: "#23がエルボーからベースラインへフレックスカット",
          players: ["佐藤 次郎 (#23)", "伊藤 五郎 (#32)"],
          timing: "2-4秒",
        },
        {
          step: 3,
          action: "#32がハイポストでダウンスクリーン",
          players: ["伊藤 五郎 (#32)", "高橋 四郎 (#15)"],
          timing: "4-6秒",
        },
        {
          step: 4,
          action: "#15がトップへカットアップ、3Pシュート",
          players: ["高橋 四郎 (#15)"],
          timing: "6-8秒",
        },
      ],
      options: [
        {
          name: "オプション1: フレックスカット直接",
          condition: "#23のディフェンダーがスクリーンに引っかかった場合",
          result: "#23がペイントでレイアップ",
        },
        {
          name: "オプション2: ポストアップ",
          condition: "#32がミスマッチを作った場合",
          result: "#32へのエントリーパス→ポストプレー",
        },
        {
          name: "オプション3: ドライブ&キック",
          condition: "#15へのクローズアウトが遅れた場合",
          result: "#10がドライブ→キックアウト",
        },
      ],
      counters: [
        {
          strategy: "スイッチディフェンス",
          keyPoints: [
            "全てのスクリーンでスイッチ",
            "#23のフレックスカットを止める",
            "ミスマッチを最小化",
          ],
          difficulty: "中",
        },
        {
          strategy: "ハイポストプレッシャー",
          keyPoints: [
            "#10へのパスを遅らせる",
            "タイミングを崩す",
            "ショットクロック消費を狙う",
          ],
          difficulty: "易",
        },
        {
          strategy: "ダウンスクリーンのファイトオーバー",
          keyPoints: [
            "#15へのカットを妨害",
            "3Pシュートを打たせない",
            "体力消耗を狙う",
          ],
          difficulty: "難",
        },
      ],
      videoTimestamps: ["Q1 2:35", "Q2 8:12", "Q3 1:45", "Q4 5:23"],
    },
    {
      name: "Spain Pick & Roll",
      category: "ピック&ロール",
      frequency: "中頻度（試合中8-12回）",
      successRate: 72.3,
      avgPoints: 1.28,
      situations: ["クラッチタイム", "スコアリングが必要な場面"],
      formation: "1-4フラット",
      steps: [
        {
          step: 1,
          action: "#10がトップでボールをドリブル",
          players: ["田中 太郎 (#10)"],
          timing: "0-2秒",
        },
        {
          step: 2,
          action: "#32がトップでオンボールスクリーン",
          players: ["伊藤 五郎 (#32)"],
          timing: "2-4秒",
        },
        {
          step: 3,
          action: "#23が#32のディフェンダーにバックスクリーン",
          players: ["佐藤 次郎 (#23)"],
          timing: "3-5秒",
        },
        {
          step: 4,
          action: "#32がフリーでロール、#10からパス",
          players: ["田中 太郎 (#10)", "伊藤 五郎 (#32)"],
          timing: "5-7秒",
        },
      ],
      options: [
        {
          name: "オプション1: PGアタック",
          condition: "ディフェンスがドロップした場合",
          result: "#10がミドルレンジシュート",
        },
        {
          name: "オプション2: ポップアウト",
          condition: "#32のディフェンダーがヘルプに来た場合",
          result: "#32がポップアウトして3Pシュート",
        },
        {
          name: "オプション3: バックスクリーナーへ",
          condition: "ディフェンスが#32に集中した場合",
          result: "#23へのパス→レイアップ",
        },
      ],
      counters: [
        {
          strategy: "バックスクリーン警戒",
          keyPoints: [
            "ロールマンのディフェンダーが早めに察知",
            "バックスクリーンを避ける",
            "コミュニケーション重視",
          ],
          difficulty: "難",
        },
        {
          strategy: "ブリッツ（トラップ）",
          keyPoints: [
            "オンボールスクリーンでトラップ",
            "#10にパスをさせない",
            "ターンオーバー誘発",
          ],
          difficulty: "中",
        },
      ],
      videoTimestamps: ["Q2 3:45", "Q4 1:12", "Q4 0:28"],
    },
  ];

  const awaySetPlays: SetPlayDetail[] = [
    {
      name: "High Pick & Roll (Spread)",
      category: "ピック&ロール",
      frequency: "高頻度（試合中20-25回）",
      successRate: 65.2,
      avgPoints: 1.08,
      situations: ["全クォーター", "トランジション後"],
      formation: "1-4スプレッド",
      steps: [
        {
          step: 1,
          action: "#5がトップでボールをドリブル",
          players: ["山田 一郎 (#5)"],
          timing: "0-2秒",
        },
        {
          step: 2,
          action: "#15がトップでオンボールスクリーン",
          players: ["中村 二郎 (#15)"],
          timing: "2-4秒",
        },
        {
          step: 3,
          action: "#5がペネトレーション、#15がロール",
          players: ["山田 一郎 (#5)", "中村 二郎 (#15)"],
          timing: "4-6秒",
        },
        {
          step: 4,
          action: "フィニッシュまたはキックアウト",
          players: ["山田 一郎 (#5)"],
          timing: "6-8秒",
        },
      ],
      options: [
        {
          name: "オプション1: ロブパス",
          condition: "ディフェンスがドロップした場合",
          result: "#15へのロブパス→ダンク",
        },
        {
          name: "オプション2: フローター",
          condition: "リムプロテクターが待っている場合",
          result: "#5がフローターシュート",
        },
        {
          name: "オプション3: キックアウト3P",
          condition: "ヘルプディフェンスが来た場合",
          result: "コーナーへキックアウト→3Pシュート",
        },
      ],
      counters: [
        {
          strategy: "アンダースクリーン",
          keyPoints: [
            "スクリーンの下を通る",
            "#5のドライブを止める",
            "ビッグマンがドロップ",
          ],
          difficulty: "易",
        },
        {
          strategy: "スイッチ&リカバー",
          keyPoints: [
            "スクリーンでスイッチ",
            "ミスマッチを素早くリカバー",
            "#15のロールを止める",
          ],
          difficulty: "中",
        },
        {
          strategy: "ブリッツ（トラップ）",
          keyPoints: [
            "スクリーンでダブルチーム",
            "#5にパスを強要",
            "ターンオーバー狙い",
          ],
          difficulty: "中",
        },
      ],
      videoTimestamps: ["Q1 5:23", "Q2 6:45", "Q3 4:12", "Q4 7:34"],
    },
  ];

  const renderSetPlayCard = (play: SetPlayDetail) => (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl">{play.name}</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {play.category}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{play.successRate}%</p>
            <p className="text-xs text-muted-foreground">成功率</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{play.avgPoints}</p>
            <p className="text-xs text-muted-foreground">平均得点</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-sm font-bold text-orange-600">{play.frequency}</p>
            <p className="text-xs text-muted-foreground">頻度</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formation & Situations */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              フォーメーション
            </h4>
            <Badge variant="outline" className="text-sm">
              {play.formation}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              使用場面
            </h4>
            <div className="flex flex-wrap gap-2">
              {play.situations.map((s, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            プレイの流れ
          </h4>
          <div className="space-y-3">
            {play.steps.map((step) => (
              <div key={step.step} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{step.timing}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {step.players.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            オプション展開
          </h4>
          <div className="space-y-2">
            {play.options.map((option, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <p className="text-sm font-semibold text-green-600 mb-1">{option.name}</p>
                <p className="text-xs text-muted-foreground mb-1">
                  <span className="font-medium">条件:</span> {option.condition}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">結果:</span> {option.result}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Counters */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            対策戦略
          </h4>
          <div className="space-y-3">
            {play.counters.map((counter, idx) => (
              <Card key={idx} className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{counter.strategy}</CardTitle>
                    <Badge
                      variant={
                        counter.difficulty === "易"
                          ? "default"
                          : counter.difficulty === "中"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      難易度: {counter.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {counter.keyPoints.map((point, pidx) => (
                      <li key={pidx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Timestamps */}
        {play.videoTimestamps && play.videoTimestamps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">映像タイムスタンプ</h4>
            <div className="flex flex-wrap gap-2">
              {play.videoTimestamps.map((ts, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-mono">
                  {ts}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
          <Link href={`/games/${id}/scouting`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-4xl font-bold mb-2">セットプレイ詳細分析</h2>
            <p className="text-lg text-muted-foreground">
              {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="home">{homeTeam?.name || "ホームチーム"}</TabsTrigger>
            <TabsTrigger value="away">{awayTeam?.name || "アウェイチーム"}</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {homeSetPlays.map((play, idx) => (
              <div key={idx}>{renderSetPlayCard(play)}</div>
            ))}
          </TabsContent>

          <TabsContent value="away" className="space-y-6">
            {awaySetPlays.map((play, idx) => (
              <div key={idx}>{renderSetPlayCard(play)}</div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
