/**
 * Skill Icons Component
 * SVG icons for technology skills
 * Architecture: A.1.c Reusable Component
 */

import React from 'react';

// Technology SVG Icons - Clean, professional brand icons
const SKILL_ICONS = {
    // Frontend
    react: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(120 12 12)" />
        </svg>
    ),
    javascript: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <rect width="24" height="24" rx="2" fill="#F7DF1E" />
            <path d="M6.5 17.5l1.8-1.1c.4.7.7 1.3 1.5 1.3.8 0 1.3-.3 1.3-1.5v-7h2.2v7.1c0 2.4-1.4 3.5-3.5 3.5-1.9 0-3-1-3.3-2.3zm7.5-.4l1.8-1c.5.8 1.1 1.4 2.3 1.4 1 0 1.6-.5 1.6-1.2 0-.8-.6-1.1-1.8-1.6l-.6-.3c-1.8-.8-3-1.7-3-3.8 0-1.9 1.4-3.3 3.7-3.3 1.6 0 2.7.5 3.5 2l-1.9 1.2c-.4-.7-.9-1-1.6-1-.7 0-1.2.5-1.2 1 0 .7.5 1 1.5 1.4l.6.3c2.1.9 3.3 1.8 3.3 3.9 0 2.2-1.7 3.4-4.1 3.4-2.3 0-3.8-1.1-4.5-2.5z" fill="#000" />
        </svg>
    ),
    typescript: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <rect width="24" height="24" rx="2" fill="#3178C6" />
            <path d="M5 12v-1h8v1h-3v8h-2v-8h-3zm8.5 0c0-.8.6-1.4 1.4-1.4h3.7v1.3H15c-.4 0-.7.2-.7.6 0 .3.2.5.6.6l1.7.5c1 .3 1.6.9 1.6 1.8 0 1-.8 1.7-1.9 1.7h-3.8v-1.3h3.7c.4 0 .7-.2.7-.5 0-.3-.2-.5-.6-.6l-1.7-.5c-1-.3-1.6-.9-1.6-1.9 0-.1 0-.2 0-.3z" fill="#fff" />
        </svg>
    ),
    vue: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M2 3l10 18L22 3h-4l-6 10.5L6 3H2z" fill="#41B883" />
            <path d="M6 3l6 10.5L18 3h-3l-3 5.5L9 3H6z" fill="#35495E" />
        </svg>
    ),
    angular: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 2L2 6l1.5 13L12 22l8.5-4L22 6L12 2z" fill="#DD0031" />
            <path d="M12 2v20l8.5-4L22 6L12 2z" fill="#C3002F" />
            <path d="M12 4.5L6 17h2.2l1.2-3h5.2l1.2 3H18L12 4.5zM12 8.5l1.8 4h-3.6l1.8-4z" fill="#fff" />
        </svg>
    ),
    nextjs: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="11" fill="#000" stroke="#fff" strokeWidth="0.5" />
            <path d="M9 16V8l8.5 10.5" stroke="#fff" strokeWidth="1.5" fill="none" />
            <circle cx="16" cy="8" r="1.5" fill="#fff" />
        </svg>
    ),
    html: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M4 4l1.5 16L12 22l6.5-2L20 4H4z" fill="#E34F26" />
            <path d="M12 20l5.5-1.5 1.3-14H12v15.5z" fill="#EF652A" />
            <path d="M8.5 8.5h7l-.5 5-2.5.8-2.5-.8-.2-2h-2l.3 3.5 4.4 1.5 4.4-1.5.6-6.5H8.5v-1z" fill="#fff" />
        </svg>
    ),
    css: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M4 4l1.5 16L12 22l6.5-2L20 4H4z" fill="#1572B6" />
            <path d="M12 20l5.5-1.5 1.3-14H12v15.5z" fill="#33A9DC" />
            <path d="M8.5 8.5h7l-.2 2H8.5v1h6.8l-.6 5.5-2.7 1-2.7-1-.2-2h-2l.3 3.5 4.6 1.5 4.6-1.5.8-8.5H8.5v-1z" fill="#fff" />
        </svg>
    ),
    tailwind: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 6c-2.5 0-4 1.2-4.5 3.6.9-1.2 2-1.7 3.2-1.4.7.2 1.2.7 1.8 1.3.9 1 2 2.1 4.3 2.1 2.5 0 4-1.2 4.5-3.6-.9 1.2-2 1.7-3.2 1.4-.7-.2-1.2-.7-1.8-1.3-.9-1-2-2.1-4.3-2.1zM7.5 12c-2.5 0-4 1.2-4.5 3.6.9-1.2 2-1.7 3.2-1.4.7.2 1.2.7 1.8 1.3.9 1 2 2.1 4.3 2.1 2.5 0 4-1.2 4.5-3.6-.9 1.2-2 1.7-3.2 1.4-.7-.2-1.2-.7-1.8-1.3-.9-1-2-2.1-4.3-2.1z" fill="#06B6D4" />
        </svg>
    ),
    // Backend
    nodejs: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 22c-.5 0-.9-.1-1.3-.4l-4-2.3c-.6-.4-.3-.5-.1-.6.8-.3 1-.3 1.9-.8.1 0 .2 0 .3.1l3.1 1.8c.1.1.3.1.4 0l12-6.9c.1-.1.2-.2.2-.4V5.6c0-.2-.1-.3-.2-.4l-12-6.9c-.1-.1-.3-.1-.4 0l-12 6.9c-.1.1-.2.3-.2.4v13.8c0 .1.1.3.2.4l3.3 1.9c1.8.9 2.9-.2 2.9-1.3V6.7c0-.2.2-.4.4-.4h1.7c.2 0 .4.2.4.4v13.7c0 2.6-1.4 4.1-3.9 4.1-.8 0-1.4 0-3.1-.8l-3.1-1.8C.3 21.4 0 20.7 0 19.9V6.1c0-.8.3-1.5.9-1.9L12.9.3c.6-.3 1.4-.3 2 0l12 6.9c.6.4 1 1.1 1 1.9v13.8c0 .8-.4 1.5-1 1.9l-12 6.9c-.4.2-.8.3-1.2.3z" fill="#539E43" />
        </svg>
    ),
    python: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 2c-2.5 0-4.6.2-6.2.6C3.7 3 2.5 4 2.5 5.8v3c0 1.8 1.3 3 3.3 3.2h8.4c1.5 0 2.8 1.3 2.8 2.8v2.8H21c1.5 0 2.8-1.3 2.8-2.7V12c0-1.5-1.2-2.8-2.8-2.8h-9c-.6 0-1.2.6-1.2 1.2v.9H7C5.5 11.3 4 10 4 8.5V5.8c0-1.5 1.5-2.6 3-2.8C8.5 2.6 10.2 2.5 12 2.5z" fill="#306998" />
            <path d="M12 22c2.5 0 4.6-.2 6.2-.6 2.1-.4 3.3-1.4 3.3-3.2v-3c0-1.8-1.3-3-3.3-3.2H9.8c-1.5 0-2.8-1.3-2.8-2.8V6.4H3c-1.5 0-2.8 1.3-2.8 2.7V12c0 1.5 1.2 2.8 2.8 2.8h9c.6 0 1.2-.6 1.2-1.2v-.9H17c1.5 0 3 1.3 3 2.8v2.7c0 1.5-1.5 2.6-3 2.8-1.5.4-3.2.5-5 .5z" fill="#FFD43B" />
            <circle cx="7.5" cy="5" r="1" fill="#FFD43B" />
            <circle cx="16.5" cy="19" r="1" fill="#306998" />
        </svg>
    ),
    java: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M8.5 18.5s-1 .5 1 .7c2.5.3 3.8.3 6.5-.3 0 0 .7.5 1.7.9-6 2.5-13.5-.1-9.2-1.3zm-.8-3s-1.1.8.8 1c2.5.2 4.8.3 8.4-.4 0 0 .5.5 1.3.8-7.3 2.1-15.4.2-10.5-1.4z" fill="#5382A1" />
            <path d="M13 11c1.5 1.8-.4 3.4-.4 3.4s4-2 2.2-4.6c-1.7-2.3-3-3.4 4.2-7.3 0 0-11.4 2.8-6 8.5z" fill="#E76F00" />
            <path d="M18.5 20s.8.6-.8 1.1c-3.1.9-13 1.2-15.7 0-.9-.4.8-1 1.4-1.1.6-.1.9-.1.9-.1-1-.7-6.8 1.4-2.9 2 10.4 1.7 19-1 17.1-2z" fill="#5382A1" />
            <path d="M9 13s-4.8 1.1-1.7 1.5c1.3.2 3.9.1 6.4-.1 2-.1 4-.4 4-.4s-.7.3-1.2.6c-4.9 1.3-14.3.7-11.6-.6 2.3-1 4.1-1 4.1-1zm8.5 4.8c5-2.6 2.7-5.1 1.1-4.8-.4.1-.5.2-.5.2s.2-.2.5-.4c3.3-1.2 5.8 3.4-1 5.2 0 0 0-.1-.1-.2z" fill="#5382A1" />
        </svg>
    ),
    spring: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M20.6 5.4c.9-1.3.6-3.3.6-3.3s-2 .3-3.3 1.2c-1.5-1.2-3.5-1.7-5.3-1.7s-3.7.5-5.3 1.7C6 2.4 4 2.1 4 2.1s-.3 2 .6 3.3C3.2 6.7 2.5 8.5 2.5 10.5c0 6 4.9 11 11 11s11-5 11-11c0-2-.7-3.8-1.8-5.1zM12 19c-4.4 0-8-3.6-8-8 0-1.5.4-2.9 1.2-4.1.3.7.8 1.4 1.5 2 1.2 1 2.7 1.6 4.3 1.6h1c1.6 0 3.1-.6 4.3-1.6.7-.6 1.2-1.3 1.5-2 .8 1.2 1.2 2.6 1.2 4.1 0 4.4-3.6 8-8 8z" fill="#6DB33F" />
            <path d="M16.5 7.8c-.8.7-1.8 1.2-2.9 1.2h-3.2c-1.1 0-2.1-.5-2.9-1.2-.6-.5-1-1.1-1.3-1.8.7-.5 1.4-.8 2.2-.8h7c.8 0 1.5.3 2.2.8-.3.7-.7 1.3-1.1 1.8z" fill="#6DB33F" />
        </svg>
    ),
    express: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M24 18.5c-.3 0-.6-.1-.8-.3l-3.5-2.7c-.5-.3-.7-.5-.7-1V6.9c0-.5.3-.8.7-.9l3.5-2.7c.4-.3 1-.3 1.4 0 .4.3.4.8 0 1.1L21.5 6.8v8.4l3.1 2.4c.4.3.4.8 0 1.1-.2.2-.4.3-.6.3zM0 18.5c.3 0 .6-.1.8-.3l3.5-2.7c.5-.3.7-.5.7-1V6.9c0-.5-.2-.8-.7-.9L.8 3.3c-.4-.3-1-.3-1.4 0-.4.3-.4.8 0 1.1l3.1 2.4v8.4l-3.1 2.4c-.4.3-.4.8 0 1.1.2.2.4.3.6.3z" fill="currentColor" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
    ),
    go: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M1.5 9.7c-.2 0-.3-.1-.2-.3l.4-.5c0-.1.2-.2.3-.2h7.2c.2 0 .3.1.2.3l-.3.5c0 .1-.2.2-.3.2l-7.3-.1zm-1-1.8c-.2 0-.3-.1-.2-.3l.4-.5c0-.1.2-.2.3-.2h9.2c.2 0 .3.1.2.3l-.1.4c0 .2-.2.3-.4.3l-9.4.1zm1.6 3.7c-.2 0-.3-.1-.2-.3l.2-.5c0-.1.2-.2.3-.2h4c.2 0 .3.1.3.3l-.1.4c0 .2-.2.3-.4.3l-4.1-.1z" fill="#00ADD8" />
            <path d="M18.2 8.2c-1.4.4-2.3.6-3.7 1-.3.1-.4.1-.6-.2-.3-.3-.5-.5-.9-.7-.9-.4-1.7-.3-2.5.2-1 .6-1.4 1.5-1.4 2.5 0 1.1.6 2 1.6 2.5.9.5 1.8.4 2.7-.1.5-.3.9-.7 1.3-1.3h-3c-.4 0-.5-.2-.4-.6.2-.6.5-1.5.7-2 .1-.2.2-.4.5-.4h5.5c0 .4-.1.9-.1 1.3-.2 1.1-.7 2.2-1.5 3-.9 1-2.1 1.7-3.5 1.9-1.1.2-2.2.1-3.2-.4-1.1-.5-1.8-1.3-2.2-2.4-.4-1.2-.4-2.5.1-3.7.6-1.4 1.5-2.5 2.9-3.2 1.2-.6 2.5-.8 3.8-.5.9.2 1.7.6 2.4 1.3.2.2.2.3 0 .5l-1.6 1.2z" fill="#00ADD8" />
        </svg>
    ),
    rust: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M23.8 11.5l-1.1-.6-.1-.9 1-.8c.2-.1.2-.4 0-.5l-1.1-.6-.2-.9.8-.9c.1-.2.1-.4-.1-.5l-1.2-.4-.4-.8.6-1c.1-.2 0-.4-.2-.5l-1.2-.3-.5-.7.4-1c0-.2-.1-.4-.3-.5l-1.2-.1-.6-.7.2-1.1c0-.2-.2-.4-.4-.4l-1.2.1-.7-.5v-1.1c-.1-.2-.3-.3-.5-.3l-1.1.3-.8-.4-.2-1.1c-.1-.2-.3-.3-.5-.2l-1 .4-.9-.2-.4-1c-.1-.2-.3-.3-.5-.2L12 .6l-.9-.1L10.4 0c-.2 0-.4 0-.5.2L9.5 1l-.9.1L7.8.5c-.2-.1-.4 0-.5.2l-.4 1-.9.2-.7-.6c-.2-.1-.4-.1-.5.1L4 2.4l-.8.4L2.1 2.4c-.2-.1-.4 0-.5.2l-.1 1.1-.7.5-1-.1c-.2 0-.4.1-.4.3v1.1l-.7.5L-.4 5c0 .2-.1.4.1.5l.5.8-.6.7-1.2.1c-.2 0-.3.2-.3.4l.2 1-.5.9-1.2.3c-.2.1-.3.3-.2.5l.4 1-.4.8-1.2.5c-.2.1-.2.3-.1.5l.6.9-.3.9-1.1.6c-.2.1-.2.4 0 .5l.8.8-.1.9-1 .8c-.2.2-.2.4 0 .5l1.1.6.1.9-1 .8c-.2.2-.2.4 0 .5l1 .7.2.9-.8.9c-.1.2-.1.4.1.5l1.2.4.4.8-.6 1c-.1.2 0 .4.2.5l1.2.3.5.7-.4 1c0 .2.1.4.3.5l1.2.1.6.7-.2 1.1c0 .2.2.4.4.4l1.2-.1.7.5v1.1c.1.2.3.3.5.3l1.1-.3.8.4.2 1.1c.1.2.3.3.5.2l1-.4.9.2.4 1c.1.2.3.3.5.2l.7-.6.9.1.7.5c.2.1.4.1.5-.1l.4-1 .9-.1.7.6c.2.1.4.1.5-.1l.5-.9.8-.1.7.5c.2.1.4 0 .5-.2l.2-1.1.8-.4 1 .4c.2.1.4 0 .5-.2l.1-1.1.7-.5 1 .1c.2 0 .4-.1.4-.3v-1.1l.7-.5 1.1.2c.2 0 .4-.1.4-.3l-.2-1.1.6-.6 1.1.1c.2 0 .4-.2.3-.4l-.3-1 .5-.7 1.2-.3c.2-.1.3-.3.2-.5l-.5-.9.4-.8 1.2-.5c.2-.1.2-.3.1-.5l-.7-.9.3-.9 1.2-.6c.2-.1.3-.3.2-.5l-.8-.8.2-.9.9-.8c.4-.1.4-.4.2-.5zM12 18.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z" fill="#000" />
        </svg>
    ),
    // DevOps
    docker: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M13 11h2v2h-2v-2zm-2 0h2v2h-2v-2zm-2 0h2v2H9v-2zm-2 0h2v2H7v-2zm-2 0h2v2H5v-2zm4-2h2v2H9V9zm-2 0h2v2H7V9zm-2 0h2v2H5V9zm6 0h2v2h-2V9zm0-2h2v2h-2V7z" fill="#2496ED" />
            <path d="M23.5 11.1c-.2-.1-.5-.3-1-.4-.1-.9-.6-1.7-1.3-2.2l-.3-.2-.2.3c-.3.4-.4.9-.4 1.3 0 .5.1 1 .4 1.4-.5.3-1.1.5-1.7.5H.8c-.4 0-.7.3-.7.7v.2c0 1.8.5 3.4 1.5 4.6.8 1 2 1.6 3.5 1.8.6.1 1.2.1 1.8.1 1.5 0 3-.3 4.4-.9.7-.3 1.4-.7 2-1.2.9-.8 1.5-1.8 1.8-3h.2c1.1 0 1.9-.4 2.4-1 .3-.3.5-.7.6-1.1l.1-.4-.2-.1z" fill="#2496ED" />
        </svg>
    ),
    kubernetes: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 1.5L3 6.5v11l9 5 9-5v-11l-9-5zm0 1.7l7 3.9v8.8l-7 3.9-7-3.9V7.1l7-3.9z" fill="#326CE5" />
            <path d="M12 7l-4 2.3v4.6L12 16l4-2.1v-4.6L12 7z" fill="#326CE5" />
        </svg>
    ),
    aws: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M7 13.4l-.6 1.7-.6-1.7H5l1 2.5-.4 1H6l1.5-3.5h-.5zm3.4 0l-.6 2.2-.6-2.2H8l1 3.5h.8l.6-2.1.6 2.1h.8l1-3.5h-.8l-.6 2.2-.6-2.2h-.4zm4.3 2.4c0-.4.3-.6.8-.7l.9-.1v-.1c0-.3-.2-.4-.6-.4-.4 0-.6.1-.7.4l-.7-.1c.1-.6.6-1 1.4-1 .7 0 1.2.4 1.2 1v1.6c0 .2 0 .4.1.5h-.7l-.1-.4c-.2.3-.5.5-1 .5s-.9-.3-.9-.8zm1.7-.3v-.3l-.7.1c-.3 0-.5.1-.5.3 0 .2.2.3.4.3.4 0 .8-.2.8-.4z" fill="#232F3E" />
            <path d="M20.7 16.4c-3.1 2.3-7.6 3.5-11.4 3.5-5.4 0-10.3-2-14-5.3-.3-.3 0-.7.3-.4 4 2.3 8.9 3.7 14 3.7 3.4 0 7.2-.7 10.7-2.2.5-.2 1 .3.4.7zM22 14.8c-.4-.5-2.5-.2-3.4-.1-.3 0-.3-.2-.1-.4 1.7-1.2 4.5-.8 4.8-.4.3.4-.1 3.1-1.6 4.4-.2.2-.5.1-.4-.2.4-1 1.3-3.1.7-3.3z" fill="#FF9900" />
        </svg>
    ),
    git: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M23.5 11.2L12.8.5c-.7-.7-1.8-.7-2.4 0l-2.2 2.2 2.8 2.8c.6-.2 1.4-.1 1.9.5.5.5.7 1.2.5 1.9l2.7 2.7c.6-.2 1.4-.1 1.9.5.7.7.7 1.8 0 2.5s-1.8.7-2.5 0c-.5-.5-.7-1.3-.4-2l-2.5-2.5v6.6c.2.1.3.2.5.3.7.7.7 1.8 0 2.5s-1.8.7-2.5 0-0.7-1.8 0-2.5c.2-.2.4-.3.6-.4V9.9c-.2-.1-.4-.2-.6-.4-.5-.5-.7-1.3-.4-2l-2.8-2.8L.5 9.6c-.7.7-.7 1.8 0 2.4l10.7 10.7c.7.7 1.8.7 2.4 0L23.5 13.6c.7-.6.7-1.7 0-2.4z" fill="#F05032" />
        </svg>
    ),
    linux: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 2C8.7 2 6 5.6 6 10c0 1.5.3 2.8.8 4-1.5.8-2.8 1.8-2.8 3.5C4 20 6.5 22 12 22s8-2 8-4.5c0-1.7-1.3-2.7-2.8-3.5.5-1.2.8-2.5.8-4 0-4.4-2.7-8-6-8zm-3 8c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1-1-.4-1-1zm4 7c-1.5 0-3-.5-3-1.5 0-.4.3-.8.8-1 .4.3 1.2.5 2.2.5s1.8-.2 2.2-.5c.5.2.8.6.8 1 0 1-1.5 1.5-3 1.5zm2-6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" fill="#FCC624" />
        </svg>
    ),
    // Database
    mongodb: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 2c-.3.7-.6 1.4-.8 2.1-.5 1.4-.7 2.9-.7 4.4 0 1.7.3 3.4.8 5 .3.9.7 1.7 1.2 2.5.4.6.8 1.2 1.3 1.7.2.2.4.4.6.5v3.8c-.1.1-.2.2-.2.3-.4.5-.5 1.1-.3 1.7h-2c.2-.6.1-1.2-.3-1.7-.1-.1-.2-.2-.2-.3V18c.2-.1.4-.3.6-.5.5-.5.9-1.1 1.3-1.7.5-.8.9-1.6 1.2-2.5.5-1.6.8-3.3.8-5 0-1.5-.3-3-.7-4.4-.2-.7-.5-1.4-.8-2.1-.1-.2-.2-.4-.4-.6-.1-.1-.3-.2-.4-.2-.1 0-.3.1-.4.2-.2.2-.3.4-.4.6z" fill="#00ED64" />
            <path d="M12.5 22h-1c.2-.6.1-1.2-.3-1.7-.1-.1-.2-.2-.2-.3v-1.7c.3.2.5.3.8.3.3 0 .5-.1.8-.3V20c0 .1-.1.2-.2.3-.4.5-.5 1.1.1 1.7z" fill="#B8C4C2" />
        </svg>
    ),
    postgresql: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M17.5 18.5c-.5 2-1.5 3-3 3.5-1.5-.5-2.5-1.5-3-3.5v-2c1-.5 2-.5 3 0 1-.5 2-.5 3 0v2z" fill="#336791" />
            <ellipse cx="12" cy="6" rx="8" ry="4" fill="#336791" />
            <path d="M4 6v10c0 2.2 3.6 4 8 4s8-1.8 8-4V6" fill="none" stroke="#336791" strokeWidth="2" />
            <path d="M12 14c4.4 0 8-1.8 8-4" fill="none" stroke="#336791" strokeWidth="2" />
        </svg>
    ),
    mysql: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 3C7 3 3 5.5 3 9v6c0 3.5 4 6 9 6s9-2.5 9-6V9c0-3.5-4-6-9-6z" fill="#00758F" />
            <ellipse cx="12" cy="9" rx="9" ry="4" fill="#F29111" />
            <path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9" fill="none" stroke="#00758F" strokeWidth="0.5" />
        </svg>
    ),
    redis: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M21 12l-9 5-9-5V8l9 5 9-5v4z" fill="#DC382D" />
            <path d="M21 8l-9 5-9-5 9-5 9 5z" fill="#DC382D" />
            <path d="M12 18l9-5v4l-9 5-9-5v-4l9 5z" fill="#A41E11" />
        </svg>
    ),
    firebase: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M4.5 20L7.5 3l4 8-2.5 2.5 2.5 2.5-3.5 4h-3.5z" fill="#FFA000" />
            <path d="M19.5 20l-4-8 4-9-4 9 4 8z" fill="#F57C00" />
            <path d="M4.5 20l7.5-4.5 7.5 4.5H4.5z" fill="#FFCA28" />
        </svg>
    ),
    graphql: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="none" stroke="#E10098" strokeWidth="1" />
            <circle cx="12" cy="2" r="1.5" fill="#E10098" />
            <circle cx="3" cy="7" r="1.5" fill="#E10098" />
            <circle cx="21" cy="7" r="1.5" fill="#E10098" />
            <circle cx="3" cy="17" r="1.5" fill="#E10098" />
            <circle cx="21" cy="17" r="1.5" fill="#E10098" />
            <circle cx="12" cy="22" r="1.5" fill="#E10098" />
            <path d="M3 7l9 15M21 7l-9 15M3 17h18" stroke="#E10098" strokeWidth="1" />
        </svg>
    ),
    // Mobile
    'react native': (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(120 12 12)" />
        </svg>
    ),
    flutter: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M14 4l-10 10 3 3 13-13h-6z" fill="#42A5F5" />
            <path d="M14 12l-5 5 3 3 8-8h-6z" fill="#42A5F5" />
            <path d="M9 17l3-3 3 3-3 3-3-3z" fill="#0D47A1" />
        </svg>
    ),
    swift: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M21 5.5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-13z" fill="#FA7343" />
            <path d="M15.3 15.5c-3.1 1.7-7.2.5-9.5-2.8 2.8 2 6.2 2.5 8.7.8-2.6-1.5-5.8-4.8-7.5-8 3.5 3.5 7.5 5.5 10 6.5-1.8-2.5-3-6.5-2.2-10.5 3.3 5.5 3.3 10.5.5 14z" fill="#fff" />
        </svg>
    ),
    kotlin: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M3 21L12 12 21 21H3z" fill="#7F52FF" />
            <path d="M3 3h9L3 12V3z" fill="#7F52FF" />
            <path d="M12 3l9 9-9 9V3z" fill="#C711E1" />
        </svg>
    ),
    // Default
    default: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#6366F1" opacity="0.2" />
            <path d="M12 6v12M6 12h12" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
};

// Alias mappings for common variations
const SKILL_ALIASES = {
    'react.js': 'react',
    'reactjs': 'react',
    'node.js': 'nodejs',
    'node': 'nodejs',
    'js': 'javascript',
    'ts': 'typescript',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'angularjs': 'angular',
    'next.js': 'nextjs',
    'spring boot': 'spring',
    'springboot': 'spring',
    'express.js': 'express',
    'expressjs': 'express',
    'golang': 'go',
    'k8s': 'kubernetes',
    'amazon web services': 'aws',
    'github': 'git',
    'gitlab': 'git',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'pg': 'postgresql',
    'html5': 'html',
    'css3': 'css',
    'tailwindcss': 'tailwind',
    'tailwind css': 'tailwind',
    'reactnative': 'react native',
    'rn': 'react native',
    'swiftui': 'swift',
    'ios': 'swift',
    'android': 'kotlin',
};

/**
 * SkillIcon Component - Renders technology brand icons
 * @param {string} skill - Name of the skill/technology
 * @param {string} size - Size class (default: 'w-5 h-5')
 * @param {string} className - Additional CSS classes
 */
export default function SkillIcon({ skill, size = 'w-5 h-5', className = '' }) {
    const normalizedSkill = skill.toLowerCase().trim();

    // Check for custom icon mapping from localStorage first
    let customIconKey = null;
    try {
        const customIcons = JSON.parse(localStorage.getItem('customSkillIcons') || '{}');
        customIconKey = customIcons[normalizedSkill];
    } catch (e) {
        // Ignore localStorage errors
    }

    // Use custom icon if found, otherwise fall back to alias/default
    const iconKey = customIconKey || SKILL_ALIASES[normalizedSkill] || normalizedSkill;
    const icon = SKILL_ICONS[iconKey] || SKILL_ICONS.default;

    return (
        <span className={`inline-flex items-center justify-center ${size} ${className}`}>
            {icon}
        </span>
    );
}

// Export for use in skillsData
export { SKILL_ICONS, SKILL_ALIASES };
