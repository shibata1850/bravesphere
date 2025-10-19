import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, Target, TrendingUp, Clock, Dumbbell, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";

interface WeaknessArea {
  category: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  priority: "high" | "medium" | "low";
}

interface TrainingDrill {
  name: string;
  description: string;
  duration: string;
  frequency: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  focusAreas: string[];
  instructions: string[];
  expectedImprovement: string;
}

interface TrainingProgram {
  playerName: string;
  weaknesses: WeaknessArea[];
  drills: TrainingDrill[];
  weeklySchedule: {
    day: string;
    drills: string[];
    duration: string;
  }[];
}

export default function TrainingPlan() {
  const { id, playerId } = useParams<{ id: string; playerId: string }>();
  const [location] = useLocation();

  // サンプルデータ
  const program: TrainingProgram = {
    playerName: "田中 太郎",
    weaknesses: [
      {
        category: "シュート",
        metric: "ミドルレンジFG%",
        currentValue: 33.3,
        targetValue: 40.0,
        priority: "high",
      },
      {
        category: "リバウンド",
        metric: "ディフェンスリバウンド",
        currentValue: 4,
        targetValue: 6,
        priority: "medium",
      },
      {
        category: "ディフェンス",
        metric: "ブロックショット",
        currentValue: 0,
        targetValue: 1,
        priority: "low",
      },
    ],
    drills: [
      {
        name: "ミドルレンジシューティングドリル",
        description: "エルボーとフリースローライン延長線からのジャンプシュート練習",
        duration: "20分",
        frequency: "週5回",
        difficulty: "intermediate",
        focusAreas: ["ミドルレンジFG%", "シュートフォーム", "リズム"],
        instructions: [
          "エルボー（左右）から各10本ずつシュート",
          "フリースローライン延長線から各10本ずつシュート",
          "ドリブルからのプルアップジャンパー 左右各10本",
          "ディフェンダーを想定したフェイク→シュート 各10本",
          "成功率70%を目標に、達成できない場合は追加で練習",
        ],
        expectedImprovement: "4週間で5-7%の成功率向上が期待できます",
      },
      {
        name: "リバウンドポジショニングドリル",
        description: "ボックスアウトとリバウンドタイミングの習得",
        duration: "15分",
        frequency: "週4回",
        difficulty: "intermediate",
        focusAreas: ["ディフェンスリバウンド", "ポジショニング", "フィジカル"],
        instructions: [
          "パートナーと1対1でボックスアウト練習（5分）",
          "3人組でのリバウンド競争（5分）",
          "シュートミスからの素早いポジション取り（5分）",
          "ボールの軌道予測トレーニング",
        ],
        expectedImprovement: "1試合あたり平均2本のリバウンド増加が見込めます",
      },
      {
        name: "バーティカルジャンプ強化",
        description: "ブロックショットとリバウンドのためのジャンプ力向上",
        duration: "25分",
        frequency: "週3回",
        difficulty: "advanced",
        focusAreas: ["ブロックショット", "ジャンプ力", "爆発力"],
        instructions: [
          "ボックスジャンプ 3セット × 10回",
          "デプスジャンプ 3セット × 8回",
          "バウンディング 3セット × 20m",
          "ウォールタッチジャンプ 3セット × 15回",
          "ストレッチとクールダウン（5分）",
        ],
        expectedImprovement: "8週間でバーティカルジャンプ5-8cm向上",
      },
      {
        name: "ハンドアイコーディネーション",
        description: "ブロックショットのタイミングと手の位置を改善",
        duration: "15分",
        frequency: "週4回",
        difficulty: "beginner",
        focusAreas: ["ブロックショット", "タイミング", "反応速度"],
        instructions: [
          "テニスボールキャッチドリル（5分）",
          "パートナーとのブロック練習（5分）",
          "壁に向かってのブロックシミュレーション（5分）",
        ],
        expectedImprovement: "ブロック成功率が向上し、ファウルが減少",
      },
      {
        name: "フットワーク＆アジリティ",
        description: "ディフェンスポジショニングと反応速度の向上",
        duration: "20分",
        frequency: "週5回",
        difficulty: "intermediate",
        focusAreas: ["ディフェンス", "機動力", "反応速度"],
        instructions: [
          "ラダードリル 5種類 × 2セット",
          "コーンドリル（ジグザグ、バックペダル）",
          "ディフェンススライド 3セット × 30秒",
          "リアクションドリル（パートナーの動きに反応）",
        ],
        expectedImprovement: "ディフェンスでの対応力が大幅に向上",
      },
    ],
    weeklySchedule: [
      {
        day: "月曜日",
        drills: ["ミドルレンジシューティングドリル", "フットワーク＆アジリティ"],
        duration: "40分",
      },
      {
        day: "火曜日",
        drills: ["リバウンドポジショニングドリル", "ハンドアイコーディネーション"],
        duration: "30分",
      },
      {
        day: "水曜日",
        drills: ["ミドルレンジシューティングドリル", "バーティカルジャンプ強化"],
        duration: "45分",
      },
      {
        day: "木曜日",
        drills: ["リバウンドポジショニングドリル", "フットワーク＆アジリティ"],
        duration: "35分",
      },
      {
        day: "金曜日",
        drills: ["ミドルレンジシューティングドリル", "ハンドアイコーディネーション", "バーティカルジャンプ強化"],
        duration: "60分",
      },
      {
        day: "土曜日",
        drills: ["リバウンドポジショニングドリル", "フットワーク＆アジリティ"],
        duration: "35分",
      },
      {
        day: "日曜日",
        drills: ["休養日（ストレッチ・軽いシューティングのみ）"],
        duration: "30分",
      },
    ],
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge variant="secondary">初級</Badge>;
      case "intermediate":
        return <Badge variant="default">中級</Badge>;
      case "advanced":
        return <Badge variant="destructive">上級</Badge>;
      default:
        return <Badge>-</Badge>;
    }
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
          <Link href={`/games/${id}/compare?player1=${playerId}&player2=23`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">個別トレーニングプログラム</h2>
            <p className="text-lg text-muted-foreground">
              {program.playerName} 専用の強化メニュー
            </p>
          </div>
          <Link href={`/players/${playerId}/progress`}>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              進捗を追跡
            </Button>
          </Link>
        </div>

        {/* 弱点分析 */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              改善が必要なエリア
            </CardTitle>
            <CardDescription>比較分析から特定された弱点</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {program.weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${getPriorityColor(weakness.priority)}`} />
                    <div>
                      <div className="font-semibold">{weakness.metric}</div>
                      <div className="text-sm text-muted-foreground">{weakness.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">現在値 → 目標値</div>
                    <div className="font-bold">
                      {weakness.currentValue} → {weakness.targetValue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* トレーニングドリル */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            推奨トレーニングドリル
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {program.drills.map((drill, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{drill.name}</CardTitle>
                    {getDifficultyBadge(drill.difficulty)}
                  </div>
                  <CardDescription>{drill.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{drill.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{drill.frequency}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">強化ポイント</h4>
                    <div className="flex flex-wrap gap-2">
                      {drill.focusAreas.map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">実施方法</h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      {drill.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-semibold">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {drill.expectedImprovement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 週間スケジュール */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              週間トレーニングスケジュール
            </CardTitle>
            <CardDescription>継続的な改善のための計画</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {program.weeklySchedule.map((schedule, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{schedule.day}</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.drills.join(" + ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{schedule.duration}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card className="mt-8 border-2 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">重要な注意事項</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• トレーニング前には必ず十分なウォームアップを行ってください</p>
            <p>• 痛みや違和感を感じた場合は、すぐに中止して休養を取ってください</p>
            <p>• 水分補給と栄養管理を徹底してください</p>
            <p>• 週に1-2日は完全休養日を設けて、身体の回復を優先してください</p>
            <p>• 4週間ごとに進捗を確認し、必要に応じてメニューを調整してください</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
