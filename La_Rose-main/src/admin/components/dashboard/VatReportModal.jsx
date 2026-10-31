import { useEffect, useState } from "react";
import { Download, LoaderCircle, X } from "lucide-react";
import { formatCurrency } from "./dashboardFormat";
import { calcVat } from "./dashboardData";

/**
 * Xem trước báo cáo thuế GTGT của kỳ đang chọn; người dùng nhập khoản chi tiêu
 * rồi xuất file DOCX (qua `onSubmit(khoanChi)`).
 */
const VatReportModal = ({ summary, submitting, onClose, onSubmit }) => {
    const [expenseInput, setExpenseInput] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === "Escape" && !submitting) onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose, submitting]);

    const expense = parseFloat(expenseInput) || 0;
    const { roomRevenue, serviceRevenue } = summary;
    const vatExpense = calcVat(expense);
    const vatService = calcVat(serviceRevenue);
    const vatRoom = calcVat(roomRevenue);

    const rows = [
        { label: "Hàng hoá, dịch vụ mua vào", value: expense, vat: vatExpense, total: expense + vatExpense },
        { label: "Doanh thu dịch vụ", value: serviceRevenue, vat: vatService, total: serviceRevenue + vatService },
        { label: "Doanh thu phòng", value: roomRevenue, vat: vatRoom, total: null },
    ];

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!(expense > 0)) {
            setError("Vui lòng nhập khoản chi tiêu hợp lệ (lớn hơn 0).");
            return;
        }
        onSubmit(expense);
    };

    return (
        <div
            className="adm-modal-backdrop"
            onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}
        >
            <form
                className="adm-modal adm-modal-lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="vat-modal-title"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="adm-modal-header">
                    <div>
                        <h2 id="vat-modal-title" className="adm-modal-title">
                            Báo cáo thuế GTGT
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">Kỳ thuế: {summary.period}</p>
                    </div>
                    <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="adm-modal-body space-y-6">
                    <div>
                        <label htmlFor="vat-expense" className="adm-label">
                            Khoản chi tiêu trong kỳ (VNĐ) <span className="text-red-600">*</span>
                        </label>
                        <div className="relative max-w-sm">
                            <input
                                id="vat-expense"
                                type="number"
                                min="0"
                                step="1000"
                                inputMode="numeric"
                                autoFocus
                                placeholder="Ví dụ: 25000000"
                                value={expenseInput}
                                onChange={(event) => {
                                    setExpenseInput(event.target.value);
                                    setError("");
                                }}
                                aria-invalid={Boolean(error)}
                                aria-describedby="vat-expense-help"
                                className={`adm-input pr-10 tabular-nums ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                ₫
                            </span>
                        </div>
                        {error ? (
                            <p id="vat-expense-help" className="adm-field-error">
                                {error}
                            </p>
                        ) : (
                            <p id="vat-expense-help" className="mt-1 text-xs text-slate-500">
                                Tổng giá trị hàng hoá, dịch vụ mua vào trong kỳ.
                            </p>
                        )}
                    </div>

                    {/* Mobile: mỗi hạng mục một khối; từ sm: bảng 4 cột. */}
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 sm:hidden">
                        {rows.map((row) => (
                            <li key={row.label} className="px-4 py-3">
                                <p className="text-sm font-medium text-slate-900">{row.label}</p>
                                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                    {[
                                        ["Giá trị", row.value],
                                        ["Thuế GTGT", row.vat],
                                        ["Tổng cộng", row.total],
                                    ].map(([label, amount]) => (
                                        <div key={label} className="min-w-0">
                                            <dt className="text-slate-500">{label}</dt>
                                            <dd className="mt-0.5 truncate font-medium tabular-nums text-slate-900">
                                                {amount == null ? "—" : formatCurrency(amount)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </li>
                        ))}
                    </ul>

                    <div className="adm-table-wrap hidden rounded-lg border border-slate-200 sm:block">
                        <table className="adm-table min-w-[560px]">
                            <thead>
                                <tr>
                                    <th>Hạng mục</th>
                                    <th className="text-right">Giá trị</th>
                                    <th className="text-right">Thuế GTGT (10%)</th>
                                    <th className="text-right">Tổng cộng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.label}>
                                        <td className="font-medium text-slate-900">{row.label}</td>
                                        <td className="text-right tabular-nums">{formatCurrency(row.value)}</td>
                                        <td className="text-right tabular-nums">{formatCurrency(row.vat)}</td>
                                        <td className="text-right tabular-nums">
                                            {row.total == null ? (
                                                <span className="text-slate-400">—</span>
                                            ) : (
                                                formatCurrency(row.total)
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-500">Tổng doanh thu (phòng + dịch vụ)</p>
                            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                                {formatCurrency(roomRevenue + serviceRevenue)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                            <p className="text-xs text-rose-700">Tổng thuế GTGT phải nộp</p>
                            <p className="mt-1 text-lg font-semibold tabular-nums text-rose-700">
                                {formatCurrency(vatRoom + vatService - vatExpense)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="adm-modal-footer">
                    <button type="button" className="adm-btn-secondary" onClick={onClose} disabled={submitting}>
                        Đóng
                    </button>
                    <button type="submit" className="adm-btn-primary" disabled={submitting}>
                        {submitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {submitting ? "Đang xuất…" : "Xuất file DOCX"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VatReportModal;
