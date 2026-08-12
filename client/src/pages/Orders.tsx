import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, type Order, type OrderStatus } from '../api/client';

type StatusFilter = 'all' | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: OrderStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function isWithinDateRange(createdAt: string, from: string, to: string): boolean {
  const created = new Date(createdAt);

  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (created < start) return false;
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999`);
    if (created > end) return false;
  }

  return true;
}

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function ordersToCsv(orders: Order[]): string {
  const headers = [
    'ID',
    'Customer',
    'Status',
    'Order Total',
    'Amount Paid',
    'Amount Due',
    'Due Date',
    'Created At',
  ];

  const rows = orders.map((order) => [
    order._id,
    order.customer,
    statusLabel(order.status),
    order.total.toFixed(2),
    order.totalPaid.toFixed(2),
    order.remainingBalance.toFixed(2),
    formatDate(order.dueDate),
    formatDateTime(order.createdAt),
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    api
      .getOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load orders');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (dateFrom || dateTo) {
        return isWithinDateRange(order.createdAt, dateFrom, dateTo);
      }
      return true;
    });
  }, [orders, filter, dateFrom, dateTo]);

  const hasActiveFilters = filter !== 'all' || dateFrom !== '' || dateTo !== '';

  function handleExportCsv() {
    if (filtered.length === 0) return;

    const parts = ['orders'];
    if (dateFrom) parts.push(`from-${dateFrom}`);
    if (dateTo) parts.push(`to-${dateTo}`);
    const filename = `${parts.join('-')}.csv`;

    downloadCsv(ordersToCsv(filtered), filename);
  }

  function emptyMessage(): string {
    if (orders.length === 0) return 'No orders yet.';
    if (hasActiveFilters) return 'No orders match the current filters.';
    return 'No orders to show.';
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Orders</h1>
          <p className="lede">Review your orders, payment progress, and due dates.</p>
        </div>

        <div className="page-toolbar">
          <label className="filter-control">
            Status
            <select value={filter} onChange={(e) => setFilter(e.target.value as StatusFilter)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            Created from
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>

          <label className="filter-control">
            Created to
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="ghost"
            disabled={loading || filtered.length === 0}
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="page-status muted" role="status">
          Loading orders…
        </p>
      ) : null}

      {!loading && error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="page-status muted" role="status">
          {emptyMessage()}
        </p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Order total</th>
                <th>Amount paid</th>
                <th>Amount due</th>
                <th>Due date</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order._id}
                  className="orders-row-link"
                  tabIndex={0}
                  role="link"
                  onClick={() => navigate(`/orders/${order._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/orders/${order._id}`);
                    }
                  }}
                >
                  <td>{order.customer}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>{formatMoney(order.total)}</td>
                  <td>{formatMoney(order.totalPaid)}</td>
                  <td>{formatMoney(order.remainingBalance)}</td>
                  <td>{formatDate(order.dueDate)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
