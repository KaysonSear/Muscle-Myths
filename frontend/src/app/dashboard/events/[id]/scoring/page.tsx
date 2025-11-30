'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Trophy, Save, Users, Medal, Crown, AlertTriangle, Settings2, UserCheck } from 'lucide-react';

interface Athlete {
  _id: string;
  name: string;
  bib_number: string;
  gender: string;
}

interface LineupItem {
  order: number;
  athlete_id: Athlete;
  category: string;
  is_display: boolean;
  is_retired: boolean;
}

interface Score {
  _id?: string;
  event_id: string;
  category: string;
  athlete_id: string;
  judge_scores: number[];
  total_score: number;
  rank: number;
  is_champion: boolean;
  is_retired: boolean;
}

interface CategoryScores {
  [athleteId: string]: {
    judge_scores: number[];
    total_score: number;
    rank: number;
    is_champion: boolean;
    is_retired: boolean;
  };
}

export default function ScoringPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [event, setEvent] = useState<any>(null);
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [judgeCount, setJudgeCount] = useState<number>(5);
  const [judgeNames, setJudgeNames] = useState<string[]>(['', '', '', '', '', '', '']);
  const [tempJudgeCount, setTempJudgeCount] = useState<number>(5);
  const [tempJudgeNames, setTempJudgeNames] = useState<string[]>(['', '', '', '', '', '', '']);
  const [judgeDialogOpen, setJudgeDialogOpen] = useState(false);
  const [isJudgeConfigured, setIsJudgeConfigured] = useState(false);
  const [scores, setScores] = useState<CategoryScores>({});
  const [existingScores, setExistingScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 获取赛事信息
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_URL}/events/${eventId}`);
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        toast.error('获取赛事信息失败');
      }
    };
    fetchEvent();
  }, [eventId]);

  // 获取秩序表
  useEffect(() => {
    const fetchLineup = async () => {
      try {
        const res = await fetch(`${API_URL}/lineups/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setLineup(data.lineup || []);

          // 提取唯一的组别
          const uniqueCategories = [
            ...new Set(data.lineup.map((item: LineupItem) => item.category)),
          ] as string[];
          setCategories(uniqueCategories);

          if (uniqueCategories.length > 0) {
            setSelectedCategory(uniqueCategories[0]);
          }
        } else {
          toast.error('秩序表未生成，请先生成秩序表');
        }
      } catch (error) {
        toast.error('获取秩序表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchLineup();
  }, [eventId]);

  // 获取已有分数
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`${API_URL}/scores/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setExistingScores(data);
        }
      } catch (error) {
        console.error('获取分数失败', error);
      }
    };
    fetchScores();
  }, [eventId]);

  // 当选择组别变化时，加载该组别的已有分数
  useEffect(() => {
    if (!selectedCategory || existingScores.length === 0) return;

    const categoryScores = existingScores.filter(
      (s) => s.category === selectedCategory
    );

    const newScores: CategoryScores = {};
    categoryScores.forEach((s) => {
      newScores[s.athlete_id] = {
        judge_scores: s.judge_scores,
        total_score: s.total_score,
        rank: s.rank,
        is_champion: s.is_champion,
        is_retired: s.is_retired,
      };
    });
    setScores(newScores);
  }, [selectedCategory, existingScores]);

  // 获取当前组别的选手列表
  const currentAthletes = lineup.filter(
    (item) => item.category === selectedCategory
  );

  // 计算去极值后的总分
  const calculateTotalScore = useCallback((judgeScores: number[]): number => {
    const validScores = judgeScores.filter((s) => s > 0);
    if (validScores.length === 0) return 0;

    let scoresToSum = [...validScores];
    scoresToSum.sort((a, b) => a - b);

    // 如果有5个或以上的分数，去掉最高和最低
    if (scoresToSum.length >= 5) {
      scoresToSum = scoresToSum.slice(1, -1);
    }

    return scoresToSum.reduce((sum, s) => sum + s, 0);
  }, []);

  // 获取被去除的最高分和最低分的索引
  const getExcludedScoreIndices = useCallback((judgeScores: number[]): { minIndex: number; maxIndex: number } | null => {
    const validScores = judgeScores.filter((s) => s > 0);
    if (validScores.length < 5) return null;

    // 找到最小值和最大值
    let minVal = Infinity, maxVal = -Infinity;
    let minIndex = -1, maxIndex = -1;

    judgeScores.forEach((score, index) => {
      if (score > 0) {
        if (score < minVal) {
          minVal = score;
          minIndex = index;
        }
        if (score > maxVal) {
          maxVal = score;
          maxIndex = index;
        }
      }
    });

    return { minIndex, maxIndex };
  }, []);

  // 处理分数输入变化
  const handleScoreChange = (
    athleteId: string,
    judgeIndex: number,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    
    setScores((prev) => {
      const athleteScores = prev[athleteId] || {
        judge_scores: Array(judgeCount).fill(0),
        total_score: 0,
        rank: 0,
        is_champion: false,
        is_retired: false,
      };

      const newJudgeScores = [...athleteScores.judge_scores];
      // 确保数组足够长
      while (newJudgeScores.length < judgeCount) {
        newJudgeScores.push(0);
      }
      newJudgeScores[judgeIndex] = numValue;

      const newTotalScore = calculateTotalScore(newJudgeScores);

      return {
        ...prev,
        [athleteId]: {
          ...athleteScores,
          judge_scores: newJudgeScores,
          total_score: newTotalScore,
        },
      };
    });
  };

  // 计算当前组别的排名
  const calculateRanks = useCallback(() => {
    const athletesWithScores = currentAthletes
      .map((item) => ({
        athleteId: item.athlete_id._id,
        totalScore: scores[item.athlete_id._id]?.total_score || 0,
        isRetired: scores[item.athlete_id._id]?.is_retired || false,
      }))
      .filter((a) => !a.isRetired && a.totalScore > 0)
      .sort((a, b) => a.totalScore - b.totalScore); // 健美比赛低分更好

    const ranks: { [key: string]: { rank: number; isChampion: boolean } } = {};
    athletesWithScores.forEach((a, index) => {
      ranks[a.athleteId] = {
        rank: index + 1,
        isChampion: index === 0,
      };
    });

    return ranks;
  }, [currentAthletes, scores]);

  const ranks = calculateRanks();

  // 保存分数
  const saveScores = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }

    setSaving(true);
    try {
      // 批量保存当前组别的所有分数
      const promises = currentAthletes
        .filter((item) => {
          const athleteScore = scores[item.athlete_id._id];
          return athleteScore && athleteScore.judge_scores.some((s) => s > 0);
        })
        .map((item) => {
          const athleteScore = scores[item.athlete_id._id];
          return fetch(`${API_URL}/scores`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              event_id: eventId,
              athlete_id: item.athlete_id._id,
              category: selectedCategory,
              judge_scores: athleteScore.judge_scores,
            }),
          });
        });

      await Promise.all(promises);
      toast.success('分数保存成功！');

      // 刷新分数数据
      const res = await fetch(`${API_URL}/scores/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setExistingScores(data);
      }
    } catch (error) {
      toast.error('保存分数失败');
    } finally {
      setSaving(false);
    }
  };

  // 检测同分情况
  const detectTies = useCallback(() => {
    const scoreGroups: { [score: number]: string[] } = {};
    
    currentAthletes.forEach((item) => {
      const athleteScore = scores[item.athlete_id._id];
      if (athleteScore && athleteScore.total_score > 0 && !athleteScore.is_retired) {
        const total = athleteScore.total_score;
        if (!scoreGroups[total]) {
          scoreGroups[total] = [];
        }
        scoreGroups[total].push(item.athlete_id._id);
      }
    });

    // 返回有同分的选手ID集合
    const tiedAthletes = new Set<string>();
    Object.values(scoreGroups).forEach((athletes) => {
      if (athletes.length > 1) {
        athletes.forEach((id) => tiedAthletes.add(id));
      }
    });

    return tiedAthletes;
  }, [currentAthletes, scores]);

  const tiedAthletes = detectTies();

  // 打开对话框时同步临时状态
  const openJudgeDialog = () => {
    setTempJudgeCount(judgeCount);
    setTempJudgeNames([...judgeNames]);
    setJudgeDialogOpen(true);
  };

  // 确认裁判设置
  const confirmJudgeSettings = () => {
    setJudgeCount(tempJudgeCount);
    setJudgeNames([...tempJudgeNames]);
    setIsJudgeConfigured(true);
    setJudgeDialogOpen(false);
    toast.success(`已设置 ${tempJudgeCount} 位裁判`);
  };

  // 更新临时裁判姓名
  const updateTempJudgeName = (index: number, name: string) => {
    const newNames = [...tempJudgeNames];
    newNames[index] = name;
    setTempJudgeNames(newNames);
  };

  // 获取裁判显示名称
  const getJudgeName = (index: number) => {
    return judgeNames[index] || `裁判 ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回赛事详情
          </Button>
        </Link>
        <Card className="border-2 border-destructive/50 rounded-none">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">秩序表未生成</h2>
            <p className="text-muted-foreground mb-4">
              请先返回赛事详情页生成秩序表，然后再进行计分。
            </p>
            <Link href={`/dashboard/events/${eventId}`}>
              <Button className="rounded-none">返回生成秩序表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black pb-4">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/events/${eventId}`}>
            <Button variant="ghost" size="icon" className="rounded-none">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground font-mono">计分模式</p>
            <h1 className="text-2xl font-black tracking-tight">
              {event?.name || '加载中...'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 裁判设置对话框 */}
          <Dialog open={judgeDialogOpen} onOpenChange={setJudgeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={openJudgeDialog}
                className={`rounded-none gap-2 ${
                  isJudgeConfigured
                    ? 'border-green-600 text-green-700 bg-green-50'
                    : 'border-black'
                }`}
              >
                <Settings2 className="h-4 w-4" />
                {isJudgeConfigured ? `${judgeCount} 位裁判` : '设置裁判'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-none border-2 border-black">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black">
                  <UserCheck className="h-5 w-5" />
                  裁判人数设置
                </DialogTitle>
                <DialogDescription>
                  设置本场比赛的裁判人数和姓名（可选）
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* 裁判人数选择 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">裁判人数</Label>
                  <Select
                    value={tempJudgeCount.toString()}
                    onValueChange={(v) => setTempJudgeCount(parseInt(v))}
                  >
                    <SelectTrigger className="w-full rounded-none border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 位裁判</SelectItem>
                      <SelectItem value="7">7 位裁判</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    * 5位或7位裁判时，将自动去掉最高分和最低分
                  </p>
                </div>

                {/* 裁判姓名输入 */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold">裁判姓名（可选）</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: tempJudgeCount }, (_, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          裁判 {i + 1}
                        </Label>
                        <Input
                          placeholder={`裁判 ${i + 1}`}
                          value={tempJudgeNames[i] || ''}
                          onChange={(e) => updateTempJudgeName(i, e.target.value)}
                          className="rounded-none border-black/30"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setJudgeDialogOpen(false)}
                  className="rounded-none border-black"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmJudgeSettings}
                  className="rounded-none bg-black text-white hover:bg-black/90"
                >
                  确认设置
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={saveScores}
            disabled={saving}
            className="rounded-none bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '保存分数'}
          </Button>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-none ${
              selectedCategory === cat
                ? 'bg-black text-white'
                : 'border-black hover:bg-black hover:text-white'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Scoring Table */}
      <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b border-black bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {selectedCategory} - 裁判评分表
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({currentAthletes.length} 名选手)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black bg-muted/20">
                  <th className="text-left p-3 font-bold text-sm min-w-[60px]">
                    排名
                  </th>
                  <th className="text-left p-3 font-bold text-sm min-w-[80px]">
                    号码牌
                  </th>
                  <th className="text-left p-3 font-bold text-sm min-w-[120px]">
                    选手姓名
                  </th>
                  {Array.from({ length: judgeCount }, (_, i) => (
                    <th
                      key={i}
                      className="text-center p-3 font-bold text-sm min-w-[80px]"
                      title={judgeNames[i] ? `裁判 ${i + 1}: ${judgeNames[i]}` : undefined}
                    >
                      {getJudgeName(i)}
                    </th>
                  ))}
                  <th className="text-center p-3 font-bold text-sm min-w-[100px] bg-primary/10">
                    总分
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAthletes.map((item) => {
                  const athleteScore = scores[item.athlete_id._id] || {
                    judge_scores: Array(judgeCount).fill(0),
                    total_score: 0,
                  };
                  const athleteRank = ranks[item.athlete_id._id];
                  const isTied = tiedAthletes.has(item.athlete_id._id);
                  const excludedIndices = getExcludedScoreIndices(athleteScore.judge_scores);

                  return (
                    <tr
                      key={item.athlete_id._id}
                      className={`border-b border-black/10 hover:bg-muted/10 transition-colors ${
                        isTied ? 'bg-yellow-100 animate-pulse' : ''
                      } ${athleteRank?.isChampion ? 'bg-amber-50' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {athleteRank?.isChampion && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                          {athleteRank?.rank ? (
                            <span
                              className={`font-mono font-bold ${
                                athleteRank.rank <= 3
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              #{athleteRank.rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {isTied && (
                            <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded animate-pulse">
                              同分
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-lg">
                          {item.athlete_id.bib_number}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{item.athlete_id.name}</td>
                      {Array.from({ length: judgeCount }, (_, i) => {
                        const isExcludedMin = excludedIndices?.minIndex === i;
                        const isExcludedMax = excludedIndices?.maxIndex === i;
                        const isExcluded = isExcludedMin || isExcludedMax;
                        const scoreValue = athleteScore.judge_scores[i] || 0;

                        return (
                          <td key={i} className="p-2 relative">
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={scoreValue || ''}
                                onChange={(e) =>
                                  handleScoreChange(
                                    item.athlete_id._id,
                                    i,
                                    e.target.value
                                  )
                                }
                                className={`w-16 text-center rounded-none focus:border-black ${
                                  isExcluded && scoreValue > 0
                                    ? 'border-red-400 bg-red-50 text-red-600 line-through'
                                    : 'border-black/30'
                                }`}
                                placeholder="0"
                              />
                              {isExcluded && scoreValue > 0 && (
                                <span
                                  className={`absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                    isExcludedMin ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                                  }`}
                                  title={isExcludedMin ? '最低分（已去除）' : '最高分（已去除）'}
                                >
                                  {isExcludedMin ? '低' : '高'}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center bg-primary/5">
                        <span className="font-mono font-bold text-lg">
                          {athleteScore.total_score.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 同分警告 */}
      {tiedAthletes.size > 0 && (
        <Card className="border-2 border-yellow-500 bg-yellow-50 rounded-none animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">⚠️ 检测到同分情况</h3>
                <p className="text-sm text-yellow-700">
                  当前组别有 <span className="font-bold">{tiedAthletes.size}</span> 名选手存在同分，
                  需要裁判长进行人工判定决定最终名次。同分选手已用黄色高亮标记。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-black/20 rounded-none">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> 图例说明
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>冠军（最低总分）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">
                  同分
                </span>
                <span>同分选手（需人工判定）</span>
              </div>
              <div className="border-t border-dashed pt-2 mt-2">
                <p className="text-xs font-bold text-muted-foreground mb-2">去极值标记：</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center">
                    低
                  </span>
                  <span>最低分（已去除）</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                    高
                  </span>
                  <span>最高分（已去除）</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-black/20 rounded-none">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Medal className="h-4 w-4" /> 当前组别统计
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">参赛选手</p>
                <p className="text-2xl font-black">{currentAthletes.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">已评分</p>
                <p className="text-2xl font-black">
                  {Object.keys(scores).filter(
                    (id) =>
                      scores[id]?.judge_scores?.some((s) => s > 0) &&
                      currentAthletes.some((a) => a.athlete_id._id === id)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-black/20 rounded-none">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-2">快捷操作</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-none border-black/30"
                onClick={() => {
                  // 清空当前组别的分数
                  const newScores = { ...scores };
                  currentAthletes.forEach((item) => {
                    delete newScores[item.athlete_id._id];
                  });
                  setScores(newScores);
                }}
              >
                清空当前组别
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

