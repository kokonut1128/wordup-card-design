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
  onSubmit: (front: string, back: string, data?: Partial<Flashcard>) => void;
  editCard?: Flashcard | null;
}

export const FlashcardForm = ({ open, onOpenChange, onSubmit, editCard }: FlashcardFormProps) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [chineseDefinition, setChineseDefinition] = useState('');
  const [englishDefinition, setEnglishDefinition] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [antonyms, setAntonyms] = useState('');
  const [relatedWords, setRelatedWords] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [exampleSentence1, setExampleSentence1] = useState('');
  const [exampleTranslation1, setExampleTranslation1] = useState('');
  const [exampleSource1, setExampleSource1] = useState('');
  const [exampleSentence2, setExampleSentence2] = useState('');
  const [exampleTranslation2, setExampleTranslation2] = useState('');
  const [exampleSource2, setExampleSource2] = useState('');
  const [exampleSentence3, setExampleSentence3] = useState('');
  const [exampleTranslation3, setExampleTranslation3] = useState('');
  const [exampleSource3, setExampleSource3] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editCard) {
      setFront(editCard.front);
      setBack(editCard.back);
      setPhonetic(editCard.phonetic || '');
      setChineseDefinition(editCard.chineseDefinition || '');
      setEnglishDefinition(editCard.englishDefinition || '');
      setSynonyms(editCard.synonyms?.join(', ') || '');
      setAntonyms(editCard.antonyms?.join(', ') || '');
      setRelatedWords(editCard.relatedWords?.join(', ') || '');
      setImageUrl(editCard.imageUrl || '');
      setExampleSentence1(editCard.exampleSentence1 || '');
      setExampleTranslation1(editCard.exampleTranslation1 || '');
      setExampleSource1(editCard.exampleSource1 || '');
      setExampleSentence2(editCard.exampleSentence2 || '');
      setExampleTranslation2(editCard.exampleTranslation2 || '');
      setExampleSource2(editCard.exampleSource2 || '');
      setExampleSentence3(editCard.exampleSentence3 || '');
      setExampleTranslation3(editCard.exampleTranslation3 || '');
      setExampleSource3(editCard.exampleSource3 || '');
    } else {
      setFront('');
      setBack('');
      setPhonetic('');
      setChineseDefinition('');
      setEnglishDefinition('');
      setSynonyms('');
      setAntonyms('');
      setRelatedWords('');
      setImageUrl('');
      setExampleSentence1('');
      setExampleTranslation1('');
      setExampleSource1('');
      setExampleSentence2('');
      setExampleTranslation2('');
      setExampleSource2('');
      setExampleSentence3('');
      setExampleTranslation3('');
      setExampleSource3('');
    }
  }, [editCard, open]);

  const handleAutoFill = async () => {
    if (!front.trim()) return;
    
    setIsLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('fetch-word-info', {
        body: { word: front.trim() }
      });

      if (error) throw error;

      if (data) {
        setPhonetic(data.phonetic || '');
        setChineseDefinition(data.chineseDefinition || '');
        setEnglishDefinition(data.englishDefinition || '');
        setSynonyms(data.synonyms?.join(', ') || '');
        setAntonyms(data.antonyms?.join(', ') || '');
        setRelatedWords(data.relatedWords?.join(', ') || '');
        setExampleSentence1(data.exampleSentence1 || '');
        setExampleTranslation1(data.exampleTranslation1 || '');
        setExampleSource1(data.exampleSource1 || '');
        setExampleSentence2(data.exampleSentence2 || '');
        setExampleTranslation2(data.exampleTranslation2 || '');
        setExampleSource2(data.exampleSource2 || '');
        setExampleSentence3(data.exampleSentence3 || '');
        setExampleTranslation3(data.exampleTranslation3 || '');
        setExampleSource3(data.exampleSource3 || '');
      }
    } catch (error) {
      console.error('自動填充失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      const additionalData: Partial<Flashcard> = {
        phonetic: phonetic.trim() || undefined,
        chineseDefinition: chineseDefinition.trim() || undefined,
        englishDefinition: englishDefinition.trim() || undefined,
        synonyms: synonyms.trim() ? synonyms.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        antonyms: antonyms.trim() ? antonyms.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        relatedWords: relatedWords.trim() ? relatedWords.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        imageUrl: imageUrl.trim() || undefined,
        exampleSentence1: exampleSentence1.trim() || undefined,
        exampleTranslation1: exampleTranslation1.trim() || undefined,
        exampleSource1: exampleSource1.trim() || undefined,
        exampleSentence2: exampleSentence2.trim() || undefined,
        exampleTranslation2: exampleTranslation2.trim() || undefined,
        exampleSource2: exampleSource2.trim() || undefined,
        exampleSentence3: exampleSentence3.trim() || undefined,
        exampleTranslation3: exampleTranslation3.trim() || undefined,
        exampleSource3: exampleSource3.trim() || undefined,
      };
      onSubmit(front.trim(), back.trim(), additionalData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editCard ? '編輯單字卡' : '新增單字卡'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="front">單字</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAutoFill}
                  disabled={!front.trim() || isLoading}
                >
                  {isLoading ? '查詢中...' : 'AI 自動填充'}
                </Button>
              </div>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="輸入英文單字"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phonetic">音標</Label>
              <Input
                id="phonetic"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="例如：/həˈloʊ/"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chineseDefinition">中文解釋</Label>
              <Textarea
                id="chineseDefinition"
                value={chineseDefinition}
                onChange={(e) => setChineseDefinition(e.target.value)}
                placeholder="輸入中文解釋"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="englishDefinition">英文解釋</Label>
              <Textarea
                id="englishDefinition"
                value={englishDefinition}
                onChange={(e) => setEnglishDefinition(e.target.value)}
                placeholder="輸入英文解釋"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">簡易解釋</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="簡短的解釋或答案"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synonyms">同義詞（用逗號分隔）</Label>
              <Input
                id="synonyms"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="例如：hi, greetings, hey"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="antonyms">反義詞（用逗號分隔）</Label>
              <Input
                id="antonyms"
                value={antonyms}
                onChange={(e) => setAntonyms(e.target.value)}
                placeholder="例如：goodbye, farewell"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedWords">相關詞（用逗號分隔）</Label>
              <Input
                id="relatedWords"
                value={relatedWords}
                onChange={(e) => setRelatedWords(e.target.value)}
                placeholder="例如：greeting, welcome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">相關圖片 URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="輸入圖片網址"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSentence1">例句 1</Label>
              <Textarea
                id="exampleSentence1"
                value={exampleSentence1}
                onChange={(e) => setExampleSentence1(e.target.value)}
                placeholder="輸入英文例句"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleTranslation1">例句 1 翻譯</Label>
              <Textarea
                id="exampleTranslation1"
                value={exampleTranslation1}
                onChange={(e) => setExampleTranslation1(e.target.value)}
                placeholder="輸入中文翻譯"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSource1">例句 1 來源 URL</Label>
              <Input
                id="exampleSource1"
                value={exampleSource1}
                onChange={(e) => setExampleSource1(e.target.value)}
                placeholder="輸入例句來源網址"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSentence2">例句 2</Label>
              <Textarea
                id="exampleSentence2"
                value={exampleSentence2}
                onChange={(e) => setExampleSentence2(e.target.value)}
                placeholder="輸入英文例句"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleTranslation2">例句 2 翻譯</Label>
              <Textarea
                id="exampleTranslation2"
                value={exampleTranslation2}
                onChange={(e) => setExampleTranslation2(e.target.value)}
                placeholder="輸入中文翻譯"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSource2">例句 2 來源 URL</Label>
              <Input
                id="exampleSource2"
                value={exampleSource2}
                onChange={(e) => setExampleSource2(e.target.value)}
                placeholder="輸入例句來源網址"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSentence3">例句 3</Label>
              <Textarea
                id="exampleSentence3"
                value={exampleSentence3}
                onChange={(e) => setExampleSentence3(e.target.value)}
                placeholder="輸入英文例句"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleTranslation3">例句 3 翻譯</Label>
              <Textarea
                id="exampleTranslation3"
                value={exampleTranslation3}
                onChange={(e) => setExampleTranslation3(e.target.value)}
                placeholder="輸入中文翻譯"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleSource3">例句 3 來源 URL</Label>
              <Input
                id="exampleSource3"
                value={exampleSource3}
                onChange={(e) => setExampleSource3(e.target.value)}
                placeholder="輸入例句來源網址"
                type="url"
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
