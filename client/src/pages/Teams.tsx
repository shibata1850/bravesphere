import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Users, ArrowLeft, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Teams() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");

  const { data: teams, isLoading } = trpc.teams.listAll.useQuery();
  const utils = trpc.useUtils();
  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.listAll.invalidate();
      setOpen(false);
      setName("");
      setOrganization("");
      toast.success("チームを作成しました");
    },
    onError: (error) => {
      toast.error("チームの作成に失敗しました: " + error.message);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("チーム名を入力してください");
      return;
    }
    createTeam.mutate({ name, organization });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
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
              <Button variant="ghost" className="text-base font-medium">チーム管理</Button>
            </Link>
            <Link href="/games">
              <Button variant="ghost" className="text-base">試合一覧</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">チーム管理</h2>
            <p className="text-lg text-muted-foreground">
              チームと選手のロスター情報を管理
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                新しいチームを作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいチームを作成</DialogTitle>
                <DialogDescription>
                  チーム名と所属組織を入力してください。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">チーム名 *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 東京ドラゴンズ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">所属組織（任意）</Label>
                  <Input
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="例: 東京都バスケットボール協会"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreate} disabled={createTeam.isPending}>
                  {createTeam.isPending ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{team.name}</CardTitle>
                        {team.organization && (
                          <CardDescription className="mt-1 truncate">{team.organization}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/teams/${team.id}/evolution`}>
                      <Button variant="outline" size="sm" className="w-full">
                        チーム進化グラフを見る
                  <Link href={`/teams/${team.id}/practice`}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      練習メニュー
                    </Button>
                  </Link>
                      </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      作成日: {new Date(team.createdAt!).toLocaleDateString("ja-JP")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-2">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">まだチームが登録されていません</h3>
              <p className="text-muted-foreground mb-6">
                最初のチームを作成して、選手のロスター管理を始めましょう
              </p>
              <Button size="lg" onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-5 w-5" />
                最初のチームを作成
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
