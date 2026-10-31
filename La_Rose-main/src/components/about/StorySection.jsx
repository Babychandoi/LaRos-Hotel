import { useState } from "react";
import { Award, Check, Clock, MessageCircle, Star, Wallet } from "lucide-react";
import storyImage from "../../assets/pexels-pixabay-258154.jpg";
import { CONTACT } from "../siteConfig";
import SectionHeading from "../common/SectionHeading";
import DynamicIcon from "../common/DynamicIcon";

const Bullet = ({ children }) => (
    <li className="flex items-start gap-3">
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />
        <span>{children}</span>
    </li>
);

const InfoBox = ({ icon, title, action, children }) => (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                <DynamicIcon icon={icon} className="h-5 w-5 text-rose-500" />
                {title}
            </h4>
            {action}
        </div>
        <ul className="space-y-1.5 text-sm text-slate-600">{children}</ul>
    </div>
);

const TABS = [
    {
        label: "Sứ mệnh",
        content: (
            <>
                <p>
                    <strong className="text-rose-600">Sứ mệnh</strong> của La Rosé là tạo ra những trải nghiệm nghỉ dưỡng
                    đẳng cấp, nơi văn hóa Pháp tinh tế hòa quyện với sự ấm áp Việt Nam, mang đến cho khách hàng những kỷ niệm
                    đáng nhớ suốt đời.
                </p>
                <ul className="space-y-2">
                    <Bullet>Dịch vụ cá nhân hóa xuất sắc</Bullet>
                    <Bullet>Không gian sang trọng, đẳng cấp</Bullet>
                    <Bullet>Cam kết chất lượng 5 sao</Bullet>
                </ul>
            </>
        ),
    },
    {
        label: "Tầm nhìn",
        content: (
            <>
                <p>
                    <strong className="text-rose-600">Tầm nhìn</strong> của chúng tôi là trở thành biểu tượng khách sạn sang
                    trọng hàng đầu Đông Nam Á, tiên phong trong xu hướng hospitality kết hợp văn hóa bản địa với chuẩn mực quốc
                    tế.
                </p>
                <InfoBox icon={Star} title="Mục tiêu 2025">
                    <li>• Mở rộng 3 chi nhánh mới</li>
                    <li>• Đón 50.000 khách/năm</li>
                    <li>• Đạt giải thưởng quốc tế</li>
                </InfoBox>
            </>
        ),
    },
    {
        label: "Giá trị",
        content: (
            <>
                <p>
                    <strong className="text-rose-600">Giá trị cốt lõi</strong> định hình văn hóa doanh nghiệp và cam kết với
                    khách hàng, đối tác và cộng đồng.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {["Chất lượng", "Sáng tạo", "Chân thành", "Bền vững"].map((value) => (
                        <div key={value} className="rounded-xl border border-rose-100 bg-white px-4 py-3 text-center font-semibold text-rose-600">
                            {value}
                        </div>
                    ))}
                </div>
            </>
        ),
    },
    {
        label: "Chính sách",
        content: (
            <>
                <p>
                    <strong className="text-rose-600">Chính sách</strong> của La Rosé được thiết kế để đảm bảo trải nghiệm tốt
                    nhất cho khách hàng.
                </p>
                <InfoBox icon={Clock} title="Nhận phòng / Trả phòng">
                    <li>• Nhận phòng từ 14:00, trả phòng trước 12:00</li>
                </InfoBox>
                <InfoBox
                    icon={Wallet}
                    title="Hủy phòng & hoàn tiền"
                    action={
                        <a
                            href={CONTACT.zalo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Liên hệ hoàn tiền
                        </a>
                    }
                >
                    <li>• Hủy trước 5 ngày: hoàn 100%</li>
                    <li>• Hủy trước 3 ngày: hoàn 50%</li>
                    <li>• Hủy sát ngày: không hoàn tiền</li>
                    <li>• Không hoàn tiền nếu khách không đến (no-show)</li>
                </InfoBox>
            </>
        ),
    },
];

const StorySection = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="bg-white">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
                <div>
                    <SectionHeading align="left" eyebrow="Câu chuyện" title="Câu chuyện của chúng tôi" />

                    <div role="tablist" aria-label="Thông tin La Rosé" className="mt-8 grid grid-cols-4 gap-1 rounded-2xl bg-slate-100 p-1">
                        {TABS.map(({ label }, index) => (
                            <button
                                key={label}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === index}
                                onClick={() => setActiveTab(index)}
                                className={`whitespace-nowrap rounded-xl px-1 py-2.5 text-[13px] font-medium transition sm:px-2 sm:text-sm ${
                                    activeTab === index ? "bg-white text-rose-600 shadow-sm" : "text-slate-600 hover:text-rose-600"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div role="tabpanel" className="mt-6 min-h-[16rem] space-y-4 leading-relaxed text-slate-700">
                        {TABS[activeTab].content}
                    </div>
                </div>

                <div className="relative">
                    <img
                        src={storyImage}
                        alt="Hồ bơi và khu nghỉ dưỡng La Rosé lúc hoàng hôn"
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
                    />
                    <div className="absolute right-4 top-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
                        <p className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5
                        </p>
                        <p className="text-xs text-slate-500">Tripadvisor</p>
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
                        <p className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Award className="h-4 w-4 text-amber-500" /> 25+
                        </p>
                        <p className="text-xs text-slate-500">Giải thưởng</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StorySection;
