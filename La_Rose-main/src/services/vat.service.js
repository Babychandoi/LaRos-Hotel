import HttpService from "./http.service";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const fileNameFromHeader = (contentDisposition, fallback) => {
    const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    return match ? decodeURIComponent(match[1]) : fallback;
};

class VATService {
    constructor() {
        this.httpService = new HttpService();
    }

    /**
     * Tải báo cáo thuế VAT (.docx) và kích hoạt tải xuống trên trình duyệt (cần quyền ADMIN).
     * @param {string} startDate YYYY-MM-DD
     * @param {string} endDate YYYY-MM-DD
     * @param {number} khoanchi khoản chi đầu vào
     */
    async exportVATReport(startDate, endDate, khoanchi) {
        try {
            const response = await this.httpService.instance.get("/api/vat-report/export", {
                params: { startDate, endDate, khoanchi },
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: DOCX_MIME }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                fileNameFromHeader(response.headers["content-disposition"], `BaoCaoThue_${startDate}_den_${endDate}.docx`),
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            return { success: true, message: "Xuất báo cáo thuế thành công" };
        } catch (error) {
            console.error("Error exporting VAT report:", error);
            throw new Error("Lỗi khi xuất báo cáo thuế: " + (await readBlobMessage(error) || error.message));
        }
    }
}

// Lỗi khi responseType = "blob": body JSON {message} nằm trong Blob.
const readBlobMessage = async (error) => {
    const data = error?.response?.data;
    if (!(data instanceof Blob)) return data?.message;
    try {
        return JSON.parse(await data.text())?.message;
    } catch {
        return undefined;
    }
};

export default new VATService();
