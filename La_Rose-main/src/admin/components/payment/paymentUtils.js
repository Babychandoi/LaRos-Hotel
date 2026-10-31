/** Lấy họ tên / email khách của giao dịch (dữ liệu có thể nằm ở userDTO hoặc bookingDTO). */
export const getTransactionCustomer = (transaction) => ({
    name:
        transaction.userDTO?.fullName ||
        transaction.bookingDTO?.userFullName ||
        transaction.bookingDTO?.userDTO?.fullName ||
        "",
    email:
        transaction.userDTO?.email ||
        transaction.bookingDTO?.userEmail ||
        transaction.bookingDTO?.userDTO?.email ||
        "",
});
