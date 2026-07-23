import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Star, Users, BookOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import AppCard, { AppCardContent } from '@/components/common/micro/AppCard';
import AppSelect from '@/components/common/micro/AppSelect';
import DataTable from '@/components/common/composite/DataTable';
import { AppButton } from '@/components/common/micro/AppButton';
import AppInput from '@/components/common/micro/AppInput';
import adminCourseService from '@/services/admin/adminCourseService';
import categoryService from '@/services/course/categoryService';

const STATUS_META = {
  1: { label: 'Đã xuất bản', className: 'text-success bg-success/10 border-success/20', dot: 'bg-success' },
  3: { label: 'Bị từ chối', className: 'text-error bg-error/10 border-error/20', dot: 'bg-error' },
  4: { label: 'Chờ duyệt', className: 'text-warning bg-warning/10 border-warning/20', dot: 'bg-warning' }
};

const formatPrice = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function AdminCourses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses', status, search, categoryId, page, pageSize],
    queryFn: () => adminCourseService.getModerationCourses({
      status: status === 'all' ? null : Number(status),
      search,
      categoryId: categoryId === 'all' ? null : Number(categoryId),
      page,
      size: pageSize
    })
  });
  const statsQuery = useQuery({
    queryKey: ['admin', 'courses', 'stats'],
    queryFn: adminCourseService.getModerationStats
  });
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'course-categories'],
    queryFn: () => categoryService.getAllCategories(1, 1000, '', 'all'),
    staleTime: 5 * 60_000
  });
  const approveMutation = useMutation({
    mutationFn: adminCourseService.approveCourse,
    onSuccess: () => {
      toast.success('Đã duyệt và xuất bản khóa học.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Không thể duyệt khóa học.');
    }
  });

  const approveCourse = (course) => {
    if (window.confirm(`Duyệt và xuất bản khóa học “${course.title}”?`)) {
      approveMutation.mutate(course.slug);
    }
  };

  const response = coursesQuery.data || {};
  const courses = response.content || [];
  const pageInfo = response.page || response;
  const stats = statsQuery.data || {};
  const categoryData = categoriesQuery.data?.data?.content || categoriesQuery.data?.content || [];
  const categoryOptions = [
    { label: 'Tất cả danh mục', value: 'all' },
    ...categoryData.map((category) => ({ label: category.name, value: String(category.id) }))
  ];

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const tabs = [
    { value: 'all', label: 'Tất cả', count: stats.total || 0 },
    { value: '1', label: 'Đã xuất bản', count: stats.approved || 0 },
    { value: '4', label: 'Chờ duyệt', count: stats.pending || 0 },
    { value: '3', label: 'Bị từ chối', count: stats.rejected || 0 }
  ];

  const columns = [
    {
      header: 'Thông tin khóa học',
      width: '400px',
      render: (course) => (
        <div className="flex gap-4 items-center">
          <div className="w-20 h-14 overflow-hidden shrink-0 border border-border rounded-lg bg-muted">
            {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate" title={course.title}>{course.title}</span>
            <span className="text-xs text-muted-foreground mt-1">Gv: {course.instructorName || 'Chưa xác định'}</span>
          </div>
        </div>
      )
    },
    { header: 'Giá bán', render: (course) => <span className="font-bold">{formatPrice(course.salePrice ?? course.price)}</span> },
    {
      header: 'Trạng thái',
      render: (course) => {
        const meta = STATUS_META[course.status] || { label: `Trạng thái ${course.status}`, className: 'text-muted-foreground bg-secondary border-border', dot: 'bg-muted-foreground' };
        return <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.className}`}><span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
      }
    },
    {
      header: 'Học viên',
      className: 'text-center',
      render: (course) => <span className="inline-flex items-center gap-1 font-bold"><Users className="w-3.5 h-3.5 text-muted-foreground" />{Number(course.students || 0).toLocaleString('vi-VN')}</span>
    },
    {
      header: 'Đánh giá',
      className: 'text-center',
      render: () => <span className="inline-flex items-center gap-1 text-muted-foreground"><Star className="w-3.5 h-3.5" />--</span>
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      render: (course) => (
        <div className="flex justify-end items-center gap-2">
          {course.status === 4 && (
            <AppButton
              appVariant="primary"
              size="sm"
              className="h-8 gap-1.5 bg-success hover:bg-success/90"
              disabled={approveMutation.isPending}
              onClick={() => approveCourse(course)}
            >
              <Check className="w-3.5 h-3.5" />
              Duyệt
            </AppButton>
          )}
          <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 border border-border bg-white" onClick={() => navigate(`/admin/course-moderation/${course.slug}`)}>Chi tiết</AppButton>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" />Quản Lý Khóa Học</h1>
        <p className="text-sm text-muted-foreground mt-1">Theo dõi và quản lý toàn bộ khóa học trên hệ thống.</p>
      </div>

      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardContent className="p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="flex w-full xl:w-auto items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <AppInput value={search} onChange={(event) => changeFilter(setSearch)(event.target.value)} placeholder="Tìm khóa học theo tên..." className="pl-9 h-10" />
            </div>
            <div className="w-full md:w-[200px]"><AppSelect value={categoryId} onValueChange={changeFilter(setCategoryId)} options={categoryOptions} /></div>
          </div>
          <div className="flex flex-wrap text-sm font-medium text-muted-foreground bg-secondary p-1 rounded-lg">
            {tabs.map((tab) => <AppButton key={tab.value} appVariant="ghostMuted" variant="ghost" size="sm" onClick={() => changeFilter(setStatus)(tab.value)} className={`h-8 ${status === tab.value ? 'bg-card text-foreground shadow-sm' : ''}`}>{tab.label} ({tab.count})</AppButton>)}
          </div>
        </AppCardContent>
      </AppCard>

      <DataTable
        columns={columns}
        data={courses}
        isLoading={coursesQuery.isLoading}
        emptyState={coursesQuery.isError ? 'Không thể tải danh sách khóa học.' : 'Không có khóa học phù hợp.'}
        pagination={{
          currentPage: Number(pageInfo.number ?? page),
          totalPages: Number(pageInfo.totalPages ?? 0),
          totalElements: Number(pageInfo.totalElements ?? 0),
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => { setPageSize(size); setPage(0); },
          zeroIndexed: true
        }}
      />
    </div>
  );
}
