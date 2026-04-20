package com.gnostica.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDTO {
    private String id;
    private String user;
    private String course;
    private Double price;
    private String status; // completed, pending, failed
    private String date; // e.g. "Vừa xong"
}
