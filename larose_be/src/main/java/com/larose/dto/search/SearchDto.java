package com.larose.dto.search;

/** Tham số phân trang chung (pageIndex bắt đầu từ 0); giá trị null/âm giữ mặc định. */
public abstract class SearchDto {
    private int pageIndex = 0;
    private int pageSize = 10;

    public int getPageIndex() {
        return pageIndex;
    }

    public void setPageIndex(Integer pageIndex) {
        if (pageIndex != null && pageIndex > 0) {
            this.pageIndex = pageIndex;
        }
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        if (pageSize != null && pageSize > 0) {
            this.pageSize = pageSize;
        }
    }
}
