import { useState } from 'react';
import { Flashcard } from '@/types/flashcard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  onReviewed: (id: string) => void;
}

export const FlashcardStudy = ({ flashcards, onReviewed }: FlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">沒有可學習的單字卡</p>
        <p className="text-muted-foreground text-sm mt-2">請先建立一些單字卡</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      onReviewed(currentCard.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {flashcards.length}
        </p>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          重新開始
        </Button>
      </div>

      <div
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-96 transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <Card className="absolute w-full h-full backface-hidden">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">正面</p>
                <p className="text-3xl font-bold">{currentCard.front}</p>
                <p className="text-sm text-muted-foreground">點擊翻轉查看答案</p>
              </div>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="absolute w-full h-full backface-hidden rotate-y-180 bg-primary text-primary-foreground">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-4">
                <p className="text-xs opacity-80 uppercase tracking-wide">背面</p>
                <p className="text-2xl whitespace-pre-wrap">{currentCard.back}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一張
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          下一張
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
