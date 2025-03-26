'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Post = {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string;
};

interface PostTableProps {
  posts: Post[];
  isLoading: boolean;
  error?: string;
}

export function PostTable({ posts, isLoading, error }: PostTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updated_at', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Функция для получения статуса поста в читаемом виде
  const getStatusText = (post: Post) => {
    switch (post.status) {
      case 'published':
        return 'Опубликован';
      case 'scheduled':
        return `Запланирован на ${format(new Date(post.scheduled_at || ''), 'dd MMMM yyyy HH:mm', { locale: ru })}`;
      case 'draft':
      default:
        return 'Черновик';
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  // Определение колонок таблицы
  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Название',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('title')}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Статус',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                post.status
              )}`}
            >
              {getStatusText(post)}
            </span>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Создан',
        cell: ({ row }) => formatDate(row.getValue('created_at')),
      },
      {
        accessorKey: 'updated_at',
        header: 'Обновлен',
        cell: ({ row }) => formatDate(row.getValue('updated_at')),
      },
      {
        id: 'actions',
        header: 'Действия',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex space-x-4">
              <Link
                href={`/dashboard/posts/${post.id}`}
                className="text-blue-600 hover:text-blue-900"
              >
                Редактировать
              </Link>
              <Link
                href={`/posts/${post.id}`}
                className="text-gray-600 hover:text-gray-900"
                target="_blank"
              >
                Просмотр
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: posts,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка при загрузке постов: {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">У вас пока нет постов</p>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Создать первый пост
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Поиск постов..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={table.getColumn('status')?.getFilterValue() as string}
            onValueChange={(value) => {
              table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
              <SelectItem value="published">Опубликованные</SelectItem>
              <SelectItem value="scheduled">Запланированные</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Создать пост
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-gray-50"
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-6 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Показано {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          из {table.getFilteredRowModel().rows.length}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Записей на странице</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  isActive={!table.getCanPreviousPage()}
                />
              </PaginationItem>
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={table.getState().pagination.pageIndex === i}
                    onClick={() => table.setPageIndex(i)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              )).slice(
                Math.max(0, table.getState().pagination.pageIndex - 1),
                Math.min(
                  table.getPageCount(),
                  table.getState().pagination.pageIndex + 3
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  isActive={!table.getCanNextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}