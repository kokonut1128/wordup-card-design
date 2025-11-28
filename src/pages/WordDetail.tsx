import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, ExternalLink, Star, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/types/flashcard';

const WordDetail = () => {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcard();
  }, [word]);

  const fetchFlashcard = async () => {
    if (!word) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('front', word)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const formattedData: Flashcard = {
          id: data.id,
          front: data.front,
          back: data.back,
          phonetic: data.phonetic,
          chineseDefinition: data.chinese_definition,
          englishDefinition: data.english_definition,
          synonyms: data.synonyms,
          antonyms: data.antonyms,
          relatedWords: data.related_words,
          imageUrl: data.image_url,
          exampleSentence1: data.example_sentence_1,
          exampleTranslation1: data.example_translation_1,
          exampleSource1: data.example_source_1,
          exampleSentence2: data.example_sentence_2,
          exampleTranslation2: data.example_translation_2,
          exampleSource2: data.example_source_2,
          exampleSentence3: data.example_sentence_3,
          exampleTranslation3: data.example_translation_3,
          exampleSource3: data.example_source_3,
          isFavorite: data.is_favorite,
          createdAt: new Date(data.created_at).getTime(),
        };
        setFlashcard(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching flashcard:', error);
      toast({
        variant: 'destructive',
        title: '載入失敗',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePronunciation = () => {
    if (!flashcard) return;
    
    const utterance = new SpeechSynthesisUtterance(flashcard.front);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleFavorite = async () => {
    if (!flashcard) return;

    try {
      const newFavoriteStatus = !flashcard.isFavorite;
      
      const { error } = await supabase
        .from('flashcards')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', flashcard.id);

      if (error) throw error;

      setFlashcard({ ...flashcard, isFavorite: newFavoriteStatus });
      toast({
        title: newFavoriteStatus ? '已加入收藏' : '已取消收藏',
        description: newFavoriteStatus ? '單字已標記為重要' : '已移除收藏標記',
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: 'destructive',
        title: '操作失敗',
        description: error.message,
      });
    }
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

  if (!flashcard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">找不到此單字</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首頁
          </Button>
          <h1 className="text-xl font-bold">單字詳情</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="relative"
          >
            <Star
              className={`h-5 w-5 ${
                flashcard.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-4xl">{flashcard.front}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePronunciation}
                    className="hover:bg-accent"
                  >
                    <Volume2 className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                {flashcard.phonetic && (
                  <button
                    onClick={handlePronunciation}
                    className="text-lg text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  >
                    {flashcard.phonetic}
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {flashcard.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={flashcard.imageUrl} 
                  alt={flashcard.front}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">中文解釋</h3>
              <p className="text-foreground">{flashcard.chineseDefinition || flashcard.back}</p>
            </div>

            {flashcard.englishDefinition && (
              <div>
                <h3 className="font-semibold text-lg mb-2">英文解釋</h3>
                <p className="text-muted-foreground">{flashcard.englishDefinition}</p>
              </div>
            )}

            <Separator />

            {flashcard.synonyms && flashcard.synonyms.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">同義字</h3>
                <div className="flex flex-wrap gap-2">
                  {flashcard.synonyms.map((synonym, index) => (
                    <Badge key={index} variant="secondary">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {flashcard.antonyms && flashcard.antonyms.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">反義字</h3>
                <div className="flex flex-wrap gap-2">
                  {flashcard.antonyms.map((antonym, index) => (
                    <Badge key={index} variant="outline">
                      {antonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {flashcard.relatedWords && flashcard.relatedWords.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">相關詞</h3>
                <div className="flex flex-wrap gap-2">
                  {flashcard.relatedWords.map((word, index) => (
                    <Badge key={index} variant="default">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4">例句</h3>
              <div className="space-y-4">
                {flashcard.exampleSentence1 && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-foreground mb-2">{flashcard.exampleSentence1}</p>
                      {flashcard.exampleTranslation1 && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {flashcard.exampleTranslation1}
                        </p>
                      )}
                      {flashcard.exampleSource1 && (
                        <a
                          href={flashcard.exampleSource1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center gap-1 hover:underline"
                        >
                          來源 <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}

                {flashcard.exampleSentence2 && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-foreground mb-2">{flashcard.exampleSentence2}</p>
                      {flashcard.exampleTranslation2 && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {flashcard.exampleTranslation2}
                        </p>
                      )}
                      {flashcard.exampleSource2 && (
                        <a
                          href={flashcard.exampleSource2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center gap-1 hover:underline"
                        >
                          來源 <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}

                {flashcard.exampleSentence3 && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-foreground mb-2">{flashcard.exampleSentence3}</p>
                      {flashcard.exampleTranslation3 && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {flashcard.exampleTranslation3}
                        </p>
                      )}
                      {flashcard.exampleSource3 && (
                        <a
                          href={flashcard.exampleSource3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center gap-1 hover:underline"
                        >
                          來源 <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button onClick={() => navigate(`/flashcards`)}>
                <Edit className="h-4 w-4 mr-2" />
                編輯單字卡
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WordDetail;
