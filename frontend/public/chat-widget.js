/*!
TLC ChatMate Widget v2.1.2 (FIXED)
Embeddable floating chat widget for WordPress
production https://tlcchatmate.online
local http://localhost:3000/student/faqs
*/
(function () {
    'use strict';
    const WIDGET_CONFIG = {
        iframeUrl: 'https://tlcchatmate.online/student/faqs',
        buttonId: 'tlc-chatmate-button',
        containerId: 'tlc-chatmate-container',
        iframeId: 'tlc-chatmate-iframe',
        zIndex: 999999,
        width: 380,
        height: 600,
        borderRadius: 12,
        buttonSize: 56,
        mobileBreakpoint: 768,
    };

    // Ensure DOM is ready
    function domReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Get responsive button size
    function getResponsiveButtonSize() {
        if (window.innerWidth < 480) {
            return 48;
        }
        return WIDGET_CONFIG.buttonSize;
    }

    // Ensure viewport meta tag is properly set
    function ensureViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.insertBefore(viewport, document.head.firstChild);
            console.log('✓ Added viewport meta tag');
        }
    }

    // Create and inject styles
    function injectStyles() {
        if (document.getElementById('tlc-chatmate-styles')) {
            return;
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'tlc-chatmate-styles';
        styleElement.innerHTML = `
        /* TLC ChatMate Widget Styles v2.1.2 */
        #${WIDGET_CONFIG.containerId} {
            position: fixed;
            bottom: 0;
            right: 0;
            top: 0;
            left: 0;
            z-index: ${WIDGET_CONFIG.zIndex};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            direction: ltr;
            pointer-events: none;
        }

        /* Chat Button - Fixed positioning for mobile and desktop */
        #${WIDGET_CONFIG.buttonId} {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: ${WIDGET_CONFIG.zIndex + 1};
            width: ${getResponsiveButtonSize()}px;
            height: ${getResponsiveButtonSize()}px;
            border-radius: 50%;
            background: linear-gradient(135deg, #205781 0%, #2a6ba0 100%);
            border: none;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(32, 87, 129, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0;
            pointer-events: auto;
        }

        #${WIDGET_CONFIG.buttonId}:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 16px rgba(32, 87, 129, 0.4);
        }

        #${WIDGET_CONFIG.buttonId}:active {
            transform: scale(0.95);
        }

        #${WIDGET_CONFIG.buttonId} svg {
            width: 24px;
            height: 24px;
            stroke: currentColor;
            fill: none;
        }

        #${WIDGET_CONFIG.buttonId}.tlc-open {
            opacity: 0;
            visibility: hidden;
            transform: scale(0.8);
            transition: all 0.2s ease-out;
        }

        /* iframe Container */
        #${WIDGET_CONFIG.iframeId} {
            position: fixed;
            width: ${WIDGET_CONFIG.width}px;
            height: ${WIDGET_CONFIG.height}px;
            bottom: ${WIDGET_CONFIG.buttonSize + 30}px;
            right: 20px;
            border: none;
            border-radius: ${WIDGET_CONFIG.borderRadius}px;
            background: white;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.15);
            z-index: ${WIDGET_CONFIG.zIndex};
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            pointer-events: none;
        }

        #${WIDGET_CONFIG.iframeId}.tlc-open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        /* ========== MOBILE FULL-SCREEN MODE ========== */
        @media (max-width: ${WIDGET_CONFIG.mobileBreakpoint - 1}px) {
            #${WIDGET_CONFIG.containerId} {
                bottom: 0;
                right: 0;
                top: 0;
                left: 0;
                z-index: ${WIDGET_CONFIG.zIndex};
            }

            #${WIDGET_CONFIG.buttonId} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${getResponsiveButtonSize()}px;
                height: ${getResponsiveButtonSize()}px;
                z-index: ${WIDGET_CONFIG.zIndex + 1};
            }

            #${WIDGET_CONFIG.iframeId} {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                border-radius: 0 !important;
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }

            #${WIDGET_CONFIG.iframeId}.tlc-open {
                opacity: 1 !important;
                visibility: visible !important;
                transform: none !important;
            }

            /* Hide button on mobile when chat is open */
            #${WIDGET_CONFIG.buttonId}.tlc-open {
                display: none;
            }
        }

        /* Body lock for mobile */
        body.tlc-mobile-open {
            overflow: hidden !important;
            height: 100vh;
            position: fixed;
            width: 100%;
            top: 0;
            left: 0;
        }

        /* Animation for smooth appearance */
        @keyframes tlc-fade-in {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes tlc-slide-up {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #${WIDGET_CONFIG.buttonId}.tlc-initialized {
            animation: tlc-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        #${WIDGET_CONFIG.iframeId}.tlc-initialized {
            animation: tlc-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
    `;

        document.head.appendChild(styleElement);
    }

    // Create SVG icon for chat button
    function createChatIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');

        svg.appendChild(path1);
        return svg;
    }

    // Initialize widget
    function initializeWidget() {
        // Ensure viewport is properly configured
        ensureViewportMeta();

        // Inject styles
        injectStyles();

        // Create container
        let container = document.getElementById(WIDGET_CONFIG.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = WIDGET_CONFIG.containerId;
            document.body.appendChild(container);
        }

        // Create button
        const button = document.createElement('button');
        button.id = WIDGET_CONFIG.buttonId;
        button.setAttribute('aria-label', 'Open chat');
        button.setAttribute('type', 'button');
        button.appendChild(createChatIcon());

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = WIDGET_CONFIG.iframeId;
        iframe.src = WIDGET_CONFIG.iframeUrl;
        iframe.setAttribute('allow', 'geolocation; camera; microphone');
        iframe.setAttribute('title', 'TLC ChatMate');
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals');
        iframe.loading = 'lazy';

        // Add elements to container
        container.appendChild(button);
        container.appendChild(iframe);

        // Toggle functionality
        let isOpen = false;
        const isMobile = () => window.innerWidth < WIDGET_CONFIG.mobileBreakpoint;

        function toggleChat() {
            isOpen = !isOpen;

            if (isOpen) {
                button.classList.add('tlc-open');
                iframe.classList.add('tlc-open');

                if (isMobile()) {
                    document.body.classList.add('tlc-mobile-open');
                } else {
                    document.body.style.overflow = 'hidden';
                }

                // Give focus to iframe for better UX
                setTimeout(() => {
                    try {
                        iframe.focus();
                    } catch (e) {
                        console.warn('Could not focus iframe:', e);
                    }
                }, 300);
            } else {
                button.classList.remove('tlc-open');
                iframe.classList.remove('tlc-open');
                document.body.classList.remove('tlc-mobile-open');
                document.body.style.overflow = '';
            }
        }

        // Button click handler
        button.addEventListener('click', toggleChat);

        // Close on ESC key
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen) {
                toggleChat();
            }
        });

        // Close when clicking outside (desktop only)
        document.addEventListener('click', function (event) {
            if (isMobile()) return;

            const isClickInside = container.contains(event.target);
            const isClickInIframe = event.target === iframe;

            if (!isClickInside && !isClickInIframe && isOpen) {
                if (!event.target.closest(`#${WIDGET_CONFIG.containerId}`)) {
                    toggleChat();
                }
            }
        });

        // Handle window resize for button size and mobile detection
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newSize = getResponsiveButtonSize();
                button.style.width = newSize + 'px';
                button.style.height = newSize + 'px';

                // If resizing from mobile to desktop or vice versa, close the chat
                const wasOpenAndShouldBeClosed = isOpen && isMobile();
                if (wasOpenAndShouldBeClosed) {
                    toggleChat();
                }
            }, 250);
        });

        // Animate button entrance
        setTimeout(() => {
            button.classList.add('tlc-initialized');
        }, 100);

        // Listen for close request from iframe (with origin check)
        window.addEventListener('message', function (event) {
            // Only respond to tlc-close message
            if (event.data === 'tlc-close' && isOpen) {
                toggleChat();
            }
        });

        console.log('✓ TLC ChatMate Widget initialized v2.1.2');
    }

    // Initialize when DOM is ready
    domReady(initializeWidget);

    // Expose API for manual control
    window.TLCChatMate = {
        version: '2.1.2',
        config: WIDGET_CONFIG,
        open: function () {
            const button = document.getElementById(WIDGET_CONFIG.buttonId);
            if (button && !button.classList.contains('tlc-open')) {
                button.click();
            }
        },
        close: function () {
            const button = document.getElementById(WIDGET_CONFIG.buttonId);
            if (button && button.classList.contains('tlc-open')) {
                button.click();
            }
        },
        toggle: function () {
            const button = document.getElementById(WIDGET_CONFIG.buttonId);
            if (button) {
                button.click();
            }
        }
    };
})();