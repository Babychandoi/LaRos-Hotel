import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        // Chunk thư viện Excel (xlsx-js-style) ~850 kB nhưng chỉ tải khi bấm "Xuất Excel" nên không tính là lỗi.
        chunkSizeWarningLimit: 900,
    },
});
