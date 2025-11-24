import axios from 'axios';

class VATService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/vat-report';
    }

    /**
     * Xuất báo cáo thuế VAT từ backend
     * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
     * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
     * @param {number} khoanchi - Khoản chi tiêu
     */
    async exportVATReport(startDate, endDate, khoanchi) {
        try {
            const token = localStorage.getItem('accessToken');
            
            const response = await axios.get(`${this.baseURL}/export`, {
                params: {
                    startDate: startDate,
                    endDate: endDate,
                    khoanchi: khoanchi
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Quan trọng: nhận file dạng blob
            });

            // Tạo URL từ blob
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const url = window.URL.createObjectURL(blob);

            // Tạo link download
            const link = document.createElement('a');
            link.href = url;
            
            // Lấy tên file từ header hoặc tạo tên mặc định
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `BaoCaoThue_${startDate}_den_${endDate}.docx`;
            
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true, message: 'Xuất báo cáo thuế thành công' };
        } catch (error) {
            console.error('Error exporting VAT report:', error);
            throw new Error('Lỗi khi xuất báo cáo thuế: ' + (error.response?.data?.message || error.message));
        }
    }

    /**
     * Tính toán dữ liệu thuế VAT để hiển thị preview
     * @param {Object} data - Dữ liệu từ dashboard
     */
    calculateVATPreview(data) {
        const vatRate = 0.1; // 10%
        
        const khoanchi = parseFloat(data.khoanchi) || 0;
        const vatkhoanchi = khoanchi * vatRate;
        const tongkhoanchi = khoanchi + vatkhoanchi;
        
        const doanhthudichvu = parseFloat(data.doanhthudichvu) || 0;
        const vatdoanhthudichvu = doanhthudichvu * vatRate;
        const tongdoanhthudichvu = doanhthudichvu + vatdoanhthudichvu;
        
        const doanhthu = parseFloat(data.doanhthu) || 0;
        const vatdoanhthu = doanhthu * vatRate;

        return {
            kithue: data.kithue || '',
            khoanchi,
            vatkhoanchi,
            tongkhoanchi,
            doanhthudichvu,
            tongdoanhthudichvu,
            vatdoanhthudichvu,
            doanhthu,
            vatdoanhthu
        };
    }
}

export default new VATService();
