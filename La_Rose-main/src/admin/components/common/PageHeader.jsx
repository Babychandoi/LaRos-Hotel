/** Tiêu đề trang quản trị: tiêu đề + mô tả bên trái, hành động chính bên phải. */
const PageHeader = ({ title, description, actions }) => (
    <div className="adm-page-header">
        <div className="min-w-0">
            <h2 className="adm-page-title">{title}</h2>
            {description && <p className="adm-page-sub">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);

export default PageHeader;
