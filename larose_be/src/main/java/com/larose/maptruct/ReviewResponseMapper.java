package com.larose.maptruct;

import com.larose.dto.request.ReqReviewResponse;
import com.larose.dto.response.ResReviewResponse;
import com.larose.entity.ReviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ReviewMapper.class})
public interface ReviewResponseMapper {

    @Mapping(target = "review", ignore = true)
    @Mapping(target = "responder", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ReviewResponse toReviewResponse(ReqReviewResponse request);

    ResReviewResponse toResReviewResponse(ReviewResponse review);
}
