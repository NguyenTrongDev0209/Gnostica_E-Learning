package com.gnostica.modules.messaging.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorPageResponse<T> {
    private List<T> items;
    private String nextCursor;
    private boolean hasNext;
}
