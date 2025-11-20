import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Flashcard } from '@/types/flashcard';

interface FlashcardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (front: string, back: string) => void;
  editCard?: Flashcard | null;
}

export const FlashcardForm = ({ open, onOpenChange, onSubmit, editCard }: FlashcardFormProps) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => {
    if (editCard) {
      setFront(editCard.front);
      setBack(editCard.back);
    } else {
      setFront('');
      setBack('');
    }
  }, [editCard, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSubmit(front.trim(), back.trim());
      setFront('');
      setBack('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editCard ? '編輯單字卡' : '新增單字卡'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front">正面（問題）</Label>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="例如：單字、問題"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">背面（答案）</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="例如：解釋、答案"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              {editCard ? '更新' : '新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
