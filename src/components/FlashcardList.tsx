import { Flashcard } from '@/types/flashcard';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlashcardListProps {
  flashcards: Flashcard[];
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

export const FlashcardList = ({ flashcards, onEdit, onDelete }: FlashcardListProps) => {
  const navigate = useNavigate();

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">尚未建立任何單字卡</p>
        <p className="text-muted-foreground text-sm mt-2">點擊「新增單字卡」開始建立</p>
      </div>
    );
  }

  const handleCardClick = (card: Flashcard) => {
    navigate(`/word/${encodeURIComponent(card.front)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((card) => (
        <Card key={card.id} className="hover-scale cursor-pointer" onClick={() => handleCardClick(card)}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">正面</p>
                <p className="font-medium">{card.front}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">背面</p>
                <p className="text-sm text-muted-foreground">{card.back}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(card)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              編輯
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(card.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
