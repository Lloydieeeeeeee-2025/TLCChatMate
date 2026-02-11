/*!
 * TLC ChatMate Widget v1.0.0
 * Embeddable floating chat widget for WordPress
 * https://tlcchatmate.online
 */

(function () {
    'use strict';

    const WIDGET_CONFIG = {
        iframeUrl: 'https://tlcchatmate.online/widget',
        buttonId: 'tlc-chatmate-button',
        containerId: 'tlc-chatmate-container',
        iframeId: 'tlc-chatmate-iframe',
        zIndex: 999999,
        width: 380,
        height: 600,
        borderRadius: 12,
        buttonSize: 56,
    };

    // Ensure DOM is ready
    function domReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Create and inject styles
    function injectStyles() {
        if (document.getElementById('tlc-chatmate-styles')) {
            return; // Already injected
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'tlc-chatmate-styles';
        styleElement.innerHTML = `
            /* TLC ChatMate Widget Styles */
            #${WIDGET_CONFIG.containerId} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: ${WIDGET_CONFIG.zIndex};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                direction: ltr;
            }

            /* Chat Button */
            #${WIDGET_CONFIG.buttonId} {
                position: relative;
                z-index: ${WIDGET_CONFIG.zIndex + 1};
                width: ${WIDGET_CONFIG.buttonSize}px;
                height: ${WIDGET_CONFIG.buttonSize}px;
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
                bottom: ${WIDGET_CONFIG.buttonSize + 30}px;
                right: 20px;
                width: ${WIDGET_CONFIG.width}px;
                height: ${WIDGET_CONFIG.height}px;
                border: none;
                border-radius: ${WIDGET_CONFIG.borderRadius}px;
                background: white;
                box-shadow: 0 5px 40px rgba(0, 0, 0, 0.15);
                z-index: ${WIDGET_CONFIG.zIndex};
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #${WIDGET_CONFIG.iframeId}.tlc-open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }

            /* Mobile Adjustments */
            @media (max-width: 480px) {
                #${WIDGET_CONFIG.containerId} {
                    bottom: 10px;
                    right: 10px;
                    right: 10px;
                }

                #${WIDGET_CONFIG.iframeId} {
                    width: calc(100% - 20px);
                    height: ${WIDGET_CONFIG.height}px;
                    right: 10px;
                    bottom: ${WIDGET_CONFIG.buttonSize + 20}px;
                    border-radius: 12px;
                }
            }

            /* Prevent scrolling on body when widget is open */
            body.tlc-widget-open {
                overflow: hidden;
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
        iframe.loading = 'lazy';

        // Add elements to container
        container.appendChild(button);
        container.appendChild(iframe);

        // Toggle functionality
        let isOpen = false;

        function toggleChat() {
            isOpen = !isOpen;

            if (isOpen) {
                button.classList.add('tlc-open');
                iframe.classList.add('tlc-open');
                document.body.style.overflow = 'hidden';
                // Give focus to iframe for better UX
                setTimeout(() => iframe.focus(), 300);
            } else {
                button.classList.remove('tlc-open');
                iframe.classList.remove('tlc-open');
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

        // Close when clicking outside
        document.addEventListener('click', function (event) {
            const isClickInside = container.contains(event.target);
            const isClickInIframe = event.target === iframe;

            if (!isClickInside && !isClickInIframe && isOpen) {
                // Only close if click is not on the container or iframe
                if (!event.target.closest(`#${WIDGET_CONFIG.containerId}`)) {
                    toggleChat();
                }
            }
        });

        // Animate button entrance
        setTimeout(() => {
            button.classList.add('tlc-initialized');
        }, 100);

        console.log('✓ TLC ChatMate Widget initialized');
    }

    // Initialize when DOM is ready
    domReady(initializeWidget);

    // Expose API for manual control (optional)
    window.TLCChatMate = {
        version: '1.0.0',
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