import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, Calendar, TrendingUp, Target, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface TrainingLog {
  id: string;
  drillName: string;
  date: string;
  completed: boolean;
  duration: number;
  successRate: number;
  notes: string;
}

interface Measurement {
  id: string;
  metricName: string;
  date: string;
  value: number;
  unit: string;
}

export default function TrainingProgress() {
  const { playerId } = useParams<{ playerId: string }>();
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);

  // TODO: APIからデータを取得する
  const playerName = "";

  const trainingLogs: TrainingLog[] = [];

  const measurements: Measurement[] = [];

  // 週次統計
  const thisWeekLogs = trainingLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logDate >= weekAgo && logDate <= today;
  });

  const completedThisWeek = thisWeekLogs.filter(log => log.completed).length;
  const totalThisWeek = thisWeekLogs.length;
  const weeklyCompletionRate = totalThisWeek > 0 ? ((completedThisWeek / totalThisWeek) * 100).toFixed(0) : "0";

  const avgSuccessRate = thisWeekLogs.filter(log => log.completed).reduce((sum, log) => sum + log.successRate, 0) / (completedThisWeek || 1);

  // 月次統計
  const thisMonthLogs = trainingLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
  });

  const completedThisMonth = thisMonthLogs.filter(log => log.completed).length;
  const totalThisMonth = thisMonthLogs.length;
  const monthlyCompletionRate = totalThisMonth > 0 ? ((completedThisMonth / totalThisMonth) * 100).toFixed(0) : "0";

  const totalDuration = thisMonthLogs.filter(log => log.completed).reduce((sum, log) => sum + log.duration, 0);

  // 継続日数（連続でトレーニングした日数）
  const streak = 0; // TODO: APIから取得

  const renderLineChart = (data: { date: string; value: number }[], label: string, color: string) => {
    if (data.length === 0) return <div className="text-center text-muted-foreground py-8">データがありません</div>;
    
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    return (
      <div className="relative h-48 border rounded-lg p-4 bg-muted/20">
        <div className="absolute top-2 left-4 text-sm font-semibold text-muted-foreground">{label}</div>
        <svg className="w-full h-full" viewBox="0 0 800 180" preserveAspectRatio="none">
          <polyline
            points={data.map((d, idx) => {
              const x = (idx / (data.length - 1)) * 780 + 10;
              const y = 170 - ((d.value - min) / range) * 150;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, idx) => {
            const x = (idx / (data.length - 1)) * 780 + 10;
            const y = 170 - ((d.value - min) / range) * 150;
            return (
              <circle key={idx} cx={x} cy={y} r="4" fill={color} />
            );
          })}
        </svg>
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">{data[0].date}</div>
        <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">{data[data.length - 1].date}</div>
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
          <Link href={`/games/1/training/${playerId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">トレーニング進捗追跡</h2>
            <p className="text-lg text-muted-foreground">
              {playerName}の成長記録
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  トレーニング記録
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>トレーニング記録を追加</DialogTitle>
                  <DialogDescription>今日のトレーニング内容を記録しましょう</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>ドリル名</Label>
                    <Input placeholder="例: ミドルレンジシューティングドリル" />
                  </div>
                  <div className="space-y-2">
                    <Label>実施時間（分）</Label>
                    <Input type="number" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label>成功率（%）</Label>
                    <Input type="number" placeholder="70" />
                  </div>
                  <div className="space-y-2">
                    <Label>メモ</Label>
                    <Textarea placeholder="今日の気づきや改善点を記録..." />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="completed" />
                    <Label htmlFor="completed">完了</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLogDialogOpen(false)}>キャンセル</Button>
                  <Button onClick={() => { toast.success("記録を追加しました"); setLogDialogOpen(false); }}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  測定値を記録
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>測定値を記録</DialogTitle>
                  <DialogDescription>定期的な測定で成長を追跡しましょう</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>指標名</Label>
                    <Input placeholder="例: ミドルレンジFG%" />
                  </div>
                  <div className="space-y-2">
                    <Label>測定値</Label>
                    <Input type="number" placeholder="42.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>単位</Label>
                    <Input placeholder="例: %" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMeasurementDialogOpen(false)}>キャンセル</Button>
                  <Button onClick={() => { toast.success("測定値を記録しました"); setMeasurementDialogOpen(false); }}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-green-500/50">
            <CardHeader className="pb-3">
              <CardDescription>今週の達成率</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {weeklyCompletionRate}%
                <TrendingUp className="h-6 w-6 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {completedThisWeek}/{totalThisWeek} 完了
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/50">
            <CardHeader className="pb-3">
              <CardDescription>今月の総時間</CardDescription>
              <CardTitle className="text-3xl">{totalDuration}分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {completedThisMonth}回のトレーニング
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/50">
            <CardHeader className="pb-3">
              <CardDescription>平均成功率</CardDescription>
              <CardTitle className="text-3xl">{avgSuccessRate.toFixed(0)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                今週の平均
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/50">
            <CardHeader className="pb-3">
              <CardDescription>継続日数</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {streak}日
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                連続トレーニング
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">日次記録</TabsTrigger>
            <TabsTrigger value="weekly">週次レポート</TabsTrigger>
            <TabsTrigger value="monthly">月次レポート</TabsTrigger>
          </TabsList>

          {/* 日次記録タブ */}
          <TabsContent value="daily" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  トレーニング記録
                </CardTitle>
                <CardDescription>日々のトレーニング実施状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainingLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-4">
                        {log.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold">{log.drillName}</div>
                          <div className="text-sm text-muted-foreground">{log.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {log.completed && (
                          <>
                            <div className="font-bold">{log.duration}分 / {log.successRate}%</div>
                            {log.notes && (
                              <div className="text-xs text-muted-foreground mt-1">{log.notes}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 週次レポートタブ */}
          <TabsContent value="weekly" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>今週の達成状況</CardTitle>
                <CardDescription>過去7日間のトレーニング実績</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">完了したトレーニング</div>
                      <div className="text-sm text-muted-foreground">計画通りに実施</div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{completedThisWeek}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">未完了のトレーニング</div>
                      <div className="text-sm text-muted-foreground">次週に持ち越し</div>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{totalThisWeek - completedThisWeek}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">平均成功率</div>
                      <div className="text-sm text-muted-foreground">ドリルの質</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{avgSuccessRate.toFixed(0)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>指標の推移（週次）</CardTitle>
                <CardDescription>測定値の変化を確認</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderLineChart(
                  measurements.filter(m => m.metricName === "ミドルレンジFG%").map(m => ({ date: m.date, value: m.value / 10 })),
                  "ミドルレンジFG%",
                  "#f59e0b"
                )}
                {renderLineChart(
                  measurements.filter(m => m.metricName === "リバウンド数").map(m => ({ date: m.date, value: m.value })),
                  "リバウンド数",
                  "#8b5cf6"
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 月次レポートタブ */}
          <TabsContent value="monthly" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>今月の総括</CardTitle>
                <CardDescription>月間のトレーニング実績と成長</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">総トレーニング時間</div>
                      <div className="text-sm text-muted-foreground">今月の累計</div>
                    </div>
                    <div className="text-3xl font-bold text-primary">{totalDuration}分</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">完了率</div>
                      <div className="text-sm text-muted-foreground">計画達成度</div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{monthlyCompletionRate}%</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold">トレーニング回数</div>
                      <div className="text-sm text-muted-foreground">完了したセッション</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{completedThisMonth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>月間成長グラフ</CardTitle>
                <CardDescription>1ヶ月の成長を可視化</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderLineChart(
                  measurements.filter(m => m.metricName === "ミドルレンジFG%").map(m => ({ date: m.date, value: m.value / 10 })),
                  "ミドルレンジFG% (33.3% → 41.5%)",
                  "#22c55e"
                )}
                {renderLineChart(
                  measurements.filter(m => m.metricName === "リバウンド数").map(m => ({ date: m.date, value: m.value })),
                  "リバウンド数 (4回 → 6回)",
                  "#3b82f6"
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  今月のハイライト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Badge variant="default" className="mt-0.5">達成</Badge>
                    <span>ミドルレンジFG%が8.2ポイント向上（33.3% → 41.5%）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="default" className="mt-0.5">達成</Badge>
                    <span>リバウンド数が平均2回増加（4回 → 6回）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="default" className="mt-0.5">継続</Badge>
                    <span>5日間連続でトレーニングを実施</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge className="mt-0.5 bg-orange-600">改善点</Badge>
                    <span>バーティカルジャンプ強化の実施率が低い（要改善）</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
