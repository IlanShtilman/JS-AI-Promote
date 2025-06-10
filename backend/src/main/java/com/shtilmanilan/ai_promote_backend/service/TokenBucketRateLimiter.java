package com.shtilmanilan.ai_promote_backend.service;

import java.util.concurrent.ConcurrentHashMap;

public class TokenBucketRateLimiter {
    private final ConcurrentHashMap<String, UserBucket> userBuckets = new ConcurrentHashMap<>();
    private final int maxTokens;
    private final long refillRateMillis;
    
    public TokenBucketRateLimiter(int maxTokens, long refillRateMillis) {
        this.maxTokens = maxTokens;
        this.refillRateMillis = refillRateMillis;
    }
    
    public boolean isAllowed(String userKey) {
        UserBucket bucket = userBuckets.computeIfAbsent(userKey, k -> new UserBucket(maxTokens));
        return bucket.consume();
    }
    
    private class UserBucket {
        private int tokens;
        private long lastRefill;
        
        public UserBucket(int initialTokens) {
            this.tokens = initialTokens;
            this.lastRefill = System.currentTimeMillis();
        }
        
        public synchronized boolean consume() {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }
        
        private void refill() {
            long now = System.currentTimeMillis();
            long timePassed = now - lastRefill;
            int tokensToAdd = (int) (timePassed / refillRateMillis);
            
            if (tokensToAdd > 0) {
                tokens = Math.min(maxTokens, tokens + tokensToAdd);
                lastRefill = now;
            }
        }
    }
}