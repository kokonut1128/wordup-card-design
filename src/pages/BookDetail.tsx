import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Edit, Book, X } from 'lucide-react';
import type { WordBook } from '@/types/wordBook';
interface SimpleFlashcard {
  id: string;
  front: string;
  back: string;
  phonetic?: string;
}

interface BookCard {
  id: string;
  flashcard_id: string;
  position: number;
  flashcard: {
    id: string;
    front: string;
    back: string;
    phonetic?: string;
  };
}

const BookDetail = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const { toast } = useToast();
  const [book, setBook] = useState<WordBook | null>(null);
  const [cards, setCards] = useState<BookCard[]>([]);
  const [allFlashcards, setAllFlashcards] = useState<SimpleFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (bookId) fetchBookData();
  }, [bookId]);

  const fetchBookData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      // Fetch book info
      const { data: bookData, error: bookError } = await supabase
        .from('word_books')
        .select('*')
        .eq('id', bookId)
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (bookError) throw bookError;
      if (!bookData) {
        toast({ variant: 'destructive', title: '找不到此書本' });
        navigate('/bookshelf');
        return;
      }

      setBook(bookData);
      setEditForm({ title: bookData.title, description: bookData.description || '' });

      // Fetch cards in book with flashcard details
      const { data: cardsData, error: cardsError } = await supabase
        .from('word_book_cards')
        .select(`
          id,
          flashcard_id,
          position,
          flashcard:flashcards(id, front, back, phonetic)
        `)
        .eq('book_id', bookId)
        .order('position', { ascending: true });

      if (cardsError) throw cardsError;
      
      // Transform the data to match our expected structure
      const transformedCards = (cardsData || []).map(card => ({
        id: card.id,
        flashcard_id: card.flashcard_id,
        position: card.position,
        flashcard: Array.isArray(card.flashcard) ? card.flashcard[0] : card.flashcard
      })).filter(card => card.flashcard);

      setCards(transformedCards);

      // Fetch all user's flashcards for adding
      const { data: allCards } = await supabase
        .from('flashcards')
        .select('id, front, back, phonetic')
        .eq('user_id', session.session.user.id)
        .order('front', { ascending: true });

      setAllFlashcards(allCards || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({ variant: 'destructive', title: '載入失敗', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCards = async () => {
    if (selectedCards.size === 0) {
      toast({ variant: 'destructive', title: '請選擇要加入的單字' });
      return;
    }

    // Check 200 card limit
    if (cards.length + selectedCards.size > 200) {
      toast({ variant: 'destructive', title: '超出限制', description: '每本書最多只能有 200 個單字' });
      return;
    }

    try {
      const newCards = Array.from(selectedCards).map((flashcard_id, index) => ({
        book_id: bookId,
        flashcard_id,
        position: cards.length + index,
      }));

      const { error } = await supabase.from('word_book_cards').insert(newCards);
      if (error) throw error;

      toast({ title: '加入成功', description: `已加入 ${selectedCards.size} 個單字` });
      setSelectedCards(new Set());
      setIsAddOpen(false);
      fetchBookData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '加入失敗', description: error.message });
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      const { error } = await supabase.from('word_book_cards').delete().eq('id', cardId);
      if (error) throw error;
      
      toast({ title: '已移除單字' });
      setCards(cards.filter(c => c.id !== cardId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: '移除失敗', description: error.message });
    }
  };

  const handleUpdateBook = async () => {
    if (!editForm.title.trim()) {
      toast({ variant: 'destructive', title: '請輸入書本名稱' });
      return;
    }

    try {
      const { error } = await supabase
        .from('word_books')
        .update({ title: editForm.title.trim(), description: editForm.description.trim() || null })
        .eq('id', bookId);

      if (error) throw error;
      
      toast({ title: '更新成功' });
      setBook({ ...book!, title: editForm.title.trim(), description: editForm.description.trim() });
      setIsEditOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: '更新失敗', description: error.message });
    }
  };

  const handleDeleteBook = async () => {
    try {
      const { error } = await supabase.from('word_books').delete().eq('id', bookId);
      if (error) throw error;
      
      toast({ title: '已刪除書本' });
      navigate('/bookshelf');
    } catch (error: any) {
      toast({ variant: 'destructive', title: '刪除失敗', description: error.message });
    }
  };

  // Get cards not yet in book for selection
  const existingCardIds = new Set(cards.map(c => c.flashcard_id));
  const availableCards = allFlashcards.filter(f => !existingCardIds.has(f.id));
  const filteredAvailable = searchTerm
    ? availableCards.filter(f => f.front.toLowerCase().includes(searchTerm.toLowerCase()))
    : availableCards;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/bookshelf')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{book.title}</h1>
            {book.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{book.description}</p>
            )}
          </div>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>編輯書本</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">書本名稱</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">簡述</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateBook} className="flex-1">儲存</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>確定刪除此書本？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作無法復原，書本內的單字關聯將被移除（單字本身不會被刪除）
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBook}>刪除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-muted-foreground">{cards.length} / 200 字</span>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={cards.length >= 200}>
                <Plus className="h-4 w-4 mr-2" />
                加入單字
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>加入單字到書本</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <Input
                  placeholder="搜尋單字..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto border rounded-lg divide-y">
                  {filteredAvailable.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {availableCards.length === 0 ? '所有單字都已加入' : '找不到符合的單字'}
                    </div>
                  ) : (
                    filteredAvailable.map(card => (
                      <label
                        key={card.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedCards.has(card.id)}
                          onCheckedChange={(checked) => {
                            const newSet = new Set(selectedCards);
                            if (checked) {
                              newSet.add(card.id);
                            } else {
                              newSet.delete(card.id);
                            }
                            setSelectedCards(newSet);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{card.front}</div>
                          <div className="text-sm text-muted-foreground truncate">{card.back}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    已選 {selectedCards.size} 個
                  </span>
                  <Button onClick={handleAddCards} disabled={selectedCards.size === 0}>
                    加入選取的單字
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards List */}
        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">這本書還沒有單字</p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                加入第一個單字
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {cards.map((card, index) => (
              <Card key={card.id} className="group">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="text-sm text-muted-foreground w-8">{index + 1}</span>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/word/${encodeURIComponent(card.flashcard.front)}`)}
                  >
                    <div className="font-medium">{card.flashcard.front}</div>
                    {card.flashcard.phonetic && (
                      <div className="text-sm text-muted-foreground">{card.flashcard.phonetic}</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground hidden sm:block max-w-[200px] truncate">
                    {card.flashcard.back}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveCard(card.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookDetail;
