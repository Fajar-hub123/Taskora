import { Card } from '@/components/ui/Card';
import { quoteOfTheDay } from '@/lib/defaultCategories';
import { Quote } from 'lucide-react';

export function QuoteWidget() {
  return (
    <Card className="bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-mint-500/10">
      <Quote size={18} className="text-accent mb-2 opacity-70" />
      <p className="text-sm font-medium leading-relaxed">{quoteOfTheDay()}</p>
    </Card>
  );
}
