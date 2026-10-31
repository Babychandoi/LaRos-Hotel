import HttpService from "./http.service";

const http = new HttpService();

class ChatbotService {
    /** Gửi câu hỏi tới backend (backend giữ API key Gemini) và trả về nội dung trả lời dạng Markdown. */
    async ask(message) {
        try {
            const data = await http.post("/api/chatbot/ask", { message }, { skipAuth: true, timeout: 45000 });
            return data.reply;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Không kết nối được trợ lý ảo. Vui lòng thử lại sau.");
        }
    }
}

export default new ChatbotService();
