'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  GripVertical,
  Save,
  Users,
  Trash2,
  RefreshCw,
  ListOrdered,
  AlertTriangle,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  _id?: string;
}

// 可拖拽的秩序表项组件
function SortableLineupItem({
  item,
  index,
  selectedCategory,
}: {
  item: LineupItem;
  index: number;
  selectedCategory: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id || `${item.athlete_id._id}-${item.category}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCurrentCategory = item.category === selectedCategory || selectedCategory === 'all';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border-2 rounded-none transition-all ${
        isDragging
          ? 'border-primary shadow-lg z-50'
          : 'border-black/20 hover:border-black/40'
      } ${!isCurrentCategory ? 'opacity-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="w-10 h-10 bg-black text-white font-mono font-bold text-lg flex items-center justify-center">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-lg">
            {item.athlete_id.bib_number}
          </span>
          <span className="font-medium truncate">{item.athlete_id.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              item.athlete_id.gender === 'male'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-pink-100 text-pink-700'
            }`}
          >
            {item.athlete_id.gender === 'male' ? '男' : '女'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{item.category}</p>
      </div>
    </div>
  );
}

export default function LineupPage() {
  const { id: eventId } = useParams();
  const { token } = useAuthStore();

  const [event, setEvent] = useState<any>(null);
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const fetchLineup = useCallback(async () => {
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
      }
    } catch (error) {
      toast.error('获取秩序表失败');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLineup();
  }, [fetchLineup]);

  // 过滤当前组别的选手
  const filteredLineup =
    selectedCategory === 'all'
      ? lineup
      : lineup.filter((item) => item.category === selectedCategory);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLineup((items) => {
        const oldIndex = items.findIndex(
          (item) =>
            (item._id || `${item.athlete_id._id}-${item.category}`) === active.id
        );
        const newIndex = items.findIndex(
          (item) =>
            (item._id || `${item.athlete_id._id}-${item.category}`) === over.id
        );

        const newItems = arrayMove(items, oldIndex, newIndex);
        // 更新order值
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
      setHasChanges(true);
    }
  };

  // 保存秩序表
  const saveLineup = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/lineups/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lineup: lineup.map((item, index) => ({
            order: index + 1,
            athlete_id: item.athlete_id._id,
            category: item.category,
            is_display: item.is_display,
            is_retired: item.is_retired || false,
          })),
        }),
      });

      if (res.ok) {
        toast.success('秩序表已保存');
        setHasChanges(false);
      } else {
        const data = await res.json();
        toast.error(data.message || '保存失败');
      }
    } catch (error) {
      toast.error('保存秩序表时出错');
    } finally {
      setSaving(false);
    }
  };

  // 删除秩序表
  const deleteLineup = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }

    if (!confirm('确定要删除秩序表吗？此操作不可撤销。')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lineups/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('秩序表已删除');
        setLineup([]);
        setCategories([]);
      } else {
        const data = await res.json();
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除秩序表时出错');
    }
  };

  // 导出当前组别秩序表为Excel
  const exportCurrentCategoryToExcel = () => {
    const dataToExport = selectedCategory === 'all' ? lineup : filteredLineup;
    
    if (dataToExport.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const data = dataToExport.map((item, index) => ({
      '序号': index + 1,
      '号码牌': item.athlete_id.bib_number,
      '选手姓名': item.athlete_id.name,
      '性别': item.athlete_id.gender === 'male' ? '男' : '女',
      '组别': item.category,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    const sheetName = selectedCategory === 'all' ? '全部组别' : selectedCategory.replace(/[\\/?*[\]]/g, '_').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },  // 序号
      { wch: 10 }, // 号码牌
      { wch: 15 }, // 选手姓名
      { wch: 6 },  // 性别
      { wch: 25 }, // 组别
    ];

    const categoryName = selectedCategory === 'all' ? '全部组别' : selectedCategory;
    const fileName = `${event?.name || '秩序表'}_${categoryName}_${new Date().toLocaleDateString('zh-CN')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success(`已导出: ${fileName}`);
  };

  // 导出全部组别秩序表为Excel（每个组别一个工作表）
  const exportAllCategoriesToExcel = () => {
    if (lineup.length === 0) {
      toast.error('没有可导出的数据');
      return;
    }

    const wb = XLSX.utils.book_new();

    // 首先添加汇总表
    const summaryData = lineup.map((item, index) => ({
      '总序号': index + 1,
      '号码牌': item.athlete_id.bib_number,
      '选手姓名': item.athlete_id.name,
      '性别': item.athlete_id.gender === 'male' ? '男' : '女',
      '组别': item.category,
    }));
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 6 }, { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');

    // 然后按组别分别导出
    categories.forEach((category) => {
      const categoryLineup = lineup.filter((item) => item.category === category);
      
      const data = categoryLineup.map((item, index) => ({
        '序号': index + 1,
        '号码牌': item.athlete_id.bib_number,
        '选手姓名': item.athlete_id.name,
        '性别': item.athlete_id.gender === 'male' ? '男' : '女',
      }));

      if (data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = [
          { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 6 },
        ];
        const sheetName = category.replace(/[\\/?*[\]]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    const fileName = `${event?.name || '秩序表'}_分组明细_${new Date().toLocaleDateString('zh-CN')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success(`已导出: ${fileName}`);
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

  if (lineup.length === 0) {
    return (
      <div className="space-y-6">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回赛事详情
          </Button>
        </Link>
        <Card className="border-2 border-muted rounded-none">
          <CardContent className="py-12 text-center">
            <ListOrdered className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">秩序表未生成</h2>
            <p className="text-muted-foreground mb-4">
              请先返回赛事详情页生成秩序表，然后再进行编辑。
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
            <p className="text-sm text-muted-foreground font-mono">秩序表编辑</p>
            <h1 className="text-2xl font-black tracking-tight">
              {event?.name || '加载中...'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchLineup}
            className="rounded-none border-black gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button
            variant="outline"
            onClick={deleteLineup}
            className="rounded-none border-red-500 text-red-600 hover:bg-red-50 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
          <Button
            onClick={saveLineup}
            disabled={saving || !hasChanges}
            className={`rounded-none gap-2 ${
              hasChanges
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : hasChanges ? '保存更改' : '已保存'}
          </Button>

          {/* 导出按钮 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-none border-black gap-2"
              >
                <Download className="h-4 w-4" />
                导出
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm rounded-none border-2 border-black">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black">
                  <FileSpreadsheet className="h-5 w-5" />
                  导出秩序表
                </DialogTitle>
                <DialogDescription>
                  选择导出范围，将秩序表导出为 Excel 文件
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <Button
                  onClick={exportCurrentCategoryToExcel}
                  variant="outline"
                  className="w-full rounded-none border-black justify-start gap-3 h-auto py-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">
                      导出{selectedCategory === 'all' ? '全部' : '当前组别'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCategory === 'all'
                        ? `导出全部 ${lineup.length} 条记录`
                        : `仅导出 "${selectedCategory}" (${filteredLineup.length} 条)`}
                    </p>
                  </div>
                </Button>

                <Button
                  onClick={exportAllCategoriesToExcel}
                  variant="outline"
                  className="w-full rounded-none border-black justify-start gap-3 h-auto py-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">分组明细导出</p>
                    <p className="text-xs text-muted-foreground">
                      汇总 + {categories.length} 个组别工作表
                    </p>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 未保存提示 */}
      {hasChanges && (
        <Card className="border-2 border-yellow-500 bg-yellow-50 rounded-none">
          <CardContent className="py-3 px-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              您有未保存的更改，请记得点击"保存更改"按钮。
            </span>
          </CardContent>
        </Card>
      )}

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={`rounded-none ${
            selectedCategory === 'all'
              ? 'bg-black text-white'
              : 'border-black hover:bg-black hover:text-white'
          }`}
        >
          全部组别 ({lineup.length})
        </Button>
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
            {cat} ({lineup.filter((item) => item.category === cat).length})
          </Button>
        ))}
      </div>

      {/* Lineup Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sortable List */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b border-black bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5" />
                秩序表
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (拖拽调整顺序)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredLineup.map(
                    (item) =>
                      item._id || `${item.athlete_id._id}-${item.category}`
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {filteredLineup.map((item, index) => (
                      <SortableLineupItem
                        key={
                          item._id || `${item.athlete_id._id}-${item.category}`
                        }
                        item={item}
                        index={index}
                        selectedCategory={selectedCategory}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card className="border border-black/20 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                统计信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">总人次</span>
                <span className="text-3xl font-black">{lineup.length}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">组别数</span>
                <span className="text-3xl font-black">{categories.length}</span>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">各组别人数：</p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex justify-between text-sm"
                    >
                      <span className="truncate">{cat}</span>
                      <span className="font-mono font-bold">
                        {lineup.filter((item) => item.category === cat).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/20 rounded-none">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-2">操作说明</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 拖拽左侧图标调整顺序</li>
                <li>• 修改后需点击"保存更改"</li>
                <li>• 选择组别可筛选显示</li>
                <li>• 删除后需重新生成</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

