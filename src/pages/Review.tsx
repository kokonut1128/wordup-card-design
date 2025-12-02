import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Play, Pause, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  front: string;
  example_sentence_1?: string;
  example_translation_1?: string;
  example_sentence_2?: string;
  example_translation_2?: string;
  example_sentence_3?: string;
  example_translation_3?: string;
}

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<'single' | 'all'>('single');
  const [languageMode, setLanguageMode] = useState<'english' | 'both'>('english');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewFlashcards();
  }, []);

  const fetchNewFlashcards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get flashcards that are not learned (生字單字本)
      const { data: progressData, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('flashcard_id')
        .eq('user_id', user.id)
        .eq('is_learned', false);

      if (progressError) throw progressError;

      const flashcardIds = progressData?.map(p => p.flashcard_id) || [];

      if (flashcardIds.length === 0) {
        // If no progress records, get all user's flashcards
        const { data: allFlashcards, error: allError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id);

        if (allError) throw allError;
        setFlashcards(allFlashcards || []);
      } else {
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select('*')
          .in('id', flashcardIds);

        if (flashcardsError) throw flashcardsError;
        setFlashcards(flashcardsData || []);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: '錯誤',
        description: '無法載入單字卡',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string, lang: string = 'en-US') => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => resolve(true);
      speechSynthesis.speak(utterance);
    });
  };

  const playCurrentSentence = async () => {
    const card = flashcards[currentIndex];
    if (!card) return;

    setIsPlaying(true);

    try {
      if (playMode === 'single') {
        // Play only example 1
        if (card.example_sentence_1) {
          await speak(card.example_sentence_1);
          if (languageMode === 'both' && card.example_translation_1) {
            await speak(card.example_translation_1, 'zh-TW');
          }
        }
      } else {
        // Play all examples
        if (card.example_sentence_1) {
          await speak(card.example_sentence_1);
          if (languageMode === 'both' && card.example_translation_1) {
            await speak(card.example_translation_1, 'zh-TW');
          }
        }
        if (card.example_sentence_2) {
          await speak(card.example_sentence_2);
          if (languageMode === 'both' && card.example_translation_2) {
            await speak(card.example_translation_2, 'zh-TW');
          }
        }
        if (card.example_sentence_3) {
          await speak(card.example_sentence_3);
          if (languageMode === 'both' && card.example_translation_3) {
            await speak(card.example_translation_3, 'zh-TW');
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const playAll = async () => {
    setIsPlaying(true);
    for (let i = currentIndex; i < flashcards.length; i++) {
      setCurrentIndex(i);
      const card = flashcards[i];

      if (playMode === 'single') {
        if (card.example_sentence_1) {
          await speak(card.example_sentence_1);
          if (languageMode === 'both' && card.example_translation_1) {
            await speak(card.example_translation_1, 'zh-TW');
          }
        }
      } else {
        if (card.example_sentence_1) {
          await speak(card.example_sentence_1);
          if (languageMode === 'both' && card.example_translation_1) {
            await speak(card.example_translation_1, 'zh-TW');
          }
        }
        if (card.example_sentence_2) {
          await speak(card.example_sentence_2);
          if (languageMode === 'both' && card.example_translation_2) {
            await speak(card.example_translation_2, 'zh-TW');
          }
        }
        if (card.example_sentence_3) {
          await speak(card.example_sentence_3);
          if (languageMode === 'both' && card.example_translation_3) {
            await speak(card.example_translation_3, 'zh-TW');
          }
        }
      }
    }
    setIsPlaying(false);
  };

  const stopPlaying = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentCard = flashcards[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">目前沒有生字單字需要複習</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>複習設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">播放範圍</Label>
              <RadioGroup value={playMode} onValueChange={(v) => setPlayMode(v as 'single' | 'all')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">只播放例句1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">播放全部例句</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">語言設定</Label>
              <RadioGroup value={languageMode} onValueChange={(v) => setLanguageMode(v as 'english' | 'both')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="english" id="english" />
                  <Label htmlFor="english">只播放英文</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">英文與中文都播放</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button onClick={playCurrentSentence} disabled={isPlaying}>
                <Play className="mr-2 h-4 w-4" />
                播放當前單字
              </Button>
              <Button onClick={playAll} disabled={isPlaying} variant="secondary">
                <Play className="mr-2 h-4 w-4" />
                自動播放全部
              </Button>
              {isPlaying && (
                <Button onClick={stopPlaying} variant="destructive">
                  <Pause className="mr-2 h-4 w-4" />
                  停止
                </Button>
              )}
              <Button onClick={handleNext} disabled={isPlaying || currentIndex >= flashcards.length - 1}>
                <SkipForward className="mr-2 h-4 w-4" />
                下一個
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentCard && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentCard.front}
                <span className="text-sm text-muted-foreground ml-4">
                  {currentIndex + 1} / {flashcards.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCard.example_sentence_1 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">{currentCard.example_sentence_1}</p>
                  {currentCard.example_translation_1 && (
                    <p className="text-sm text-muted-foreground mt-2">{currentCard.example_translation_1}</p>
                  )}
                </div>
              )}

              {playMode === 'all' && (
                <>
                  {currentCard.example_sentence_2 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-foreground">{currentCard.example_sentence_2}</p>
                      {currentCard.example_translation_2 && (
                        <p className="text-sm text-muted-foreground mt-2">{currentCard.example_translation_2}</p>
                      )}
                    </div>
                  )}

                  {currentCard.example_sentence_3 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-foreground">{currentCard.example_sentence_3}</p>
                      {currentCard.example_translation_3 && (
                        <p className="text-sm text-muted-foreground mt-2">{currentCard.example_translation_3}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Review;