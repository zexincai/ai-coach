import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class RateLimiter:
    """Simple in-memory rate limiter for auth endpoints."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _clean_old(self, key: str, now: float):
        cutoff = now - self.window_seconds
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        now = time.time()
        self._clean_old(key, now)
        if len(self._requests[key]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        self._requests[key].append(now)


auth_rate_limiter = RateLimiter(max_requests=10, window_seconds=60)
