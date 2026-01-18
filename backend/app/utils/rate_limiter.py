from flask import request
from functools import wraps
from datetime import datetime, timedelta
import json

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, identifier, max_requests=5, time_window=60):
        """Check if request is allowed (5 requests per minute by default)"""
        now = datetime.now()
        key = str(identifier)
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests outside the time window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if (now - req_time).seconds < time_window
        ]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= max_requests:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True
    
    def get_retry_after(self, identifier, time_window=60):
        """Get seconds until next request is allowed"""
        key = str(identifier)
        if key not in self.requests or not self.requests[key]:
            return 0
        
        oldest_request = self.requests[key][0]
        retry_after = time_window - (datetime.now() - oldest_request).seconds
        return max(0, retry_after)

# Global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(max_requests=5, time_window=60):
    """Decorator for rate limiting routes"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user identifier (IP or user_id)
            identifier = request.remote_addr
            
            if not rate_limiter.is_allowed(identifier, max_requests, time_window):
                retry_after = rate_limiter.get_retry_after(identifier, time_window)
                return {
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Please try again in {retry_after} seconds.',
                    'retry_after': retry_after
                }, 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
