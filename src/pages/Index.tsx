import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <div className="mb-8">
          <GraduationCap className="h-20 w-20 mx-auto text-primary mb-4" />
          <h1 className="text-5xl font-bold mb-4">單字卡學習系統</h1>
          <p className="text-xl text-muted-foreground">
            建立你的專屬單字卡，隨時隨地學習
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/flashcards">
              <BookOpen className="h-5 w-5 mr-2" />
              管理單字卡
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/study">
              <Plus className="h-5 w-5 mr-2" />
              開始學習
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
