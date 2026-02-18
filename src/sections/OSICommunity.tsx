import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  ThumbsUp,
  Send,
  Clock,
  Star,
  Search,
  Share2
} from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  ticker: string;
  content: string;
  type: 'suggestion' | 'analysis' | 'question' | 'general';
  likes: number;
  replies: number;
  timestamp: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface CompanyDiscussion {
  ticker: string;
  name: string;
  comments: number;
  lastActivity: string;
  trend: 'up' | 'down';
}

const recentComments: Comment[] = [
  {
    id: '1',
    user: { name: 'أحمد محمد', avatar: 'أم', badge: 'ذهبي' },
    ticker: 'AAPL',
    content: 'أرى إشارة تجميع قوية على آبل اليوم، التدفق المؤسسي إيجابي والحجم مرتفع. أنصح بالشراء عند التصحيح.',
    type: 'analysis',
    likes: 24,
    replies: 8,
    timestamp: 'منذ 15 دقيقة',
    sentiment: 'bullish'
  },
  {
    id: '2',
    user: { name: 'سارة خالد', avatar: 'سخ', badge: 'فضي' },
    ticker: 'NVDA',
    content: 'نفيديا يظهر ضعفاً في مستويات المقاومة، انتبهوا للتصريف المحتمل في الجلسة القادمة.',
    type: 'suggestion',
    likes: 18,
    replies: 5,
    timestamp: 'منذ 32 دقيقة',
    sentiment: 'bearish'
  },
  {
    id: '3',
    user: { name: 'خالد العلي', avatar: 'خع' },
    ticker: 'TSLA',
    content: 'هل أحد يراقب تسلا؟ فيه تجميع جيد على المستوى اليومي.',
    type: 'question',
    likes: 12,
    replies: 15,
    timestamp: 'منذ ساعة',
    sentiment: 'bullish'
  },
  {
    id: '4',
    user: { name: 'نورة الفهد', avatar: 'نف', badge: 'ذهبي' },
    ticker: 'META',
    content: 'ميتا يتداول في منطقة دعم قوية، فرصة جيدة للدخول بكميات تدريجية.',
    type: 'analysis',
    likes: 31,
    replies: 12,
    timestamp: 'منذ ساعتين',
    sentiment: 'bullish'
  },
  {
    id: '5',
    user: { name: 'محمد عبدالله', avatar: 'مع' },
    ticker: 'AMD',
    content: 'AMD تحت ضغط بيعي، انتظروا مستويات الدعم 110$ قبل التفكير في الشراء.',
    type: 'suggestion',
    likes: 9,
    replies: 4,
    timestamp: 'منذ 3 ساعات',
    sentiment: 'bearish'
  }
];

const activeDiscussions: CompanyDiscussion[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', comments: 156, lastActivity: 'منذ 5 دقائق', trend: 'up' },
  { ticker: 'NVDA', name: 'NVIDIA', comments: 142, lastActivity: 'منذ 12 دقيقة', trend: 'up' },
  { ticker: 'TSLA', name: 'Tesla', comments: 128, lastActivity: 'منذ 20 دقيقة', trend: 'down' },
  { ticker: 'META', name: 'Meta', comments: 98, lastActivity: 'منذ 30 دقيقة', trend: 'up' },
  { ticker: 'AMD', name: 'AMD', comments: 87, lastActivity: 'منذ 45 دقيقة', trend: 'down' },
  { ticker: 'MSFT', name: 'Microsoft', comments: 76, lastActivity: 'منذ ساعة', trend: 'up' }
];

const getTypeBadge = (type: string) => {
  const badges: Record<string, { label: string; color: string }> = {
    suggestion: { label: 'اقتراح', color: 'bg-blue-100 text-blue-700' },
    analysis: { label: 'تحليل', color: 'bg-purple-100 text-purple-700' },
    question: { label: 'سؤال', color: 'bg-orange-100 text-orange-700' },
    general: { label: 'عام', color: 'bg-slate-100 text-slate-700' }
  };
  const badge = badges[type] || badges.general;
  return <Badge className={badge.color}>{badge.label}</Badge>;
};

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'bullish':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'bearish':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export function OSICommunity() {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('discussions');

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Users className="w-4 h-4 inline ml-1" />
            مجتمع أوسي
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            شارك أفكارك مع المجتمع
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            منصة تفاعلية للمشتركين لمشاركة الأفكار والتحليلات والاقتراحات حول الشركات
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="discussions">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  المناقشات الحية
                </TabsTrigger>
                <TabsTrigger value="companies">
                  <TrendingUp className="w-4 h-4 ml-2" />
                  شركات نشطة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions" className="space-y-4">
                {/* New Comment Input */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-600 text-white">أن</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          placeholder="شارك تحليلك أو اقتراحك..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                              صاعد
                            </Button>
                            <Button variant="outline" size="sm">
                              <TrendingDown className="w-4 h-4 ml-1 text-red-500" />
                              هابط
                            </Button>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Send className="w-4 h-4 ml-1" />
                            نشر
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                {recentComments.map((comment) => (
                  <Card key={comment.id} className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            {comment.user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-900 dark:text-white">{comment.user.name}</span>
                            {comment.user.badge && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                <Star className="w-3 h-3 ml-1" />
                                {comment.user.badge}
                              </Badge>
                            )}
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {comment.timestamp}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-700">${comment.ticker}</Badge>
                            {getTypeBadge(comment.type)}
                            {getSentimentIcon(comment.sentiment)}
                          </div>
                          
                          <p className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-purple-600">
                              <ThumbsUp className="w-4 h-4 ml-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-purple-600">
                              <MessageSquare className="w-4 h-4 ml-1" />
                              {comment.replies}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-purple-600">
                              <Share2 className="w-4 h-4 ml-1" />
                              مشاركة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button variant="outline" className="w-full">
                  تحميل المزيد
                </Button>
              </TabsContent>

              <TabsContent value="companies" className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input placeholder="ابحث عن شركة..." className="pr-10" />
                </div>

                {/* Active Companies */}
                {activeDiscussions.map((company) => (
                  <Card key={company.ticker} className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {company.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{company.ticker}</h4>
                            <p className="text-sm text-slate-500">{company.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MessageSquare className="w-4 h-4" />
                            <span>{company.comments} تعليق</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            {company.lastActivity}
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${company.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {company.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  إحصائيات المجتمع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">أعضاء نشطون</span>
                  <span className="font-bold text-slate-900">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">مناقشات اليوم</span>
                  <span className="font-bold text-slate-900">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">تحليلات جديدة</span>
                  <span className="font-bold text-slate-900">89</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  أفضل المساهمين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'أحمد محمد', contributions: 156, badge: 'ذهبي' },
                  { name: 'سارة خالد', contributions: 142, badge: 'ذهبي' },
                  { name: 'خالد العلي', contributions: 128, badge: 'فضي' },
                  { name: 'نورة الفهد', contributions: 98, badge: 'فضي' }
                ].map((user, index) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.contributions} مساهمة</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                      <Star className="w-3 h-3 ml-1" />
                      {user.badge}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  المواضيع الرائجة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['التجميع على AAPL', 'تصريف NVDA', 'فرصة TSLA', 'دعم META'].map((topic) => (
                  <div key={topic} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{topic}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
