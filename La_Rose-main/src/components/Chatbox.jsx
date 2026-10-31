import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Leaf, MessageCircle, Send, X } from "lucide-react";
import chatbotService from "../services/chatbot.service";

const GREETING = {
    role: "bot",
    content: "✨ Xin chào bạn! Tôi là **Trợ lý La Rosé**, sẵn sàng tư vấn về đặt phòng khách sạn! 🏨",
};

// Tailwind preflight xoá kiểu danh sách/tiêu đề → khôi phục cho nội dung Markdown của bot.
const MARKDOWN =
    "space-y-2 break-words text-sm leading-relaxed [&_a]:underline [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5";

const Bubble = ({ role, children }) => (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
        <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-rose-500 to-pink-600 text-white"
                    : "rounded-bl-md border border-rose-100 bg-white text-slate-800"
            }`}
        >
            {children}
        </div>
    </div>
);

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([GREETING]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (isOpen && listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages, isLoading, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isLoading) return;

        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setInput("");
        setIsLoading(true);
        try {
            const answer = await chatbotService.ask(question);
            setMessages((prev) => [...prev, { role: "bot", content: answer }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: `❌ ${error.message}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {isOpen && (
                <section
                    aria-label="Trợ lý La Rosé"
                    className="flex h-[min(560px,calc(100svh-7rem))] w-[calc(100vw-2rem)] animate-fade-in flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-2xl sm:w-96"
                >
                    <header className="flex items-center justify-between gap-3 bg-gradient-to-br from-rose-500 to-pink-600 px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-500">
                                <Leaf className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-semibold">Trợ lý La Rosé</h2>
                                <p className="flex items-center gap-1.5 text-xs text-white/85">
                                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                    Powered by Gemini AI
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Đóng trò chuyện"
                            className="rounded-full p-2 transition hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-rose-50/40 p-4">
                        {messages.map((msg, index) => (
                            <Bubble key={index} role={msg.role}>
                                <div className={MARKDOWN}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                            </Bubble>
                        ))}
                        {isLoading && (
                            <Bubble role="bot">
                                <div className="flex items-center gap-2 text-xs text-rose-500">
                                    <span className="flex gap-1">
                                        {[0, 150, 300].map((delay) => (
                                            <span
                                                key={delay}
                                                className="h-2 w-2 animate-bounce rounded-full bg-rose-400"
                                                style={{ animationDelay: `${delay}ms` }}
                                            />
                                        ))}
                                    </span>
                                    AI đang tìm phòng...
                                </div>
                            </Bubble>
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-rose-100 bg-white p-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Hỏi tôi về phòng, tiện nghi, giá cả..."
                            disabled={isLoading}
                            className="h-11 min-w-0 flex-1 rounded-full border border-rose-100 bg-rose-50/40 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            aria-label="Gửi"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Đóng trợ lý" : "Mở trợ lý La Rosé"}
                aria-expanded={isOpen}
                className={`relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 rounded-full text-white shadow-lg transition hover:scale-105 ${
                    isOpen ? "bg-slate-600 hover:bg-slate-700" : "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30"
                }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                {!isOpen && <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />}
            </button>
        </div>
    );
}
