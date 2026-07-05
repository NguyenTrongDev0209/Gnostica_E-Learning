package com.gnostica.core.constant.enums;

import lombok.Getter;

@Getter
public enum EntityStatus {
    HIDDEN(0),
    PUBLISHED(1),
    BANNED(2),
    DELETED(3),
    PENDING(4),
    ACTIVE(5),
    INACTIVE(6);

    private final int value;

    EntityStatus(int value) {
        this.value = value;
    }
}
