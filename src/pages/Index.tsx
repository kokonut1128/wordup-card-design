import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, BookOpen, ShoppingCart, Newspaper, LogOut, Library, Play, ClipboardList } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [learnedCount, setLearnedCount] = useState(0);
  const [unlearnedCount, setUnlearnedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async (userId: string) => {
    try {
      const { data: progress, error } = await supabase
        .from('user_flashcard_progress')
        .select('is_learned')
        .eq('user_id', userId);

      if (error) throw error;

      const learned = progress?.filter(p => p.is_learned).length || 0;
      const unlearned = progress?.filter(p => !p.is_learned).length || 0;

      setLearnedCount(learned);
      setUnlearnedCount(unlearned);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast({
        variant: 'destructive',
        title: '請輸入單字',
      });
      return;
    }

    try {
      // First, check if word exists in database
      const { data: existingCard, error: searchError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user?.id)
        .ilike('front', searchTerm.trim())
        .maybeSingle();

      if (existingCard) {
        // Word exists, navigate to detail page
        navigate(`/word/${encodeURIComponent(searchTerm.trim())}`);
        return;
      }

      // Word doesn't exist, navigate to flashcards page to create new
      navigate('/flashcards');
      toast({
        title: '新增單字',
        description: `找不到 "${searchTerm}"，請建立新的單字卡`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        variant: 'destructive',
        title: '查詢失敗',
        description: error.message || '無法查詢單字',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">單字卡學習系統</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>查詢單字</CardTitle>
            <CardDescription>搜尋單字或片語</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="輸入英文單字或片語..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                搜尋
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">已學習</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{learnedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">未學習</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">{unlearnedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-primary/5" onClick={() => navigate('/review')}>
            <CardHeader>
              <Play className="h-10 w-10 text-primary mb-2" />
              <CardTitle>複習模式</CardTitle>
              <CardDescription>TTS 發音播放例句，支援單句或全部例句播放</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20 bg-primary/5" onClick={() => navigate('/quiz')}>
            <CardHeader>
              <ClipboardList className="h-10 w-10 text-primary mb-2" />
              <CardTitle>測驗模式</CardTitle>
              <CardDescription>填空題四選一，連續答對後移至熟悉單字本</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/flashcards')}>
            <CardHeader>
              <Library className="h-10 w-10 text-primary mb-2" />
              <CardTitle>我的書櫃</CardTitle>
              <CardDescription>管理你的單字卡集</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>商城</CardTitle>
              <CardDescription>探索更多學習資源</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">即將推出</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
            <CardHeader>
              <Newspaper className="h-10 w-10 text-primary mb-2" />
              <CardTitle>每日新聞</CardTitle>
              <CardDescription>透過新聞學習英文</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">即將推出</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
