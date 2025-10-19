import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BarChart3, Video, Users, FileText, TrendingUp, Target, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
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
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-base">ダッシュボード</Button>
                </Link>
                <Link href="/teams">
                  <Button variant="ghost" className="text-base">チーム管理</Button>
                </Link>
                <Link href="/games">
                  <Button variant="ghost" className="text-base">試合一覧</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="font-medium">ログイン</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              データ駆動型バスケットボール分析プラットフォーム
            </div>
            <h2 className="text-6xl font-bold tracking-tight leading-tight">
              思考する<br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                バスケットボール
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              データと行動経済学で指導と選手の未来を変える。映像解析から自動スタッツ生成、戦術分析まで、エビデンスに基づく指導を実現します。
            </p>
            {isAuthenticated ? (
              <div className="flex gap-4 justify-center pt-6">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 h-14 group">
                    ダッシュボードへ
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/games">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                    試合を登録
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-6">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-10 h-14 group">
                    今すぐ始める
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">主要機能</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              試合映像から自動的にデータを抽出し、チームと選手のパフォーマンスを可視化
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">映像自動解析</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  試合映像をアップロードするだけで、AIが自動的にショット、リバウンド、アシスト等のイベントを検出します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">詳細スタッツ生成</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  ボックススコア、ショットチャート、4ファクター等の高度なスタッツを自動生成。データで選手を理解します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">ショットチャート</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  コート上のどこからシュートを打ったか、成功率はどうかを可視化。ゾーン別の分析も可能です。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">ラインナップ効率</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  どのラインナップが効果的だったかを分析。+/-やポゼッション当たりの得点で評価します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">スカウティングレポート</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  対戦相手の傾向、よく使うプレイ、弱点を分析。PDF形式でレポートを出力できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardHeader className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-accent-foreground" />
                </div>
                <CardTitle className="text-xl">プレイリスト生成</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  得点シーン、失点シーン、ターンオーバー等を自動抽出。映像クリップとして保存できます。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-12">私たちの理念</h3>
            <div className="space-y-8 text-lg leading-relaxed">
              <Card className="border-2 p-8">
                <p>
                  日本のバスケットボールにおいて、指導者の経験や勘に依存し、高圧的な指導で選手が自ら考える機会を奪われる時代から脱却します。指導者と選手が共に<strong className="text-primary">「データとエビデンス」</strong>を基盤に理解し合う文化を育みます。
                </p>
              </Card>
              <Card className="border-2 p-8">
                <p>
                  アンダーカテゴリの選手や指導者が「バスケットボールのみで進学・就職を目指す」という狭い価値観から離れ、バスケットボールを通じて<strong className="text-accent">行動経済学的思考</strong>と「システム2」を育む教育的アプローチを促進します。
                </p>
              </Card>
              <Card className="border-2 p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <p className="font-medium">
                  {APP_TITLE}は、教育と競技の架け橋を目指す「思考するスポーツ」プロジェクトの一環として、日本のバスケットボール文化の構造的変革を実現します。
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto bg-muted/20">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />}
            <p className="text-lg font-semibold">{APP_TITLE}</p>
          </div>
          <p className="text-muted-foreground">&copy; 2025 SOFTDOING. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

