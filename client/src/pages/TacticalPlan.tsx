import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Target, Shield, Users, Zap, TrendingUp, CheckCircle2, AlertTriangle, Lightbulb, Download } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

interface TacticalStrategy {
  category: string;
  priority: "high" | "medium" | "low";
  strategies: {
    title: string;
    description: string;
    keyPoints: string[];
    expectedOutcome: string;
  }[];
}

export default function TacticalPlan() {
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

  const exportPDF = trpc.pdf.generateTacticalPlan.useMutation({
    onSuccess: (data) => {
      toast.success("戦術案PDFを生成しました");
      window.open(data.url, "_blank");
    },
    onError: () => {
      toast.error("PDF生成に失敗しました");
    },
  });

  const handleExportPDF = () => {
    exportPDF.mutate({ gameId: id! });
  };

  // スカウティングレポートから導出された戦術案
  const offensiveStrategies: TacticalStrategy = {
    category: "オフェンス戦術",
    priority: "high",
    strategies: [
      {
        title: "相手#32（センター）の弱点を突く速攻",
        description: "スカウティングレポートより、相手センター#32はスピードに弱点があることが判明。リバウンド後の速攻を重視し、トランジションで数的優位を作る。",
        keyPoints: [
          "ディフェンスリバウンド確保後、即座にアウトレットパス",
          "#10（PG）がボールを運び、サイドレーンを走る#23をターゲット",
          "相手#32が戻る前にペイントアタックまたはレイアップ",
          "セカンダリーブレイクで3Pシューター#15をスポットアップ配置",
        ],
        expectedOutcome: "試合中10-15回の速攻機会を創出し、イージーバスケット8-10点を獲得",
      },
      {
        title: "ピック&ロールで相手のスイッチディフェンスを攻略",
        description: "相手はピック&ロールに対してスイッチディフェンスを多用。ミスマッチを作り出し、#10 vs #32のマッチアップを狙う。",
        keyPoints: [
          "#10と#32のピック&ロールを頻繁に実行",
          "スイッチ後、#10が#32（スピード劣位）を1on1で攻める",
          "ヘルプが来たら逆サイドの#15（3Pシューター）へキックアウト",
          "リジェクト（スクリーンを使わない）オプションも用意",
        ],
        expectedOutcome: "ミスマッチから1試合で15-20点、アシストから10点を追加",
      },
      {
        title: "3Pシュートの本数を増やす（相手の弱点）",
        description: "相手は3Pディフェンスが弱く、特にコーナー3Pの成功率が低い。スペーシングを重視し、3Pアテンプトを増やす。",
        keyPoints: [
          "5アウトフォーメーションで相手ディフェンスを広げる",
          "ドライブ&キックで#15と#23にコーナー3Pを供給",
          "1試合30本以上の3Pアテンプトを目標（通常20本）",
          "オフェンスリバウンドのポジショニングを工夫",
        ],
        expectedOutcome: "3P成功率35%で30本打てば、追加で10-12点を獲得",
      },
    ],
  };

  const defensiveStrategies: TacticalStrategy = {
    category: "ディフェンス戦術",
    priority: "high",
    strategies: [
      {
        title: "相手#5（PG）のドライブを封じる",
        description: "相手の主力#5はドライブが強みだが3Pシュートが弱点。ペイントを守り、外からのシュートは許容する。",
        keyPoints: [
          "#10が#5をタイトにマーク、ドライブコースを塞ぐ",
          "ヘルプディフェンスは早めにペイントに寄る",
          "#5が3Pを打つ場合はクローズアウトを遅らせる",
          "ピック&ロールではアンダースクリーンで対応",
        ],
        expectedOutcome: "#5のペイントアタックを試合中15回→8回に削減、得点効率を低下",
      },
      {
        title: "相手のセットプレー「Horns Flex」を破壊",
        description: "相手は試合中15-20回「Horns Flex」を実行。このプレーを事前に読み、カウンター戦術を準備。",
        keyPoints: [
          "ホーンズフォーメーションを認識したら全員で声を掛け合う",
          "ベースラインカットをする#23をファイトオーバーで追う",
          "トップの#15（3Pシューター）へのパスコースを塞ぐ",
          "ダウンスクリーンを早めに察知してスイッチまたはショー",
        ],
        expectedOutcome: "Horns Flexからの得点を試合中12点→4点に削減",
      },
      {
        title: "トランジションディフェンスの徹底",
        description: "相手も速攻を狙ってくるため、トランジションディフェンスを最優先。",
        keyPoints: [
          "シュート後、全員が即座にバックコート",
          "ボールマンにプレッシャー、サイドレーンを走る選手をマーク",
          "ペイントを最優先で守る（レイアップを許さない）",
          "セーフティ（最後尾）は#32が担当",
        ],
        expectedOutcome: "相手の速攻得点を試合中15点→8点に削減",
      },
    ],
  };

  const specialSituations: TacticalStrategy = {
    category: "特殊状況",
    priority: "medium",
    strategies: [
      {
        title: "BLOB/SLOB対策",
        description: "相手のアウトオブバウンズプレーを事前に把握し、対策を準備。",
        keyPoints: [
          "BLOB「Box Set」: #32のスクリーンをスイッチ、ゴール下を守る",
          "SLOB「Stagger Screen」: #15（3Pシューター）を早めにマーク",
          "タイムアウト後は特に警戒",
        ],
        expectedOutcome: "BLOB/SLOBからの得点を試合中8点→3点に削減",
      },
      {
        title: "クラッチタイム（残り5分）の戦術",
        description: "接戦時の戦術を明確化。オフェンス・ディフェンス両面で最適な選択を。",
        keyPoints: [
          "オフェンス: #10と#32のピック&ロール、時間を使って確実に得点",
          "ディフェンス: スイッチディフェンスでミスマッチを最小化",
          "ファウルトラブルを避ける（特に#32）",
          "タイムアウトを効果的に使う（残り3分、1分、30秒）",
        ],
        expectedOutcome: "クラッチタイムでの勝率を向上",
      },
    ],
  };

  const playerAssignments = [
    {
      player: "#10 田中（PG）",
      role: "オフェンスの起点",
      tasks: [
        "速攻のトリガー役",
        "ピック&ロールでミスマッチを作る",
        "相手#5のドライブを封じる",
      ],
    },
    {
      player: "#23 佐藤（SG）",
      role: "サイドアタッカー",
      tasks: [
        "速攻のサイドレーンを走る",
        "コーナー3Pを積極的に狙う",
        "相手#23のベースラインカットを追う",
      ],
    },
    {
      player: "#15 高橋（SF）",
      role: "3Pスペシャリスト",
      tasks: [
        "スポットアップ3Pを量産",
        "スペーシングを維持",
        "相手#15（3Pシューター）をタイトマーク",
      ],
    },
    {
      player: "#32 伊藤（C）",
      role: "リムプロテクター",
      tasks: [
        "ディフェンスリバウンド確保",
        "ピック&ロールのスクリーナー",
        "ペイントを守る、ヘルプディフェンス",
        "トランジションディフェンスのセーフティ",
      ],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">最優先</Badge>;
      case "medium":
        return <Badge variant="secondary">重要</Badge>;
      case "low":
        return <Badge variant="outline">補助</Badge>;
      default:
        return null;
    }
  };

  const renderStrategySection = (strategy: TacticalStrategy) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {strategy.category === "オフェンス戦術" && <Target className="h-6 w-6 text-orange-600" />}
          {strategy.category === "ディフェンス戦術" && <Shield className="h-6 w-6 text-blue-600" />}
          {strategy.category === "特殊状況" && <Zap className="h-6 w-6 text-yellow-600" />}
          {strategy.category}
        </h3>
        {getPriorityBadge(strategy.priority)}
      </div>
      <div className="grid gap-6">
        {strategy.strategies.map((strat, idx) => (
          <Card key={idx} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {strat.title}
              </CardTitle>
              <CardDescription>{strat.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  実行ポイント
                </h4>
                <ul className="space-y-1">
                  {strat.keyPoints.map((point, pidx) => (
                    <li key={pidx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  期待される効果
                </h4>
                <p className="text-sm text-muted-foreground">{strat.expectedOutcome}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/games/${id}/scouting`}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-4xl font-bold mb-2">次の試合の戦術案</h2>
              <p className="text-lg text-muted-foreground">
                スカウティングレポートを基に生成された具体的な戦術プラン
              </p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={exportPDF.isPending} className="gap-2">
            <Download className="h-4 w-4" />
            {exportPDF.isPending ? "生成中..." : "PDFでエクスポート"}
          </Button>
        </div>

        {/* 試合情報 */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>対戦カード</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 text-2xl font-bold">
              <span>{homeTeam?.name || "ホームチーム"}</span>
              <span className="text-muted-foreground">vs</span>
              <span>{awayTeam?.name || "アウェイチーム"}</span>
            </div>
            {game && (
              <p className="text-center text-muted-foreground mt-2">
                {new Date(game.gameDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="offense" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="offense">オフェンス</TabsTrigger>
            <TabsTrigger value="defense">ディフェンス</TabsTrigger>
            <TabsTrigger value="special">特殊状況</TabsTrigger>
            <TabsTrigger value="players">選手別役割</TabsTrigger>
          </TabsList>

          <TabsContent value="offense">
            {renderStrategySection(offensiveStrategies)}
          </TabsContent>

          <TabsContent value="defense">
            {renderStrategySection(defensiveStrategies)}
          </TabsContent>

          <TabsContent value="special">
            {renderStrategySection(specialSituations)}
          </TabsContent>

          <TabsContent value="players">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                選手別の役割とタスク
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {playerAssignments.map((assignment, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{assignment.player}</CardTitle>
                      <CardDescription>{assignment.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assignment.tasks.map((task, tidx) => (
                          <li key={tidx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* サマリー */}
        <Card className="mt-8 border-2 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              戦術実行時の注意点
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">• 相手が戦術を変更してきた場合は、ベンチからの指示を待つ</p>
            <p className="text-sm">• ファウルトラブルに注意し、主力選手を温存する場面を見極める</p>
            <p className="text-sm">• タイムアウトは計画的に使用（各クォーター1回、クラッチタイムに2回確保）</p>
            <p className="text-sm">• 選手のコンディションを常に確認し、疲労が見えたら早めに交代</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
