/** Render một icon (component lucide) được truyền qua dữ liệu, ví dụ `{ icon: Home }`. */
const DynamicIcon = ({ icon, ...props }) => {
    const Icon = icon;
    return <Icon aria-hidden="true" {...props} />;
};

export default DynamicIcon;
