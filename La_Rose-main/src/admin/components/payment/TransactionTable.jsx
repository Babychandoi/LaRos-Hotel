import { Banknote, CreditCard, Eye, Wallet } from "lucide-react";
import { IconButton, StatusSelect } from "../common";
import { formatCurrency, formatDateTime } from "../common/format";
import { PAYMENT_PROVIDER, TRANSACTION_STATUS, getStatus, toOptions } from "../common/status";
import { stickyCellClass, stickyHeadClass } from "../common/ui";
import { getTransactionCustomer } from "./paymentUtils";

const STATUS_OPTIONS = toOptions(TRANSACTION_STATUS);
const PROVIDER_ICONS = { VNPAY: CreditCard, CASH: Banknote };

/** Bảng giao dịch: mã đơn/mã giao dịch, khách, phương thức, số tiền, trạng thái. */
const TransactionTable = ({ transactions, onView, onChangeStatus }) => (
    <div className="adm-table-wrap">
        <table className="adm-table min-w-[900px]">
            <thead>
                <tr>
                    <th>Đơn / giao dịch</th>
                    <th>Khách hàng</th>
                    <th>Phương thức</th>
                    <th className="text-right">Số tiền</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th className={`text-right ${stickyHeadClass}`}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((transaction) => {
                    const status = getStatus(TRANSACTION_STATUS, transaction.status);
                    const customer = getTransactionCustomer(transaction);
                    const ProviderIcon = PROVIDER_ICONS[transaction.provider] || Wallet;
                    return (
                        <tr key={transaction.id} className="group">
                            <td>
                                <button
                                    type="button"
                                    onClick={() => onView(transaction)}
                                    className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900 hover:text-rose-600"
                                >
                                    {transaction.bookingDTO?.bookingCode || `#${transaction.id}`}
                                </button>
                                <p
                                    className="max-w-[11rem] truncate font-mono text-xs text-slate-500"
                                    title={transaction.providerTransactionId}
                                >
                                    {transaction.providerTransactionId || "Không có mã giao dịch"}
                                </p>
                            </td>
                            <td>
                                <div className="max-w-[13rem] min-w-0">
                                    <p className="truncate font-medium text-slate-900">
                                        {customer.name || "—"}
                                    </p>
                                    {customer.email && (
                                        <p
                                            className="truncate text-xs text-slate-500"
                                            title={customer.email}
                                        >
                                            {customer.email}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap">
                                <span className="inline-flex items-center gap-2 text-slate-700">
                                    <ProviderIcon
                                        className="h-4 w-4 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    {PAYMENT_PROVIDER[transaction.provider] ||
                                        transaction.provider ||
                                        "—"}
                                </span>
                            </td>
                            <td className="whitespace-nowrap text-right font-medium tabular-nums text-slate-900">
                                {formatCurrency(transaction.amount)}
                            </td>
                            <td className="text-center">
                                <StatusSelect
                                    value={transaction.status?.toLowerCase()}
                                    currentLabel={status.label}
                                    tone={status.tone}
                                    options={STATUS_OPTIONS}
                                    label="Đổi trạng thái thanh toán"
                                    onChange={(next) => onChangeStatus(transaction, next)}
                                />
                            </td>
                            <td className="whitespace-nowrap tabular-nums text-slate-600">
                                {formatDateTime(transaction.createdAt)}
                            </td>
                            <td className={stickyCellClass}>
                                <div className="flex justify-end">
                                    <IconButton
                                        icon={Eye}
                                        label="Xem chi tiết"
                                        onClick={() => onView(transaction)}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default TransactionTable;
