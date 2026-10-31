/** Khung trường nhập: nhãn (adm-label), dấu * bắt buộc, lỗi (adm-field-error) hoặc gợi ý. */
const FormField = ({ label, htmlFor, required, error, hint, className = "", children }) => (
    <div className={`min-w-0 ${className}`}>
        {label && (
            <label htmlFor={htmlFor} className="adm-label">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
        )}
        {children}
        {error ? (
            <p className="adm-field-error" role="alert">
                {error}
            </p>
        ) : (
            hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
    </div>
);

export default FormField;
