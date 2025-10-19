import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Target, Users, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Drill {
  name: string;
  duration: number;
  description: string;
}

interface Practice {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  location: string;
  focus: string;
  drills: Drill[];
  attendance: { playerId: string; playerName: string; attended: boolean }[];
  notes: string;
}

export default function TeamPractice() {
  const { teamId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // サンプルデータ
  const practices: Practice[] = [
    {
      id: "1",
      title: "オフェンス強化練習",
      description: "ピック&ロールとトランジションオフェンスを中心に",
      date: "2025-01-25",
      duration: 120,
      location: "メインアリーナ",
      focus: "オフェンス",
      drills: [
        { name: "ウォームアップ", duration: 15, description: "ストレッチとランニング" },
        { name: "ピック&ロールドリル", duration: 30, description: "スクリーナーとボールハンドラーの連携" },
        { name: "トランジション3on2", duration: 25, description: "速攻の判断力向上" },
        { name: "5on5スクリメージ", duration: 40, description: "実戦形式" },
        { name: "クールダウン", duration: 10, description: "ストレッチ" },
      ],
      attendance: [
        { playerId: "1", playerName: "田中 太郎", attended: true },
        { playerId: "2", playerName: "佐藤 次郎", attended: true },
        { playerId: "3", playerName: "鈴木 三郎", attended: false },
      ],
      notes: "全体的に良い動きだった。ピック&ロールのタイミングをもう少し改善する必要あり。",
    },
    {
      id: "2",
      title: "ディフェンス戦術練習",
      description: "ゾーンディフェンスとトラップの練習",
      date: "2025-01-27",
      duration: 90,
      location: "サブコート",
      focus: "ディフェンス",
      drills: [
        { name: "ウォームアップ", duration: 10, description: "ディフェンススライド" },
        { name: "2-3ゾーンドリル", duration: 25, description: "ポジショニングとローテーション" },
        { name: "トラップ練習", duration: 20, description: "コーナーとサイドラインでのトラップ" },
        { name: "5on5ディフェンス", duration: 30, description: "実戦形式" },
        { name: "クールダウン", duration: 5, description: "ストレッチ" },
      ],
      attendance: [
        { playerId: "1", playerName: "田中 太郎", attended: true },
        { playerId: "2", playerName: "佐藤 次郎", attended: true },
        { playerId: "3", playerName: "鈴木 三郎", attended: true },
      ],
      notes: "ゾーンディフェンスのローテーションが改善された。次回はプレスディフェンスも追加。",
    },
  ];

  const upcomingPractices = practices.filter(p => new Date(p.date) >= new Date());
  const pastPractices = practices.filter(p => new Date(p.date) < new Date());

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/teams`}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-4xl font-bold mb-2">チーム練習メニュー</h2>
              <p className="text-lg text-muted-foreground">
                練習計画の作成と出席管理
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                練習を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新しい練習を追加</DialogTitle>
                <DialogDescription>
                  練習の詳細情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input id="title" placeholder="例: オフェンス強化練習" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" placeholder="練習の目的や内容" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">日時</Label>
                    <Input id="date" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">時間（分）</Label>
                    <Input id="duration" type="number" placeholder="120" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">場所</Label>
                    <Input id="location" placeholder="メインアリーナ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="focus">フォーカス</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offense">オフェンス</SelectItem>
                        <SelectItem value="defense">ディフェンス</SelectItem>
                        <SelectItem value="physical">フィジカル</SelectItem>
                        <SelectItem value="tactical">戦術</SelectItem>
                        <SelectItem value="mixed">総合</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 今後の練習 */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">今後の練習</h3>
          <div className="grid gap-6">
            {upcomingPractices.map((practice) => (
              <Card key={practice.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{practice.title}</CardTitle>
                      <CardDescription className="text-base">{practice.description}</CardDescription>
                    </div>
                    <Badge variant={practice.focus === "オフェンス" ? "default" : "secondary"}>
                      {practice.focus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(practice.date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{practice.duration}分</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{practice.location}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      ドリル内容
                    </h4>
                    <div className="space-y-2">
                      {practice.drills.map((drill, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{drill.name}</div>
                            <div className="text-sm text-muted-foreground">{drill.description}</div>
                          </div>
                          <Badge variant="outline">{drill.duration}分</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      出席予定
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {practice.attendance.map((att) => (
                        <Badge key={att.playerId} variant={att.attended ? "default" : "secondary"}>
                          {att.playerName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 過去の練習 */}
        <div>
          <h3 className="text-2xl font-bold mb-6">過去の練習</h3>
          <div className="grid gap-6">
            {pastPractices.map((practice) => (
              <Card key={practice.id} className="border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{practice.title}</CardTitle>
                      <CardDescription>{practice.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{practice.focus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(practice.date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{practice.duration}分</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{practice.location}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      出席状況
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {practice.attendance.map((att) => (
                        <div key={att.playerId} className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-sm">
                          {att.attended ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span>{att.playerName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {practice.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-1">メモ</div>
                      <div className="text-sm text-muted-foreground">{practice.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
