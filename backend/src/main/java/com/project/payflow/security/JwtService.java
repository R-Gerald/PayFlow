// src/main/java/com/project/payflow/security/JwtService.java
package com.project.payflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET = "change-this-secret-key-to-a-long-random-string-256-bits-minimum-!";
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24; // 24h

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(Long merchantId, String phone) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .setSubject(String.valueOf(merchantId))  // sub = id du merchant
                .claim("phone", phone)                   // ajoute un claim sans écraser le sub
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    public Long extractMerchantId(String token) {
        String sub = parseToken(token).getBody().getSubject();
        return Long.valueOf(sub);
    }
}