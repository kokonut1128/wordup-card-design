import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardStudy } from '@/components/FlashcardStudy';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

const Study = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchFlashcards(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchFlashcards(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFlashcards = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Flashcard[] = (data || []).map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        phonetic: card.phonetic,
        chineseDefinition: card.chinese_definition,
        englishDefinition: card.english_definition,
        synonyms: card.synonyms,
        antonyms: card.antonyms,
        relatedWords: card.related_words,
        imageUrl: card.image_url,
        exampleSentence1: card.example_sentence_1,
        exampleTranslation1: card.example_translation_1,
        exampleSentence2: card.example_sentence_2,
        exampleTranslation2: card.example_translation_2,
        exampleSentence3: card.example_sentence_3,
        exampleTranslation3: card.example_translation_3,
        createdAt: new Date(card.created_at).getTime(),
      }));

      setFlashcards(formattedData);
    } catch (error: any) {
      console.error('Error fetching flashcards:', error);
      toast({
        variant: 'destructive',
        title: '載入失敗',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (id: string) => {
    if (!user) return;

    try {
      // First check if progress exists
      const { data: existing } = await supabase
        .from('user_flashcard_progress')
        .select('review_count')
        .eq('user_id', user.id)
        .eq('flashcard_id', id)
        .maybeSingle();

      const reviewCount = existing ? existing.review_count + 1 : 1;

      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: id,
          is_learned: true,
          last_reviewed: new Date().toISOString(),
          review_count: reviewCount,
        }, {
          onConflict: 'user_id,flashcard_id',
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking as reviewed:', error);
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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Link>
            </Button>
            <h1 className="text-xl font-bold">學習模式</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            點擊卡片進行翻轉
          </p>
        </div>

        <FlashcardStudy
          flashcards={flashcards}
          onReviewed={handleMarkAsReviewed}
        />
      </main>
    </div>
  );
};

export default Study;
