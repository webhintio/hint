# Expires attribute in `Set-Cookie` headers

The `Expires` attribute in a `Set-Cookie` header defines when the cookie should expire.

It must follow the **RFC 6265** date format:

⚠️ **Notes:**
- The date must use the `GMT` timezone.
- Invalid formats or missing timezone cause browsers to ignore the cookie.
- When using `Max-Age`, `Expires` may be omitted.
