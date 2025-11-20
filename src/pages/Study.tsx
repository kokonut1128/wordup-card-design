import { useFlashcards } from '@/hooks/useFlashcards';
import { FlashcardStudy } from '@/components/FlashcardStudy';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Study = () => {
  const { flashcards, markAsReviewed } = useFlashcards();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回管理
            </Link>
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">學習模式</h1>
          <p className="text-muted-foreground">
            點擊卡片進行翻轉
          </p>
        </div>

        <FlashcardStudy
          flashcards={flashcards}
          onReviewed={markAsReviewed}
        />
      </div>
    </div>
  );
};

export default Study;
