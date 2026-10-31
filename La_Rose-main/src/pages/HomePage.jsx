import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ReviewCard from "../components/ReviewCard";
import RoomCard from "../components/RoomCard";
import SectionHeading from "../components/common/SectionHeading";
import StateMessage from "../components/common/StateMessage";
import RoomCardSkeleton from "../components/rooms/RoomCardSkeleton";
import useBookRoom from "../components/rooms/useBookRoom";
import reviewService from "../services/review.service";
import roomService from "../services/room.service";
import heroImage from "../assets/pexels-pixabay-53464.jpg";

const FEATURED_ROOMS = 3;
const MAX_REVIEWS = 6;

/** Chuyển ReviewDTO của backend sang dữ liệu mà <ReviewCard> hiển thị. */
const toReviewCard = (dto) => ({
    id: dto.id,
    name: dto.userFullName || "Khách ẩn danh",
    comment: dto.content,
    rating: dto.rating,
    title: dto.title,
    images: dto.images || [],
    videos: dto.videos || [],
    createdAt: dto.createdAt,
    roomTitle: dto.roomTitle,
    reply: dto.responses?.at(-1)?.content,
});

const Hero = () => (
    <section className="relative isolate flex h-[calc(100svh-4rem)] max-h-[880px] min-h-[540px] items-center justify-center overflow-hidden sm:h-[calc(100svh-5rem)]">
        <img src={heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/60 via-slate-950/35 to-slate-950/70" />
        <div className="mx-auto max-w-4xl animate-fade-in px-4 text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 sm:text-sm">
                Khách sạn & Nghỉ dưỡng
            </p>
            <h1 className="mt-5 text-balance font-playfair text-4xl font-bold leading-tight drop-shadow-sm sm:text-6xl lg:text-7xl">
                Chào mừng đến La Rosé
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                Trải nghiệm nghỉ dưỡng sang trọng với phong cách nữ tính tinh tế
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                    to="/rooms"
                    className="w-full rounded-full bg-rose-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-500 sm:w-auto"
                >
                    Đặt phòng ngay
                </Link>
                <Link
                    to="/about"
                    className="w-full rounded-full border border-white/70 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
                >
                    Về La Rosé
                </Link>
            </div>
        </div>
    </section>
);

const HomePage = () => {
    const bookRoom = useBookRoom();

    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [roomsError, setRoomsError] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);

    useEffect(() => {
        roomService
            .getAllRooms({ page: 0, size: FEATURED_ROOMS })
            .then((response) => setRooms(response.content || []))
            .catch(() => setRoomsError("Không thể tải phòng nổi bật."))
            .finally(() => setRoomsLoading(false));

        reviewService
            .getAllReviews()
            .then((list) => setReviews((list || []).slice(0, MAX_REVIEWS).map(toReviewCard)))
            .catch(() => setReviewsError("Không thể tải danh sách đánh giá."))
            .finally(() => setReviewsLoading(false));
    }, []);

    const renderRooms = () => {
        if (roomsLoading) {
            return Array.from({ length: FEATURED_ROOMS }, (_, i) => <RoomCardSkeleton key={i} />);
        }
        return rooms.map((room) => <RoomCard key={room.id} room={room} onBookNow={bookRoom} />);
    };

    const renderReviews = () => {
        if (reviewsLoading) return <p className="text-center text-slate-500">Đang tải đánh giá...</p>;
        if (reviewsError) return <StateMessage tone="error">{reviewsError}</StateMessage>;
        if (reviews.length === 0) return <StateMessage>Chưa có đánh giá nào được hiển thị.</StateMessage>;
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        );
    };

    return (
        <>
            <Hero />

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading
                        align="left"
                        eyebrow="Lưu trú"
                        title="Phòng nổi bật"
                        description="Những hạng phòng được khách lựa chọn nhiều nhất tại La Rosé."
                    />
                    <Link
                        to="/rooms"
                        className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-rose-600 transition hover:gap-3 hover:text-rose-700"
                    >
                        Xem tất cả phòng <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-10">
                    {roomsError && rooms.length === 0 ? (
                        <StateMessage tone="error">{roomsError}</StateMessage>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">{renderRooms()}</div>
                    )}
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <SectionHeading
                        eyebrow="Cảm nhận"
                        title="Đánh giá của khách hàng"
                        description="Những chia sẻ chân thật từ khách đã lưu trú tại La Rosé."
                    />
                    <div className="mt-12">{renderReviews()}</div>
                </div>
            </section>
        </>
    );
};

export default HomePage;
