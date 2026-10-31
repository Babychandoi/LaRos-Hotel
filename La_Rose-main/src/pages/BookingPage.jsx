import { Link } from "react-router-dom";
import { AlertCircle, BedDouble, UserRound } from "lucide-react";
import { ui } from "../utils/ui";
import useBookingFlow from "./booking/useBookingFlow";
import BookingStepper from "./booking/BookingStepper";
import StepRoomDates from "./booking/StepRoomDates";
import StepGuestInfo from "./booking/StepGuestInfo";
import StepPayment from "./booking/StepPayment";
import OrderSummary from "./booking/OrderSummary";
import BookingConfirmation from "./booking/BookingConfirmation";

const ErrorAlert = ({ message }) => (
    <div role="alert" className="mb-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
    </div>
);

const NoRoomSelected = ({ errorMessage }) => (
    <div className={`${ui.card} mx-auto max-w-xl p-8 text-center`}>
        {errorMessage && <ErrorAlert message={errorMessage} />}
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <BedDouble className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Bạn chưa chọn phòng</h2>
        <p className="mt-2 text-sm text-slate-600">
            Hãy chọn một phòng ở trang Phòng, sau đó nhấn “Đặt ngay” để tiếp tục đặt phòng.
        </p>
        <Link to="/rooms" className={`${ui.btnPrimary} mt-6`}>
            Xem danh sách phòng
        </Link>
    </div>
);

const BookingPage = () => {
    const flow = useBookingFlow();
    const { currentUser, room, step, dates, form, pricing, errorMessage } = flow;

    if (flow.isProcessingVNPay) {
        return (
            <div className={`${ui.page} flex min-h-[60vh] flex-col items-center justify-center text-center`}>
                <span className={`${ui.spinner} h-10 w-10 text-rose-600`} />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Đang xử lý kết quả thanh toán...</h2>
                <p className="mt-1 text-sm text-slate-600">Vui lòng chờ trong giây lát.</p>
            </div>
        );
    }

    if (flow.confirmedBooking) {
        return (
            <div className={ui.page}>
                <BookingConfirmation bookingInfo={flow.confirmedBooking} />
            </div>
        );
    }

    return (
        <div className={ui.page}>
            <div className="mx-auto max-w-6xl">
                <header className="text-center">
                    <h1 className={ui.pageTitle}>Đặt phòng</h1>
                    <p className={ui.pageSubtitle}>Trải nghiệm dịch vụ đẳng cấp tại La Rosé</p>
                    {currentUser && (
                        <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-1.5 text-sm text-slate-600">
                            <UserRound className="h-4 w-4 shrink-0 text-rose-500" />
                            <span className="truncate">
                                Đặt phòng với tài khoản <strong className="text-slate-900">{currentUser.fullName}</strong>
                            </span>
                        </p>
                    )}
                </header>

                {!room ? (
                    <div className="mt-10">
                        <NoRoomSelected errorMessage={errorMessage} />
                    </div>
                ) : (
                    <>
                        <div className="mx-auto mt-8 max-w-3xl">
                            <BookingStepper step={step} />
                        </div>

                        <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:items-start">
                            <section className={`${ui.card} p-5 sm:p-8 lg:col-span-2`}>
                                {errorMessage && <ErrorAlert message={errorMessage} />}
                                {step === 1 && (
                                    <StepRoomDates
                                        room={room}
                                        dates={dates}
                                        guests={form.guests}
                                        bookedDates={flow.bookedDates}
                                        bookedRanges={flow.bookedRanges}
                                        loadingBookedDates={flow.loadingBookedDates}
                                        minCheckOutDate={flow.minCheckOutDate}
                                        onCheckInChange={flow.handleCheckInChange}
                                        onCheckOutChange={flow.handleCheckOutChange}
                                        onChange={flow.handleChange}
                                        onNext={flow.nextStep}
                                    />
                                )}
                                {step === 2 && (
                                    <StepGuestInfo
                                        form={form}
                                        lockedFields={flow.lockedFields}
                                        hasAccount={Boolean(currentUser)}
                                        onChange={flow.handleChange}
                                        onBack={flow.prevStep}
                                        onNext={flow.nextStep}
                                    />
                                )}
                                {step === 3 && (
                                    <StepPayment
                                        form={form}
                                        pricing={pricing}
                                        isSubmitting={flow.isSubmitting}
                                        canSubmit={Boolean(currentUser)}
                                        onChange={flow.handleChange}
                                        onBack={flow.prevStep}
                                        onSubmit={flow.handleSubmit}
                                    />
                                )}
                            </section>

                            <OrderSummary
                                room={room}
                                dates={dates}
                                form={form}
                                pricing={pricing}
                                showPayment={step === 3}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
