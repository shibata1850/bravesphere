import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Users, TrendingUp, Shield, Zap, Target, AlertCircle, CheckCircle2, Download, Settings, Save, Lightbulb } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface PlayerTendency {
  name: string;
  number: number;
  position: string;
  strengths: string[];
  weaknesses: string[];
  shotPreference: string;
  defensiveRole: string;
}

interface SetPlay {
  name: string;
  frequency: string;
  description: string;
  keyPlayers: string[];
  counters: string[];
}

export default function ScoutingReport() {
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    playerTendencies: true,
    setPlays: true,
    blobSlob: true,
    teamStrategy: true,
    keyMatchups: true,
  });

  // 保存された設定を読み込み
  const { data: savedSettings } = trpc.pdfSettings.get.useQuery(
    { settingType: "scouting" },
    { enabled: isDialogOpen }
  );

  useEffect(() => {
    if (savedSettings?.sections) {
      setSelectedSections(savedSettings.sections);
    }
  }, [savedSettings]);

  const saveSettings = trpc.pdfSettings.save.useMutation({
    onSuccess: () => {
      toast.success("設定を保存しました");
    },
    onError: () => {
      toast.error("設定の保存に失敗しました");
    },
  });

  const exportPDF = trpc.pdf.generateScoutingReport.useMutation({
    onSuccess: (data) => {
      toast.success("スカウティングレポートPDFを生成しました");
      window.open(data.url, "_blank");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("PDF生成に失敗しました");
    },
  });

  const handleSaveSettings = () => {
    saveSettings.mutate({
      settingType: "scouting",
      sections: selectedSections,
    });
  };

  const handleExportPDF = () => {
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    if (selectedCount === 0) {
      toast.error("少なくとも1つの項目を選択してください");
      return;
    }
    exportPDF.mutate({ 
      gameId: id!,
      sections: selectedSections,
    });
  };

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // サンプルデータ - ホームチーム
  const homePlayerTendencies: PlayerTendency[] = [
    {
      name: "田中 太郎",
      number: 10,
      position: "PG",
      strengths: ["3Pシュート", "パスビジョン", "ディフェンス"],
      weaknesses: ["ドライブ", "フィジカル"],
      shotPreference: "ウイング3P（右サイド優位）",
      defensiveRole: "オンボールプレッシャー",
    },
    {
      name: "佐藤 次郎",
      number: 23,
      position: "SG",
      strengths: ["スピード", "ミドルレンジ", "カット"],
      weaknesses: ["3Pシュート", "ディフェンス"],
      shotPreference: "エルボー付近のプルアップ",
      defensiveRole: "オフボールディフェンス",
    },
    {
      name: "伊藤 五郎",
      number: 32,
      position: "C",
      strengths: ["リバウンド", "ポストプレー", "ブロック"],
      weaknesses: ["スピード", "フリースロー"],
      shotPreference: "ペイント内のフック",
      defensiveRole: "リムプロテクター",
    },
  ];

  const homeSetPlays: SetPlay[] = [
    {
      name: "Horns Flex",
      frequency: "高頻度（試合中15-20回）",
      description: "ホーンズフォーメーションからのフレックスカット。#23がベースラインをカットし、#15がトップで3Pを狙う。",
      keyPlayers: ["#10 田中", "#23 佐藤", "#15 高橋"],
      counters: ["スイッチディフェンス", "ハイポストプレッシャー", "ダウンスクリーンのファイトオーバー"],
    },
    {
      name: "Spain Pick & Roll",
      frequency: "中頻度（試合中8-12回）",
      description: "ピック&ロールにバックスクリーンを組み合わせた高度なプレー。クラッチタイムに多用。",
      keyPlayers: ["#10 田中", "#32 伊藤", "#23 佐藤"],
      counters: ["バックスクリーン警戒", "ブリッツ（トラップ）"],
    },
  ];

  // サンプルデータ - アウェイチーム
  const awayPlayerTendencies: PlayerTendency[] = [
    {
      name: "山田 一郎",
      number: 5,
      position: "PG",
      strengths: ["ドライブ", "パス", "リーダーシップ"],
      weaknesses: ["3Pシュート", "ディフェンス"],
      shotPreference: "ペイントアタック",
      defensiveRole: "オンボールプレッシャー",
    },
    {
      name: "中村 二郎",
      number: 15,
      position: "PF",
      strengths: ["リバウンド", "ミドルレンジ", "スクリーン"],
      weaknesses: ["スピード", "3Pシュート"],
      shotPreference: "エルボーからのジャンパー",
      defensiveRole: "ヘルプディフェンス",
    },
  ];

  const awaySetPlays: SetPlay[] = [
    {
      name: "High Pick & Roll (Spread)",
      frequency: "高頻度（試合中20-25回）",
      description: "1-4スプレッドからのシンプルなピック&ロール。#5のドライブ能力を最大限活用。",
      keyPlayers: ["#5 山田", "#15 中村"],
      counters: ["アンダースクリーン", "スイッチ&リカバー", "ブリッツ"],
    },
  ];

  const renderPlayerCard = (player: PlayerTendency) => (
    <Link href={`/games/${id}/players/${player.number}`}>
    <Card key={player.number} className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            #{player.number} {player.name}
          </CardTitle>
          <Badge variant="secondary">{player.position}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            強み
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.strengths.map((s, idx) => (
              <Badge key={idx} variant="default" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            弱み
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.weaknesses.map((w, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {w}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            シュート傾向
          </h4>
          <p className="text-sm text-muted-foreground">{player.shotPreference}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            守備役割
          </h4>
          <p className="text-sm text-muted-foreground">{player.defensiveRole}</p>
        </div>
      </CardContent>
    </Card>
    </Link>
  );

  const renderSetPlay = (play: SetPlay) => (
    <Card key={play.name} className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">{play.name}</CardTitle>
        <CardDescription>{play.frequency}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">説明</h4>
          <p className="text-sm text-muted-foreground">{play.description}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">キープレーヤー</h4>
          <div className="flex flex-wrap gap-2">
            {play.keyPlayers.map((p, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {p}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-orange-600">対策</h4>
          <ul className="space-y-1">
            {play.counters.map((c, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/games/${id}/analysis`}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-4xl font-bold mb-2">スカウティングレポート</h2>
              <p className="text-lg text-muted-foreground">
                {game && new Date(game.gameDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/games/${id}/tactics`}>
              <Button variant="outline" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                戦術案を見る
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                PDF出力設定
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>PDF出力項目の選択</DialogTitle>
                <DialogDescription>
                  レポートに含める項目を選択してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="playerTendencies" 
                    checked={selectedSections.playerTendencies}
                    onCheckedChange={() => toggleSection('playerTendencies')}
                  />
                  <Label htmlFor="playerTendencies" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    選手別傾向分析
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="setPlays" 
                    checked={selectedSections.setPlays}
                    onCheckedChange={() => toggleSection('setPlays')}
                  />
                  <Label htmlFor="setPlays" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    セットプレー分析
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="blobSlob" 
                    checked={selectedSections.blobSlob}
                    onCheckedChange={() => toggleSection('blobSlob')}
                  />
                  <Label htmlFor="blobSlob" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    BLOB/SLOB分析
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="teamStrategy" 
                    checked={selectedSections.teamStrategy}
                    onCheckedChange={() => toggleSection('teamStrategy')}
                  />
                  <Label htmlFor="teamStrategy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    チーム戦略
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keyMatchups" 
                    checked={selectedSections.keyMatchups}
                    onCheckedChange={() => toggleSection('keyMatchups')}
                  />
                  <Label htmlFor="keyMatchups" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    重要マッチアップ
                  </Label>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleSaveSettings}
                  disabled={saveSettings.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveSettings.isPending ? "保存中..." : "設定を保存"}
                </Button>
                <Button 
                  onClick={handleExportPDF}
                  disabled={exportPDF.isPending}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exportPDF.isPending ? "生成中..." : "PDFを生成"}
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="home">{homeTeam?.name || "ホームチーム"}</TabsTrigger>
            <TabsTrigger value="away">{awayTeam?.name || "アウェイチーム"}</TabsTrigger>
          </TabsList>

          {/* Home Team */}
          <TabsContent value="home" className="space-y-8">
            {/* Player Tendencies */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                選手別傾向分析
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homePlayerTendencies.map(renderPlayerCard)}
              </div>
            </div>

            {/* Set Plays */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  セットプレー分析
                </h3>
                <Link href={`/games/${id}/setplays`}>
                  <Button variant="outline" size="sm">
                    詳細分析を見る
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {homeSetPlays.map(renderSetPlay)}
              </div>
            </div>

            {/* BLOB/SLOB */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                BLOB/SLOB分析
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">BLOB: Box Set</CardTitle>
                    <CardDescription>ベースラインアウトオブバウンズ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      ボックスフォーメーションから#32がスクリーンを使ってゴール下へカット。高確率でレイアップ。
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">対策</h4>
                      <ul className="space-y-1">
                        <li className="text-sm text-muted-foreground">• スクリーンをスイッチ</li>
                        <li className="text-sm text-muted-foreground">• #32をフロントガード</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">SLOB: Stagger Screen</CardTitle>
                    <CardDescription>サイドラインアウトオブバウンズ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      スタガースクリーンで#15が3Pシュート。タイムアウト後に多用。
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">対策</h4>
                      <ul className="space-y-1">
                        <li className="text-sm text-muted-foreground">• スクリーンをファイトオーバー</li>
                        <li className="text-sm text-muted-foreground">• #15を早めにマーク</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Away Team */}
          <TabsContent value="away" className="space-y-8">
            {/* Player Tendencies */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                選手別傾向分析
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awayPlayerTendencies.map(renderPlayerCard)}
              </div>
            </div>

            {/* Set Plays */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  セットプレー分析
                </h3>
                <Link href={`/games/${id}/setplays`}>
                  <Button variant="outline" size="sm">
                    詳細分析を見る
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {awaySetPlays.map(renderSetPlay)}
              </div>
            </div>

            {/* BLOB/SLOB */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                BLOB/SLOB分析
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">BLOB: Elevator Screen</CardTitle>
                    <CardDescription>ベースラインアウトオブバウンズ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      エレベータースクリーンで#8が3Pシュート。クラッチタイムに使用。
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">対策</h4>
                      <ul className="space-y-1">
                        <li className="text-sm text-muted-foreground">• スクリーンを早めに察知</li>
                        <li className="text-sm text-muted-foreground">• #8へのクローズアウト</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
