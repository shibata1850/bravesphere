import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BarChart3, Video, Users, FileText, TrendingUp, Target } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">ダッシュボード</Button>
                </Link>
                <Link href="/teams">
                  <Button variant="ghost">チーム管理</Button>
                </Link>
                <Link href="/games">
                  <Button variant="ghost">試合一覧</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>ログイン</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-5xl font-bold tracking-tight">
              思考するバスケットボール
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              データと行動経済学で指導と選手の未来を変える。映像解析から自動スタッツ生成、戦術分析まで、エビデンスに基づく指導を実現します。
            </p>
            {isAuthenticated ? (
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8">
                    ダッシュボードへ
                  </Button>
                </Link>
                <Link href="/games">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    試合を登録
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-4">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8">
                    今すぐ始める
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">主要機能</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>映像自動解析</CardTitle>
                <CardDescription>
                  試合映像をアップロードするだけで、AIが自動的にショット、リバウンド、アシスト等のイベントを検出します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>詳細スタッツ生成</CardTitle>
                <CardDescription>
                  ボックススコア、ショットチャート、4ファクター等の高度なスタッツを自動生成。データで選手を理解します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>ショットチャート</CardTitle>
                <CardDescription>
                  コート上のどこからシュートを打ったか、成功率はどうかを可視化。ゾーン別の分析も可能です。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>ラインナップ効率</CardTitle>
                <CardDescription>
                  どのラインナップが効果的だったかを分析。+/-やポゼッション当たりの得点で評価します。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>スカウティングレポート</CardTitle>
                <CardDescription>
                  対戦相手の傾向、よく使うプレイ、弱点を分析。PDF形式でレポートを出力できます。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>プレイリスト生成</CardTitle>
                <CardDescription>
                  得点シーン、失点シーン、ターンオーバー等を自動抽出。映像クリップとして保存できます。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">私たちの理念</h3>
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                日本のバスケットボールにおいて、指導者の経験や勘に依存し、高圧的な指導で選手が自ら考える機会を奪われる時代から脱却します。指導者と選手が共に<strong>「データとエビデンス」</strong>を基盤に理解し合う文化を育みます。
              </p>
              <p>
                アンダーカテゴリの選手や指導者が「バスケットボールのみで進学・就職を目指す」という狭い価値観から離れ、バスケットボールを通じて<strong>行動経済学的思考</strong>と「システム2」を育む教育的アプローチを促進します。
              </p>
              <p>
                COURT VISIONは、教育と競技の架け橋を目指す「思考するスポーツ」プロジェクトの一環として、日本のバスケットボール文化の構造的変革を実現します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 SOFTDOING. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

