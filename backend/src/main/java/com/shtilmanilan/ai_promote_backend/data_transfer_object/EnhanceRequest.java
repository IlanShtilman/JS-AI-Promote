package com.shtilmanilan.ai_promote_backend.data_Transfer_Object;

import lombok.Data;

@Data
public class EnhanceRequest {
    private String input;
    private Object operations;
    private Object output;
}