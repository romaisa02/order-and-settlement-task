import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError, type Order, type OrderStatus, type Payment } from '../api/client';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

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

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Order not found');
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([api.getOrderById(id), api.getOrderPayments(id)])
      .then(([orderData, paymentData]) => {
        if (!cancelled) {
          setOrder(orderData);
          setPayments(paymentData);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load order');
          setOrder(null);
          setPayments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Back to orders
          </Link>
          {order ? (
            <>
              <h1>{order.customer}</h1>
              <p className="lede">Order details, line items, and payment history.</p>
            </>
          ) : (
            <>
              <h1>Order</h1>
              <p className="lede">Order details, line items, and payment history.</p>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <p className="page-status muted" role="status">
          Loading order…
        </p>
      ) : null}

      {!loading && error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && order ? (
        <>
          <section className="detail-summary" aria-label="Order summary">
            <div className="detail-summary-row">
              <span className="detail-label">Status</span>
              <span className={`status-badge status-${order.status}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="detail-summary-row">
              <span className="detail-label">Due date</span>
              <span>{formatDate(order.dueDate)}</span>
            </div>
            <div className="detail-summary-row">
              <span className="detail-label">Order total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
            <div className="detail-summary-row">
              <span className="detail-label">Amount paid</span>
              <span>{formatMoney(order.totalPaid)}</span>
            </div>
            <div className="detail-summary-row">
              <span className="detail-label">Amount due</span>
              <span>{formatMoney(order.remainingBalance)}</span>
            </div>
          </section>

          <section className="detail-section">
            <h2>Line items</h2>
            {order.lineItems.length === 0 ? (
              <p className="page-status muted" role="status">
                No line items.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit price</th>
                      <th>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems.map((item, index) => (
                      <tr key={`${item.description}-${index}`}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.unitPrice)}</td>
                        <td>{formatMoney(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="detail-section">
            <h2>Payment history</h2>
            {payments.length === 0 ? (
              <p className="page-status muted" role="status">
                No payments yet.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{formatDate(payment.date)}</td>
                        <td>{formatMoney(payment.amount)}</td>
                        <td>{payment.note?.trim() ? payment.note : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
