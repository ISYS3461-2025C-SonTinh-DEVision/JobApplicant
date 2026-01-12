package com.DEVision.JobApplicant.common.config;

import jakarta.servlet.http.Cookie;

public class HttpOnlyCookieConfig {

    private final static int COOKIE_AGE = 5 * 60 * 60; // 5 hours

    public static Cookie createCookie(String name, String value) {

        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(COOKIE_AGE); 
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(true); // HTTPS is now required
        return cookie;
    }
}
