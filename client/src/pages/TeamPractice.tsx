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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Drill {
  name: string;
  duration: number;
  description: string;
}

export default function TeamPractice() {
  const { teamId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [focus, setFocus] = useState("");

  const utils = trpc.useUtils();

  // Fetch practices from API
  const { data: practices = [], isLoading } = trpc.teamPractices.listByTeam.useQuery(
    { teamId: teamId || "" },
    { enabled: !!teamId }
  );

  // Create practice mutation
  const createPractice = trpc.teamPractices.create.useMutation({
    onSuccess: () => {
      utils.teamPractices.listByTeam.invalidate({ teamId: teamId || "" });
      setIsDialogOpen(false);
      resetForm();
      toast.success("練習を追加しました");
    },
    onError: (error) => {
      toast.error("練習の追加に失敗しました: " + error.message);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPracticeDate("");
    setDuration("");
    setLocation("");
    setFocus("");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }
    if (!practiceDate) {
      toast.error("日時を入力してください");
      return;
    }
    if (!duration || parseInt(duration) <= 0) {
      toast.error("時間（分）を入力してください");
      return;
    }
    if (!teamId) {
      toast.error("チームIDが指定されていません");
      return;
    }

    createPractice.mutate({
      teamId,
      title: title.trim(),
      description: description.trim() || undefined,
      practiceDate: new Date(practiceDate).toISOString(),
      duration: parseInt(duration),
      location: location.trim() || undefined,
      focus: focus || undefined,
    });
  };

  const now = new Date();
  const upcomingPractices = practices.filter(p => new Date(p.practiceDate) >= now);
  const pastPractices = practices.filter(p => new Date(p.practiceDate) < now);

  const getFocusLabel = (focusValue: string | null) => {
    const focusMap: Record<string, string> = {
      offense: "オフェンス",
      defense: "ディフェンス",
      physical: "フィジカル",
      tactical: "戦術",
      mixed: "総合",
    };
    return focusValue ? focusMap[focusValue] || focusValue : "";
  };

  const parseDrills = (drillsJson: string | null): Drill[] => {
    if (!drillsJson) return [];
    try {
      return JSON.parse(drillsJson);
    } catch {
      return [];
    }
  };

  const parseAttendance = (attendanceJson: string | null): { playerId: string; playerName: string; attended: boolean }[] => {
    if (!attendanceJson) return [];
    try {
      return JSON.parse(attendanceJson);
    } catch {
      return [];
    }
  };

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
                  <Input
                    id="title"
                    placeholder="例: オフェンス強化練習"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    placeholder="練習の目的や内容"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">日時</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={practiceDate}
                      onChange={(e) => setPracticeDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">時間（分）</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="120"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">場所</Label>
                    <Input
                      id="location"
                      placeholder="メインアリーナ"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="focus">フォーカス</Label>
                    <Select value={focus} onValueChange={setFocus}>
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
                <Button onClick={handleCreate} disabled={createPractice.isPending}>
                  {createPractice.isPending ? "追加中..." : "追加"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            読み込み中...
          </div>
        ) : (
          <>
            {/* 今後の練習 */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">今後の練習</h3>
              {upcomingPractices.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    今後の練習予定はありません
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {upcomingPractices.map((practice) => {
                    const drills = parseDrills(practice.drills);
                    const attendance = parseAttendance(practice.attendance);
                    return (
                      <Card key={practice.id} className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-2xl mb-2">{practice.title}</CardTitle>
                              <CardDescription className="text-base">{practice.description}</CardDescription>
                            </div>
                            {practice.focus && (
                              <Badge variant={practice.focus === "offense" ? "default" : "secondary"}>
                                {getFocusLabel(practice.focus)}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(practice.practiceDate).toLocaleDateString('ja-JP')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{practice.duration}分</span>
                            </div>
                            {practice.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{practice.location}</span>
                              </div>
                            )}
                          </div>

                          {drills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                ドリル内容
                              </h4>
                              <div className="space-y-2">
                                {drills.map((drill, idx) => (
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
                          )}

                          {attendance.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                出席予定
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {attendance.map((att) => (
                                  <Badge key={att.playerId} variant={att.attended ? "default" : "secondary"}>
                                    {att.playerName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 過去の練習 */}
            <div>
              <h3 className="text-2xl font-bold mb-6">過去の練習</h3>
              {pastPractices.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    過去の練習記録はありません
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pastPractices.map((practice) => {
                    const attendance = parseAttendance(practice.attendance);
                    return (
                      <Card key={practice.id} className="border hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{practice.title}</CardTitle>
                              <CardDescription>{practice.description}</CardDescription>
                            </div>
                            {practice.focus && (
                              <Badge variant="outline">{getFocusLabel(practice.focus)}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(practice.practiceDate).toLocaleDateString('ja-JP')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{practice.duration}分</span>
                            </div>
                            {practice.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{practice.location}</span>
                              </div>
                            )}
                          </div>

                          {attendance.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                出席状況
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {attendance.map((att) => (
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
                          )}

                          {practice.notes && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-sm font-medium mb-1">メモ</div>
                              <div className="text-sm text-muted-foreground">{practice.notes}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
