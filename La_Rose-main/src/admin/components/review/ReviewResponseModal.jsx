import { useState } from "react";
import { MessageSquareReply } from "lucide-react";
import { Button, FormField, Modal } from "../common";
import { fieldClass } from "../common/ui";

/** Thêm / sửa phản hồi của quản trị viên. `onSubmit(content)` trả về true khi thành công. */
const ReviewResponseModal = ({ response, onClose, onSubmit }) => {
    const isEdit = Boolean(response);
    const [content, setContent] = useState(response?.content || "");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError("Vui lòng nhập nội dung phản hồi");
            return;
        }
        setSubmitting(true);
        let success = false;
        try {
            success = await onSubmit(content);
        } finally {
            setSubmitting(false);
        }
        if (success) onClose();
    };

    return (
        <Modal
            open
            onClose={submitting ? undefined : onClose}
            dismissible={!submitting}
            title={isEdit ? "Sửa phản hồi" : "Thêm phản hồi"}
            description="Trả lời đánh giá của khách hàng"
            icon={<MessageSquareReply className="h-5 w-5" />}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button onClick={onClose} disabled={submitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" loading={submitting}>
                        {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Gửi phản hồi"}
                    </Button>
                </>
            }
        >
            <FormField label="Nội dung phản hồi" htmlFor="review-response" required error={error}>
                <textarea
                    id="review-response"
                    rows={6}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (error) setError("");
                    }}
                    className={`${fieldClass(error)} resize-y`}
                    placeholder="Cảm ơn quý khách đã lựa chọn La Rosé..."
                    data-autofocus
                />
            </FormField>
        </Modal>
    );
};

export default ReviewResponseModal;
