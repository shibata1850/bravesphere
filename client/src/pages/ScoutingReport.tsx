import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Users, TrendingUp, Shield, Zap, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "wouter";

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
      strengths: ["ミドルレンジ", "カットプレー", "リバウンド"],
      weaknesses: ["3Pシュート", "ボールハンドリング"],
      shotPreference: "エルボー付近のミドル",
      defensiveRole: "オフボールディフェンス",
    },
    {
      name: "鈴木 三郎",
      number: 7,
      position: "SF",
      strengths: ["ドライブ", "フィニッシュ", "トランジション"],
      weaknesses: ["外角シュート", "ディフェンス"],
      shotPreference: "ペイントアタック",
      defensiveRole: "ヘルプディフェンス",
    },
  ];

  const awayPlayerTendencies: PlayerTendency[] = [
    {
      name: "山田 一郎",
      number: 5,
      position: "PG",
      strengths: ["スピード", "ピック&ロール", "ペネトレーション"],
      weaknesses: ["3Pシュート", "ターンオーバー"],
      shotPreference: "フローター、レイアップ",
      defensiveRole: "プレッシャーディフェンス",
    },
    {
      name: "中村 二郎",
      number: 15,
      position: "C",
      strengths: ["ポストプレー", "リバウンド", "ブロック"],
      weaknesses: ["機動力", "フリースロー"],
      shotPreference: "ローポスト",
      defensiveRole: "リムプロテクター",
    },
  ];

  // セットプレー
  const homeSetPlays: SetPlay[] = [
    {
      name: "Horns Flex",
      frequency: "高頻度（Q1, Q3開始時）",
      description: "ハイポストから始まるフレックスオフェンス。#10がトップでボールを受け、#23と#7がフレックスカット。",
      keyPlayers: ["田中 太郎 (#10)", "佐藤 次郎 (#23)"],
      counters: ["スイッチディフェンス", "ハイポストへのプレッシャー"],
    },
    {
      name: "Zipper Screen",
      frequency: "中頻度（サイドアウト時）",
      description: "ジッパーカットでPGがボールを受け、ウイングへの展開。3Pシュートを狙う。",
      keyPlayers: ["田中 太郎 (#10)"],
      counters: ["スクリーンへのファイトオーバー", "ウイングへのクローズアウト"],
    },
    {
      name: "Spain Pick & Roll",
      frequency: "低頻度（クラッチタイム）",
      description: "スペインピック&ロール。バックスクリーンでロールマンをフリーに。",
      keyPlayers: ["田中 太郎 (#10)", "伊藤 五郎 (#32)"],
      counters: ["バックスクリーンへの警戒", "ヘルプローテーション"],
    },
  ];

  const awaySetPlays: SetPlay[] = [
    {
      name: "High Pick & Roll",
      frequency: "高頻度（全クォーター）",
      description: "トップでのピック&ロール。#5のスピードを活かしたペネトレーション。",
      keyPlayers: ["山田 一郎 (#5)", "中村 二郎 (#15)"],
      counters: ["アンダースクリーン", "ドロップカバレッジ"],
    },
    {
      name: "Elbow Entry Post Up",
      frequency: "中頻度（ハーフコート時）",
      description: "エルボーからのポストエントリー。#15のポストプレーから展開。",
      keyPlayers: ["中村 二郎 (#15)"],
      counters: ["フロントディフェンス", "ダブルチーム"],
    },
  ];

  // BLOB/SLOB
  const homeBlobSlob = [
    {
      type: "BLOB",
      name: "Box Zipper",
      description: "ボックスフォーメーションからジッパーカット。#10が3Pを狙う。",
    },
    {
      type: "SLOB",
      name: "Floppy",
      description: "フロッピーアクション。#23がダブルスクリーンで3P。",
    },
  ];

  const awayBlobSlob = [
    {
      type: "BLOB",
      name: "Stack Lob",
      description: "スタックからロブパス。#15がリムアタック。",
    },
    {
      type: "SLOB",
      name: "Elevator Screen",
      description: "エレベータースクリーン。シューターをフリーに。",
    },
  ];

  const renderPlayerCard = (player: PlayerTendency) => (
    <Card key={player.number} className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            #{player.number} {player.name}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {player.position}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            強み
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.strengths.map((s, idx) => (
              <Badge key={idx} className="bg-green-100 text-green-700 hover:bg-green-100">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            弱み
          </h4>
          <div className="flex flex-wrap gap-2">
            {player.weaknesses.map((w, idx) => (
              <Badge key={idx} className="bg-red-100 text-red-700 hover:bg-red-100">
                {w}
              </Badge>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t space-y-2">
          <div className="text-sm">
            <span className="font-semibold">シュート傾向: </span>
            <span className="text-muted-foreground">{player.shotPreference}</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">守備役割: </span>
            <span className="text-muted-foreground">{player.defensiveRole}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSetPlay = (play: SetPlay, idx: number) => (
    <Card key={idx} className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{play.name}</CardTitle>
          <Badge variant="secondary">{play.frequency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{play.description}</p>
        <div>
          <h5 className="text-sm font-semibold mb-2">キープレーヤー:</h5>
          <div className="flex flex-wrap gap-2">
            {play.keyPlayers.map((p, i) => (
              <Badge key={i} variant="outline">
                {p}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold mb-2 text-orange-600">対策:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {play.counters.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
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
        <div className="flex items-center gap-4 mb-8">
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
                <Zap className="h-6 w-6 text-orange-600" />
                BLOB / SLOB
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {homeBlobSlob.map((play, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{play.name}</CardTitle>
                        <Badge variant={play.type === "BLOB" ? "default" : "secondary"}>
                          {play.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{play.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Away Team */}
          <TabsContent value="away" className="space-y-8">
            {/* Player Tendencies */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
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
                <Zap className="h-6 w-6 text-orange-600" />
                BLOB / SLOB
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {awayBlobSlob.map((play, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{play.name}</CardTitle>
                        <Badge variant={play.type === "BLOB" ? "default" : "secondary"}>
                          {play.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{play.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
