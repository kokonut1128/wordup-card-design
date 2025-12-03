import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  front: string;
  example_sentence_1?: string;
  example_translation_1?: string;
}

interface QuizQuestion {
  sentence: string;
  correctAnswer: string;
  options: string[];
  flashcardId: string;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [requiredStreak, setRequiredStreak] = useState(2);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    fetchFlashcardsAndGenerateQuiz();
  }, []);

  const fetchFlashcardsAndGenerateQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get all flashcards first
      const { data: allFlashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id, front, example_sentence_1, example_translation_1');

      if (flashcardsError) throw flashcardsError;

      // Get learned flashcard IDs for this user
      const { data: learnedProgress } = await supabase
        .from('user_flashcard_progress')
        .select('flashcard_id')
        .eq('user_id', user.id)
        .eq('is_learned', true);

      const learnedIds = new Set(learnedProgress?.map(p => p.flashcard_id) || []);

      // Filter out learned flashcards and those without example sentences
      const validFlashcards = (allFlashcards || []).filter(
        f => !learnedIds.has(f.id) && f.example_sentence_1
      );
      
      setFlashcards(validFlashcards);
      setTotalQuestions(validFlashcards.length);
      
      if (validFlashcards.length > 0) {
        generateQuestion(validFlashcards, 0);
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

  const generateQuestion = (cards: Flashcard[], index: number) => {
    if (index >= cards.length) {
      toast({
        title: '完成！',
        description: '你已經完成所有測驗題目',
      });
      return;
    }

    const card = cards[index];
    if (!card.example_sentence_1) return;

    const sentence = card.example_sentence_1;
    const correctAnswer = card.front;

    // Create blank in sentence
    const blankSentence = sentence.replace(
      new RegExp(`\\b${correctAnswer}\\b`, 'gi'),
      '______'
    );

    // Generate wrong options from other flashcards
    const otherCards = cards.filter(c => c.id !== card.id);
    const wrongOptions = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.front);

    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      sentence: blankSentence,
      correctAnswer,
      options: allOptions,
      flashcardId: card.id,
    });
    setSelectedAnswer('');
    setShowResult(false);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (correct) {
        // Get current progress
        const { data: progressData } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('flashcard_id', currentQuestion.flashcardId)
          .maybeSingle();

        const currentStreak = progressData?.correct_streak || 0;
        const newStreak = currentStreak + 1;

        if (newStreak >= requiredStreak) {
          // Move to learned
          await supabase
            .from('user_flashcard_progress')
            .upsert({
              user_id: user.id,
              flashcard_id: currentQuestion.flashcardId,
              is_learned: true,
              correct_streak: newStreak,
              last_reviewed: new Date().toISOString(),
              review_count: (progressData?.review_count || 0) + 1,
            });

          toast({
            title: '恭喜！',
            description: '此單字已移至熟悉單字本',
          });
        } else {
          // Update streak
          await supabase
            .from('user_flashcard_progress')
            .upsert({
              user_id: user.id,
              flashcard_id: currentQuestion.flashcardId,
              is_learned: false,
              correct_streak: newStreak,
              last_reviewed: new Date().toISOString(),
              review_count: (progressData?.review_count || 0) + 1,
            });

          toast({
            title: '答對了！',
            description: `再答對 ${requiredStreak - newStreak} 次就能移至熟悉單字本`,
          });
        }
      } else {
        // Reset streak on wrong answer
        const { data: progressData } = await supabase
          .from('user_flashcard_progress')
          .select('review_count')
          .eq('user_id', user.id)
          .eq('flashcard_id', currentQuestion.flashcardId)
          .maybeSingle();

        await supabase
          .from('user_flashcard_progress')
          .upsert({
            user_id: user.id,
            flashcard_id: currentQuestion.flashcardId,
            is_learned: false,
            correct_streak: 0,
            last_reviewed: new Date().toISOString(),
            review_count: (progressData?.review_count || 0) + 1,
          });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNext = () => {
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    generateQuestion(flashcards, nextIndex);
  };

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
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">目前沒有可測驗的單字</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">測驗已完成！</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/flashcards')}>查看單字卡</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                題目 {questionIndex + 1} / {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <Label>連續答對次數設定：</Label>
                <select
                  value={requiredStreak}
                  onChange={(e) => setRequiredStreak(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  <option value={1}>1次</option>
                  <option value={2}>2次</option>
                  <option value={3}>3次</option>
                </select>
              </div>
            </div>
            <Progress value={(questionIndex / totalQuestions) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>請選擇正確答案填入空格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg font-medium">{currentQuestion.sentence}</p>
            </div>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded border ${
                    showResult && option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : showResult && option === selectedAnswer && !isCorrect
                      ? 'border-red-500 bg-red-50'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={showResult} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {showResult && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && option === selectedAnswer && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-2">
              {!showResult ? (
                <Button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full">
                  提交答案
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  {questionIndex < totalQuestions - 1 ? '下一題' : '完成測驗'}
                </Button>
              )}
            </div>

            {showResult && (
              <div
                className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '答對了！' : `答錯了！正確答案是：${currentQuestion.correctAnswer}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;