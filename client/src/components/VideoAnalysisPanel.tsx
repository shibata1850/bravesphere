import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Play, Plus, Check, X, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface VideoAnalysisPanelProps {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
}

export function VideoAnalysisPanel({ gameId, homeTeamId, awayTeamId }: VideoAnalysisPanelProps) {
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    timestamp: 0,
    eventType: "shot" as const,
    teamId: homeTeamId,
    playerNumber: undefined as number | undefined,
    xCoord: undefined as number | undefined,
    yCoord: undefined as number | undefined,
    success: undefined as boolean | undefined,
    shotType: undefined as "2P" | "3P" | "FT" | undefined,
    description: "",
  });

  const utils = trpc.useUtils();

  // 解析ジョブのステータスを取得
  const jobStatusQuery = trpc.videoAnalysis.getJobStatus.useQuery({ gameId });
  const jobStatus = jobStatusQuery.data;
  
  // 解析中は2秒ごとにポーリング
  if (jobStatus && (jobStatus.status === "downloading" || jobStatus.status === "analyzing_video" || jobStatus.status === "analyzing_events" || jobStatus.status === "queued")) {
    setTimeout(() => jobStatusQuery.refetch(), 2000);
  }

  // イベント一覧を取得
  const { data: events = [] } = trpc.videoAnalysis.getGameEvents.useQuery({ gameId });

  // 解析ジョブを作成
  const createJobMutation = trpc.videoAnalysis.createJob.useMutation({
    onSuccess: () => {
      utils.videoAnalysis.getJobStatus.invalidate({ gameId });
    },
  });

  // 手動イベントを作成
  const createEventMutation = trpc.videoAnalysis.createManualEvent.useMutation({
    onSuccess: () => {
      utils.videoAnalysis.getGameEvents.invalidate({ gameId });
      setIsAddEventDialogOpen(false);
      resetNewEvent();
    },
  });

  // イベントを削除
  const deleteEventMutation = trpc.videoAnalysis.deleteEvent.useMutation({
    onSuccess: () => {
      utils.videoAnalysis.getGameEvents.invalidate({ gameId });
    },
  });

  // イベントを検証
  const verifyEventMutation = trpc.videoAnalysis.verifyEvent.useMutation({
    onSuccess: () => {
      utils.videoAnalysis.getGameEvents.invalidate({ gameId });
    },
  });

  const resetNewEvent = () => {
    setNewEvent({
      timestamp: 0,
      eventType: "shot",
      teamId: homeTeamId,
      playerNumber: undefined,
      xCoord: undefined,
      yCoord: undefined,
      success: undefined,
      shotType: undefined,
      description: "",
    });
  };

  const handleStartAnalysis = () => {
    createJobMutation.mutate({ gameId });
  };

  const handleAddEvent = () => {
    createEventMutation.mutate({
      gameId,
      ...newEvent,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("このイベントを削除しますか？")) {
      deleteEventMutation.mutate({ id: eventId });
    }
  };

  const handleVerifyEvent = (eventId: string) => {
    verifyEventMutation.mutate({ id: eventId });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      shot: "シュート",
      rebound: "リバウンド",
      assist: "アシスト",
      turnover: "ターンオーバー",
      steal: "スティール",
      block: "ブロック",
      foul: "ファウル",
      substitution: "交代",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
      case "downloading":
      case "analyzing_video":
      case "analyzing_events":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      queued: "待機中",
      downloading: "ダウンロード中",
      analyzing_video: "動画解析中",
      analyzing_events: "イベント分析中",
      completed: "完了",
      failed: "失敗",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Analysis Status Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            動画解析
          </CardTitle>
          <CardDescription className="text-base">
            AI による自動イベント検出（将来実装）または手動でイベントを追加
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ステータス:</span>
                <Badge className={getStatusColor(jobStatus.status)}>
                  {getStatusLabel(jobStatus.status)}
                </Badge>
              </div>
              {jobStatus.status !== "completed" && jobStatus.status !== "failed" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>進捗</span>
                    <span>{jobStatus.progress}%</span>
                  </div>
                  <Progress value={jobStatus.progress} />
                </div>
              )}
              {jobStatus.errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{jobStatus.errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                まだ解析が開始されていません。
              </p>
              <Button
                onClick={handleStartAnalysis}
                disabled={createJobMutation.isPending}
                size="lg"
              >
                解析を開始（準備中）
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Timeline Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">イベントタイムライン</CardTitle>
              <CardDescription className="text-base">
                検出されたイベント一覧（{events.length}件）
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddEventDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              手動追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                まだイベントがありません。手動で追加するか、解析を開始してください。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0 w-20 text-center">
                    <p className="text-lg font-mono font-bold text-primary">
                      {Math.floor(event.timestamp / 60)}:{String(Math.floor(event.timestamp % 60)).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.timestamp.toFixed(1)}s
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{getEventTypeLabel(event.eventType)}</Badge>
                      {event.shotType && (
                        <Badge variant="secondary">{event.shotType}</Badge>
                      )}
                      {event.success !== null && (
                        <Badge className={event.success ? "bg-green-500" : "bg-red-500"}>
                          {event.success ? "成功" : "失敗"}
                        </Badge>
                      )}
                      {event.playerNumber !== null && (
                        <Badge variant="outline">#{event.playerNumber}</Badge>
                      )}
                      {event.verified && (
                        <Badge className="bg-blue-500 gap-1">
                          <Check className="h-3 w-3" />
                          検証済み
                        </Badge>
                      )}
                      <Badge variant="outline" className="ml-auto">
                        信頼度: {(event.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm">{event.description}</p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {!event.verified && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVerifyEvent(event.id)}
                        disabled={verifyEventMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deleteEventMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>手動イベント追加</DialogTitle>
            <DialogDescription>
              動画のタイムスタンプとイベント情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timestamp">タイムスタンプ（秒）</Label>
                <Input
                  id="timestamp"
                  type="number"
                  step="0.1"
                  value={newEvent.timestamp}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, timestamp: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">イベントタイプ</Label>
                <Select
                  value={newEvent.eventType}
                  onValueChange={(value: any) =>
                    setNewEvent({ ...newEvent, eventType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shot">シュート</SelectItem>
                    <SelectItem value="rebound">リバウンド</SelectItem>
                    <SelectItem value="assist">アシスト</SelectItem>
                    <SelectItem value="turnover">ターンオーバー</SelectItem>
                    <SelectItem value="steal">スティール</SelectItem>
                    <SelectItem value="block">ブロック</SelectItem>
                    <SelectItem value="foul">ファウル</SelectItem>
                    <SelectItem value="substitution">交代</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">チーム</Label>
                <Select
                  value={newEvent.teamId}
                  onValueChange={(value) => setNewEvent({ ...newEvent, teamId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={homeTeamId}>ホームチーム</SelectItem>
                    <SelectItem value={awayTeamId}>アウェイチーム</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerNumber">背番号（任意）</Label>
                <Input
                  id="playerNumber"
                  type="number"
                  value={newEvent.playerNumber || ""}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      playerNumber: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            {newEvent.eventType === "shot" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shotType">シュートタイプ</Label>
                  <Select
                    value={newEvent.shotType || ""}
                    onValueChange={(value: any) =>
                      setNewEvent({ ...newEvent, shotType: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2P">2ポイント</SelectItem>
                      <SelectItem value="3P">3ポイント</SelectItem>
                      <SelectItem value="FT">フリースロー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="success">成功/失敗</Label>
                  <Select
                    value={newEvent.success === undefined ? "" : String(newEvent.success)}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        success: value === "" ? undefined : value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">成功</SelectItem>
                      <SelectItem value="false">失敗</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="イベントの詳細を入力してください"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEventDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAddEvent}
              disabled={createEventMutation.isPending || !newEvent.description}
            >
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

