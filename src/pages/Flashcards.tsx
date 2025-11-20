import { useState } from 'react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { FlashcardForm } from '@/components/FlashcardForm';
import { FlashcardList } from '@/components/FlashcardList';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flashcard } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

const Flashcards = () => {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useFlashcards();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const { toast } = useToast();

  const handleSubmit = (front: string, back: string, data?: Partial<Flashcard>) => {
    if (editingCard) {
      updateFlashcard(editingCard.id, front, back, data);
      toast({
        title: '更新成功',
        description: '單字卡已更新',
      });
    } else {
      addFlashcard(front, back, data);
      toast({
        title: '新增成功',
        description: '單字卡已建立',
      });
    }
    setEditingCard(null);
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFlashcard(id);
    toast({
      title: '刪除成功',
      description: '單字卡已刪除',
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCard(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">單字卡管理</h1>
            <p className="text-muted-foreground">
              建立和管理你的學習單字卡
            </p>
          </div>
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
      </div>
    </div>
  );
};

export default Flashcards;
