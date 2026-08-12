/// <reference types="jest" />
import { getOrderPaymentSummary } from "./order.status";

describe("Order payment status", () => {
  const futureDate = new Date("2099-01-01");
  const pastDate = new Date("2020-01-01");

  it("returns pending when there are no payments", () => {
    const result = getOrderPaymentSummary(
      1000,
      0,
      futureDate
    );

    expect(result.status).toBe("pending");
  });

  it("returns partially_paid when partially paid", () => {
    const result = getOrderPaymentSummary(
      1000,
      300,
      futureDate
    );

    expect(result.status).toBe("partially_paid");
    expect(result.totalPaid).toBe(300);
    expect(result.remainingBalance).toBe(700);
  });

  it("returns paid when fully paid", () => {
    const result = getOrderPaymentSummary(
      1000,
      1000,
      futureDate
    );

    expect(result.status).toBe("paid");
    expect(result.remainingBalance).toBe(0);
  });

  it("returns overdue when due date has passed", () => {
    const result = getOrderPaymentSummary(
      1000,
      300,
      pastDate
    );

    expect(result.status).toBe("overdue");
  });

  it("returns paid when an overdue order is fully paid", () => {
    const result = getOrderPaymentSummary(
      1000,
      1000,
      pastDate
    );

    expect(result.status).toBe("paid");
  });
});