import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Book, Folder } from 'lucide-react';
import type { WordBook } from '@/types/wordBook';

const TAGS = [
  { value: 'general', label: '一般' },
  { value: 'business', label: '商業' },
  { value: 'travel', label: '旅遊' },
  { value: 'daily', label: '日常' },
  { value: 'academic', label: '學術' },
  { value: 'toeic', label: 'TOEIC' },
  { value: 'toefl', label: 'TOEFL' },
  { value: 'ielts', label: 'IELTS' },
];

const Bookshelf = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<WordBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', description: '', tag: 'general' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      // Fetch books with card count
      const { data: booksData, error } = await supabase
        .from('word_books')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get card counts for each book
      const booksWithCount = await Promise.all(
        (booksData || []).map(async (book) => {
          const { count } = await supabase
            .from('word_book_cards')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', book.id);
          return { ...book, card_count: count || 0 };
        })
      );

      setBooks(booksWithCount);
    } catch (error: any) {
      console.error('Error fetching books:', error);
      toast({ variant: 'destructive', title: '載入失敗', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBook.title.trim()) {
      toast({ variant: 'destructive', title: '請輸入書本名稱' });
      return;
    }

    setCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { error } = await supabase.from('word_books').insert({
        user_id: session.session.user.id,
        title: newBook.title.trim(),
        description: newBook.description.trim() || null,
        tag: newBook.tag,
      });

      if (error) throw error;

      toast({ title: '建立成功', description: `已建立「${newBook.title}」` });
      setNewBook({ title: '', description: '', tag: 'general' });
      setIsCreateOpen(false);
      fetchBooks();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '建立失敗', description: error.message });
    } finally {
      setCreating(false);
    }
  };

  // Group books by tag
  const groupedBooks = books.reduce((acc, book) => {
    const tag = book.tag || 'general';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(book);
    return acc;
  }, {} as Record<string, WordBook[]>);

  const filteredBooks = selectedTag === 'all' 
    ? books 
    : books.filter(b => b.tag === selectedTag);

  const uniqueTags = [...new Set(books.map(b => b.tag || 'general'))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">我的書櫃</h1>
          <div className="flex-1" />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新增單字書
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增單字書</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">書本名稱 *</label>
                  <Input
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="輸入書本名稱"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">簡述</label>
                  <Textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    placeholder="輸入書本簡述（選填）"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">分類標籤</label>
                  <Select value={newBook.tag} onValueChange={(v) => setNewBook({ ...newBook, tag: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAGS.map(tag => (
                        <SelectItem key={tag.value} value={tag.value}>{tag.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateBook} disabled={creating} className="w-full">
                  {creating ? '建立中...' : '建立單字書'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tag Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedTag === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag('all')}
          >
            全部 ({books.length})
          </Button>
          {uniqueTags.map(tag => {
            const tagInfo = TAGS.find(t => t.value === tag);
            const count = groupedBooks[tag]?.length || 0;
            return (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tagInfo?.label || tag} ({count})
              </Button>
            );
          })}
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {selectedTag === 'all' ? '還沒有任何單字書' : '此分類沒有單字書'}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                建立第一本單字書
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map(book => (
              <Card
                key={book.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-2 group-hover:from-primary/30 transition-colors">
                    <Book className="h-12 w-12 text-primary/60" />
                  </div>
                  <CardTitle className="text-sm line-clamp-2">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{TAGS.find(t => t.value === book.tag)?.label || book.tag}</span>
                    <span>{book.card_count || 0} 字</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookshelf;
