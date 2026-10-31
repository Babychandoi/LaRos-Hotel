import HttpService from "./http.service";

/** Upload ảnh/video (đánh giá) lên BE; file được phục vụ lại qua `${API_ORIGIN}/uploads/...`. */
class UploadService {
    constructor() {
        this.httpService = new HttpService();
        this.basePath = "/api/upload";
    }

    /** @returns {Promise<{url: string, filename: string, originalName: string}>} */
    uploadFile(file, folder = "reviews") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        return this.httpService.post(`${this.basePath}/file`, formData);
    }

    /** @returns {Promise<{files: Array<{url, filename, originalName}>, errors?: string[]}>} */
    uploadFiles(files, folder = "reviews") {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("folder", folder);
        return this.httpService.post(`${this.basePath}/files`, formData, { timeout: 120000 });
    }

    deleteFile(url) {
        return this.httpService.delete(`${this.basePath}/file`, { params: { url } });
    }
}

const uploadService = new UploadService();
export default uploadService;
