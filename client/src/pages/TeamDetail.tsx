import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading: teamLoading } = trpc.teams.get.useQuery({ id: id! });
  const { data: players, isLoading: playersLoading, refetch: refetchPlayers } = trpc.players.listByTeam.useQuery({ teamId: id! });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [playerForm, setPlayerForm] = useState({
    name: "",
    number: "",
    position: "",
    height: "",
  });

  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      toast.success("選手を追加しました");
      refetchPlayers();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "選手の追加に失敗しました");
    },
  });

  const updatePlayer = trpc.players.update.useMutation({
    onSuccess: () => {
      toast.success("選手情報を更新しました");
      refetchPlayers();
      setDialogOpen(false);
      resetForm();
      setEditingPlayer(null);
    },
    onError: (error) => {
      toast.error(error.message || "選手情報の更新に失敗しました");
    },
  });

  const deletePlayer = trpc.players.delete.useMutation({
    onSuccess: () => {
      toast.success("選手を削除しました");
      refetchPlayers();
    },
    onError: (error) => {
      toast.error(error.message || "選手の削除に失敗しました");
    },
  });

  const resetForm = () => {
    setPlayerForm({
      name: "",
      number: "",
      position: "",
      height: "",
    });
  };

  const handleOpenDialog = (player?: any) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        name: player.name,
        number: player.number?.toString() || "",
        position: player.position || "",
        height: player.height?.toString() || "",
      });
    } else {
      setEditingPlayer(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      teamId: id!,
      name: playerForm.name,
      number: playerForm.number ? parseInt(playerForm.number) : undefined,
      position: playerForm.position || undefined,
      height: playerForm.height ? parseInt(playerForm.height) : undefined,
    };

    if (editingPlayer) {
      updatePlayer.mutate({ id: editingPlayer.id, ...data });
    } else {
      createPlayer.mutate(data);
    }
  };

  const handleDelete = (playerId: string) => {
    if (confirm("この選手を削除してもよろしいですか?")) {
      deletePlayer.mutate({ id: playerId });
    }
  };

  if (teamLoading) {
    return <div className="container py-8">読み込み中...</div>;
  }

  if (!team) {
    return <div className="container py-8">チームが見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/teams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>チーム情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">チーム名:</span> {team.name}
              </div>
              {team.organization && (
                <div>
                  <span className="font-medium">所属組織:</span> {team.organization}
                </div>
              )}
              <div>
                <span className="font-medium">作成日:</span>{" "}
                {new Date(team.createdAt!).toLocaleDateString("ja-JP")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>選手ロスター</CardTitle>
                  <CardDescription>
                    {playersLoading ? "読み込み中..." : `${players?.length || 0}名の選手`}
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      選手を追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingPlayer ? "選手情報を編集" : "新しい選手を追加"}</DialogTitle>
                        <DialogDescription>
                          選手の基本情報を入力してください
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">選手名 *</Label>
                          <Input
                            id="name"
                            value={playerForm.name}
                            onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number">背番号</Label>
                          <Input
                            id="number"
                            type="number"
                            value={playerForm.number}
                            onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">ポジション</Label>
                          <Select
                            value={playerForm.position}
                            onValueChange={(value) => setPlayerForm({ ...playerForm, position: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="ポジションを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PG">PG (ポイントガード)</SelectItem>
                              <SelectItem value="SG">SG (シューティングガード)</SelectItem>
                              <SelectItem value="SF">SF (スモールフォワード)</SelectItem>
                              <SelectItem value="PF">PF (パワーフォワード)</SelectItem>
                              <SelectItem value="C">C (センター)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">身長 (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={playerForm.height}
                            onChange={(e) => setPlayerForm({ ...playerForm, height: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button type="submit" disabled={createPlayer.isPending || updatePlayer.isPending}>
                          {editingPlayer ? "更新" : "追加"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <p className="text-muted-foreground">読み込み中...</p>
              ) : players && players.length > 0 ? (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.id} className="p-3 border rounded hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">
                            #{player.number || "-"} {player.name}
                          </p>
                          <div className="flex gap-4 mt-1">
                            {player.position && (
                              <p className="text-sm text-muted-foreground">{player.position}</p>
                            )}
                            {player.height && (
                              <p className="text-sm text-muted-foreground">{player.height}cm</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(player)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(player.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">まだ選手が登録されていません。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
