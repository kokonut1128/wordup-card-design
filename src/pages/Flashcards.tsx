import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardList } from '@/components/FlashcardList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, Plus, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flashcard } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

const Flashcards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

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
        exampleSource1: card.example_source_1,
        exampleSentence2: card.example_sentence_2,
        exampleTranslation2: card.example_translation_2,
        exampleSource2: card.example_source_2,
        exampleSentence3: card.example_sentence_3,
        exampleTranslation3: card.example_translation_3,
        exampleSource3: card.example_source_3,
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

  const handleSubmit = async (front: string, back: string, additionalData?: Partial<Flashcard>) => {
    if (!user) return;

    try {
      if (editingCard) {
        const { error } = await supabase
          .from('flashcards')
          .update({
            front,
            back,
            phonetic: additionalData?.phonetic,
            chinese_definition: additionalData?.chineseDefinition,
            english_definition: additionalData?.englishDefinition,
            synonyms: additionalData?.synonyms,
            antonyms: additionalData?.antonyms,
            related_words: additionalData?.relatedWords,
            image_url: additionalData?.imageUrl,
        example_sentence_1: additionalData?.exampleSentence1,
        example_translation_1: additionalData?.exampleTranslation1,
        example_source_1: additionalData?.exampleSource1,
        example_sentence_2: additionalData?.exampleSentence2,
        example_translation_2: additionalData?.exampleTranslation2,
        example_source_2: additionalData?.exampleSource2,
        example_sentence_3: additionalData?.exampleSentence3,
        example_translation_3: additionalData?.exampleTranslation3,
        example_source_3: additionalData?.exampleSource3,
          })
          .eq('id', editingCard.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: '更新成功',
          description: '單字卡已更新',
        });
      } else {
        const { error } = await supabase
          .from('flashcards')
          .insert({
            user_id: user.id,
            front,
            back,
            phonetic: additionalData?.phonetic,
            chinese_definition: additionalData?.chineseDefinition,
            english_definition: additionalData?.englishDefinition,
            synonyms: additionalData?.synonyms,
            antonyms: additionalData?.antonyms,
            related_words: additionalData?.relatedWords,
            image_url: additionalData?.imageUrl,
            example_sentence_1: additionalData?.exampleSentence1,
            example_translation_1: additionalData?.exampleTranslation1,
            example_source_1: additionalData?.exampleSource1,
            example_sentence_2: additionalData?.exampleSentence2,
            example_translation_2: additionalData?.exampleTranslation2,
            example_source_2: additionalData?.exampleSource2,
            example_sentence_3: additionalData?.exampleSentence3,
            example_translation_3: additionalData?.exampleTranslation3,
            example_source_3: additionalData?.exampleSource3,
          });

        if (error) throw error;

        toast({
          title: '新增成功',
          description: '單字卡已建立',
        });
      }

      await fetchFlashcards(user.id);
      setEditingCard(null);
    } catch (error: any) {
      console.error('Error saving flashcard:', error);
      toast({
        variant: 'destructive',
        title: editingCard ? '更新失敗' : '新增失敗',
        description: error.message,
      });
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchFlashcards(user.id);
      toast({
        title: '刪除成功',
        description: '單字卡已刪除',
      });
    } catch (error: any) {
      console.error('Error deleting flashcard:', error);
      toast({
        variant: 'destructive',
        title: '刪除失敗',
        description: error.message,
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCard(null);
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
            <h1 className="text-xl font-bold">管理單字卡</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <p className="text-muted-foreground">
            建立和管理你的學習單字卡
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增單字卡
            </Button>
            {flashcards.length > 0 && (
              <Button variant="outline" asChild>
                <Link to="/study">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  開始學習
                </Link>
              </Button>
            )}
          </div>
        </div>

        <FlashcardList
          flashcards={flashcards}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <FlashcardForm
          open={isFormOpen}
          onOpenChange={handleOpenChange}
          onSubmit={handleSubmit}
          editCard={editingCard}
        />
      </main>
    </div>
  );
};

export default Flashcards;
