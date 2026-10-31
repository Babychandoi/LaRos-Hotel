import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import bookingService from "../../services/booking.service";
import session from "../../utils/SessionManager";
import { getErrorMessage, toLocalDateString } from "../../utils/format";
import {
    DEPOSIT_PERCENTAGE,
    addDays,
    expandBookedDates,
    extractPaymentUrl,
    isValidEmail,
    isValidPhone,
    parseVNPayReturn,
    saveBookingForDetail,
    savePendingBooking,
    startOfDay,
} from "./bookingHelpers";

// Phòng được chọn từ trang Phòng/Trang chủ (location.state.preFilledData).
const toRoom = (data) => ({
    id: data.roomId,
    type: data.roomType || "",
    number: data.roomNumber || "",
    title: data.roomTitle || data.roomType || "",
    price: data.price || 0,
    capacity: data.roomCapacity || 1,
    description: data.roomDescription || "",
    area: data.roomArea || "",
    image: data.roomImages?.[0]?.url || null,
});

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const useBookingFlow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentUser] = useState(() => session.getUser());

    const preFilled = location.state?.fromRoomPage ? location.state.preFilledData : null;
    const room = useMemo(() => (preFilled ? toRoom(preFilled) : null), [preFilled]);
    const roomId = room?.id;

    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ checkIn: null, checkOut: null });
    const [form, setForm] = useState(() => ({
        guests: 1,
        name: currentUser?.fullName || "",
        phone: currentUser?.phone || "",
        email: currentUser?.email || "",
        paymentMethod: "vnpay",
        paymentOption: "full",
    }));
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [isProcessingVNPay, setIsProcessingVNPay] = useState(() =>
        searchParams.has("vnp_ResponseCode"),
    );
    const [bookedRanges, setBookedRanges] = useState([]);
    const [loadingBookedDates, setLoadingBookedDates] = useState(false);

    // Trường đã có trong tài khoản thì khoá lại, trường còn trống cho khách tự nhập.
    const lockedFields = {
        name: Boolean(currentUser?.fullName),
        phone: Boolean(currentUser?.phone),
        email: Boolean(currentUser?.email),
    };

    useEffect(() => {
        if (!session.getToken() || !session.getUser()) navigate("/login", { replace: true });
    }, [navigate]);

    // VNPay chuyển hướng về trang này kèm các tham số vnp_* sau khi khách thanh toán.
    useEffect(() => {
        if (!isProcessingVNPay) return;
        const { info, error } = parseVNPayReturn(searchParams, currentUser);
        if (info) {
            saveBookingForDetail(info);
            setConfirmedBooking(info);
        } else {
            setErrorMessage(error);
        }
        setIsProcessingVNPay(false);
    }, [isProcessingVNPay, searchParams, currentUser]);

    useEffect(() => {
        if (!roomId) return;
        let ignore = false;
        setLoadingBookedDates(true);
        setErrorMessage("");
        bookingService
            .getBookedDates(roomId)
            .then((bookings) => !ignore && setBookedRanges(bookings || []))
            .catch(() => !ignore && setErrorMessage("Không thể tải lịch của phòng này."))
            .finally(() => !ignore && setLoadingBookedDates(false));
        return () => {
            ignore = true;
        };
    }, [roomId]);

    const bookedDates = useMemo(() => expandBookedDates(bookedRanges), [bookedRanges]);
    const minCheckOutDate = addDays(dates.checkIn || new Date(), 1);

    const checkIn = toLocalDateString(dates.checkIn);
    const checkOut = toLocalDateString(dates.checkOut);
    const nights =
        dates.checkIn && dates.checkOut
            ? Math.max(1, Math.ceil(Math.abs(dates.checkOut - dates.checkIn) / 86400000))
            : 0;
    const totalPrice = (room?.price || 0) * nights;
    const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENTAGE);
    const remainingAmount = totalPrice - depositAmount;
    const isFullPayment = form.paymentOption === "full";
    const amountToPay = isFullPayment ? totalPrice : depositAmount;
    const pricing = { nights, totalPrice, depositAmount, remainingAmount, amountToPay };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrorMessage("");
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckInChange = (date) => {
        setErrorMessage("");
        setDates((prev) => {
            if (date && prev.checkOut && date >= prev.checkOut) return { checkIn: date, checkOut: null };
            return { ...prev, checkIn: date };
        });
    };

    const handleCheckOutChange = (date) => {
        if (date && !dates.checkIn) {
            setErrorMessage("Vui lòng chọn ngày nhận phòng trước.");
            return;
        }
        setErrorMessage("");
        setDates((prev) => ({ ...prev, checkOut: date }));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!dates.checkIn || !dates.checkOut) return "Vui lòng chọn ngày nhận và trả phòng.";
            if (dates.checkIn >= dates.checkOut) return "Ngày trả phòng phải sau ngày nhận phòng.";
            if (startOfDay(dates.checkIn) < startOfDay(new Date())) {
                return "Ngày nhận phòng không thể là ngày trong quá khứ.";
            }
        }
        if (step === 2) {
            if (!form.name.trim()) return "Vui lòng nhập họ và tên.";
            if (!form.phone.trim()) return "Vui lòng nhập số điện thoại.";
            if (!isValidPhone(form.phone)) return "Số điện thoại không hợp lệ. Vui lòng nhập 9-15 chữ số.";
            if (!form.email.trim()) return "Vui lòng nhập địa chỉ email.";
            if (!isValidEmail(form.email)) return "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.";
        }
        return null;
    };

    const nextStep = () => {
        const error = validateStep();
        setErrorMessage(error || "");
        if (error) return;
        setStep((s) => s + 1);
        scrollToTop();
    };

    const prevStep = () => {
        setErrorMessage("");
        setStep((s) => s - 1);
        scrollToTop();
    };

    const createTransaction = async (provider, localBookingId) => {
        const now = new Date().toISOString();
        return bookingService.createTransaction({
            userId: currentUser.id,
            provider,
            providerTransactionId: `${provider}${Date.now()}`,
            amount: amountToPay,
            currency: "VND",
            type: "PAYMENT",
            metadata: JSON.stringify({
                note: `Payment at counter for booking ${localBookingId}`,
                customerName: form.name,
                customerPhone: form.phone,
                paymentOption: form.paymentOption,
                amountToPay,
                totalPrice,
                checkin: checkIn,
                checkout: checkOut,
                userId: currentUser.id,
            }),
            createdAt: now,
            updatedAt: now,
            bookingDTO: {
                userEmail: form.email,
                checkIn,
                checkOut,
                nights,
                guests: Number(form.guests) || 1,
                priceTotal: totalPrice,
                depositAmount: provider === "CASH" || !isFullPayment ? depositAmount : null,
                roomId,
                userId: currentUser.id,
            },
        });
    };

    const payWithVNPay = async (baseInfo) => {
        let transaction;
        try {
            transaction = await createTransaction("VNPAY", baseInfo.bookingId);
        } catch (error) {
            throw new Error(`Tạo đơn đặt phòng thất bại: ${getErrorMessage(error)}`);
        }
        savePendingBooking({ ...baseInfo, bookingId: transaction?.bookingDTO?.bookingCode });

        let paymentUrl;
        try {
            const response = await bookingService.submitVNPayOrder({
                amount: amountToPay,
                orderInfo: `Booking${roomId}${Date.now().toString().slice(-6)}`,
                roomId,
                returnUrl: `${window.location.origin}${window.location.pathname}`,
            });
            paymentUrl = extractPaymentUrl(response);
        } catch (error) {
            throw new Error(`Thanh toán VNPay thất bại: ${getErrorMessage(error)}`);
        }
        if (!paymentUrl) {
            throw new Error("Không nhận được URL thanh toán từ VNPay. Vui lòng thử lại.");
        }
        window.location.href = paymentUrl;
    };

    const payAtCounter = async (baseInfo) => {
        let transaction;
        try {
            transaction = await createTransaction("CASH", baseInfo.bookingId);
        } catch (error) {
            throw new Error(
                `Tạo đơn đặt phòng thanh toán tại quầy thất bại: ${getErrorMessage(error)}`,
            );
        }
        const info = {
            ...baseInfo,
            bookingId: transaction?.bookingDTO?.bookingCode || baseInfo.bookingId,
            amountPaid: 0,
            amountToPay,
            paymentMethod: "cash",
        };
        saveBookingForDetail(info);
        setConfirmedBooking(info);
        scrollToTop();
    };

    const handleSubmit = async () => {
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            if (!currentUser) throw new Error("Vui lòng đăng nhập để đặt phòng.");

            // Nếu API kiểm tra phòng trống lỗi thì vẫn cho đặt; chỉ chặn khi API trả về false.
            const isAvailable = await bookingService
                .checkRoomAvailability(roomId, checkIn, checkOut)
                .catch(() => true);
            if (!isAvailable) {
                throw new Error(
                    "Loại phòng này tạm thời không còn phòng trống. Vui lòng chọn loại phòng khác hoặc thử lại sau.",
                );
            }

            const baseInfo = {
                bookingId: `BK${Date.now().toString().slice(-8)}`,
                roomType: room.type,
                roomNumber: room.number,
                checkin: checkIn,
                checkout: checkOut,
                customer: form.name.trim(),
                customerEmail: form.email,
                remainingDue: isFullPayment ? 0 : remainingAmount,
                paymentOption: form.paymentOption,
                createdAt: new Date().toISOString(),
            };

            if (form.paymentMethod === "vnpay") await payWithVNPay(baseInfo);
            else await payAtCounter(baseInfo);
        } catch (error) {
            setErrorMessage(error.message || "Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        currentUser,
        room,
        step,
        dates,
        form,
        lockedFields,
        pricing,
        errorMessage,
        isSubmitting,
        confirmedBooking,
        isProcessingVNPay,
        bookedRanges,
        bookedDates,
        loadingBookedDates,
        minCheckOutDate,
        handleChange,
        handleCheckInChange,
        handleCheckOutChange,
        nextStep,
        prevStep,
        handleSubmit,
    };
};

export default useBookingFlow;
