// src/main/java/com/project/payflow/config/JwtAuthenticationFilter.java
package com.project.payflow.config;

import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final MerchantRepository merchantRepository;

    public JwtAuthenticationFilter(JwtService jwtService, MerchantRepository merchantRepository) {
        this.jwtService = jwtService;
        this.merchantRepository = merchantRepository;
    }

   // src/main/java/com/project/payflow/config/JwtAuthenticationFilter.java
// src/main/java/com/project/payflow/config/JwtAuthenticationFilter.java

@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain chain)
        throws ServletException, IOException {

    String bearer = request.getHeader("Authorization");
    String token = null;

    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
        token = bearer.substring(7);
    }

    if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
            Long merchantId = jwtService.extractMerchantId(token);
            System.out.println("[JWT FILTER] merchantId from token = " + merchantId);

            Merchant merchant = merchantRepository.findById(merchantId).orElse(null);
            if (merchant != null) {
                System.out.println("[JWT FILTER] Merchant found: " + merchant.getPhone());

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                merchant,
                                null,
                                Collections.emptyList()
                        );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("[JWT FILTER] No merchant for id " + merchantId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    } else {
        if (token == null) {
            System.out.println("[JWT FILTER] No token for " + request.getRequestURI());
        } else {
            System.out.println("[JWT FILTER] Authentication already present for " + request.getRequestURI());
        }
    }

    chain.doFilter(request, response);
}
}