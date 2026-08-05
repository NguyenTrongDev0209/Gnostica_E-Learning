package com.gnostica.modules.checkout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import com.gnostica.core.constant.GiftStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftActionResponse {
    private UUID giftId;
    private int status;
    private boolean alreadyOwned;
    private String message;

    public static GiftActionResponse alreadyOwned(UUID giftId) {
        return GiftActionResponse.builder()
                .giftId(giftId)
                .status(GiftStatus.REJECTED)
                .alreadyOwned(true)
                .message("Bạn đã sở hữu khóa học này. Quà tặng đã bị từ chối và hoàn tiền cho người gửi.")
                .build();
    }

    public static GiftActionResponse accepted(UUID giftId) {
        return GiftActionResponse.builder()
                .giftId(giftId)
                .status(GiftStatus.ACCEPTED)
                .alreadyOwned(false)
                .message("Nhận quà thành công.")
                .build();
    }
}
