package com.shtilmanilan.ai_promote_backend.service;

import java.util.concurrent.ConcurrentHashMap;

public class RateLimiter {
    private final ConcurrentHashMap<String, Long> lastRequestTime = new ConcurrentHashMap<>();
    private final int MAX_REQUESTS_PER_MINUTE = 2;
    private final long COOLDOWN_MILLIS = MAX_REQUESTS_PER_MINUTE *60 * 1000; 

    public boolean isAllowed(String userKey) {
        long now = System.currentTimeMillis();
        Long lastTime = lastRequestTime.get(userKey);
        
        if (lastTime == null || now - lastTime >= COOLDOWN_MILLIS) {
            lastRequestTime.put(userKey, now);
            return true;
        } else {
            return false;
        }
    }
}