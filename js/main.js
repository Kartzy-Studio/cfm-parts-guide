/**
 * Cute Flexi Maker — Parts Guide
 * Small, dependency-free progressive enhancements:
 *   - Active section highlight in the header nav
 *   - Show/hide back-to-top button on scroll
 *   - Click-to-zoom for page figures
 */

(function () {
    "use strict";

    /* ----------- Tiny helpers ----------- */

    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $$(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }


    /* ----------- Active nav highlight ----------- */

    function setupActiveNavHighlight() {
        var navLinks = $$(".site-header__nav a[href^='#']");
        if (!navLinks.length || !("IntersectionObserver" in window)) {
            return;
        }

        var linkById = navLinks.reduce(function (map, link) {
            var id = link.getAttribute("href").slice(1);
            if (id) {
                map[id] = link;
            }
            return map;
        }, {});

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = linkById[entry.target.id];
                if (!link) {
                    return;
                }
                if (entry.isIntersecting) {
                    Object.values(linkById).forEach(function (l) {
                        l.classList.remove("is-active");
                    });
                    link.classList.add("is-active");
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });

        Object.keys(linkById).forEach(function (id) {
            var target = document.getElementById(id);
            if (target) {
                observer.observe(target);
            }
        });
    }


    /* ----------- Back-to-top button ----------- */

    function setupBackToTop() {
        var button = $(".back-to-top");
        if (!button) {
            return;
        }

        var showAfter = 600;

        function updateVisibility() {
            if (window.scrollY > showAfter) {
                button.hidden = false;
            } else {
                button.hidden = true;
            }
        }

        window.addEventListener("scroll", updateVisibility, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        updateVisibility();
    }


    /* ----------- Click-to-zoom for figures ----------- */

    var ZOOM_SELECTOR = [
        ".parts-grid img",
        ".composite-figure img",
        ".text-layout__figure img",
        ".symbols-layout__preview img"
    ].join(", ");

    function setupImageZoom() {
        var modal = createZoomModal();
        document.body.appendChild(modal.root);

        $$(ZOOM_SELECTOR).forEach(function (img) {
            makeZoomable(img, modal);
        });
    }

    function makeZoomable(img, modal) {
        img.style.cursor = "zoom-in";
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");

        img.addEventListener("click", function () {
            modal.open(img);
        });
        img.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                modal.open(img);
            }
        });
    }

    function captionFor(img) {
        var figure = img.closest("figure");
        if (figure) {
            var cap = figure.querySelector("figcaption");
            if (cap && cap.textContent.trim()) {
                return cap.textContent.trim();
            }
        }
        return img.alt || "";
    }

    function createZoomModal() {
        var root = document.createElement("div");
        root.className = "zoom-modal";
        root.setAttribute("hidden", "");
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("aria-labelledby", "zoom-modal-caption");

        var inner = document.createElement("div");
        inner.className = "zoom-modal__inner";
        root.appendChild(inner);

        var img = document.createElement("img");
        img.className = "zoom-modal__image";
        img.alt = "";
        inner.appendChild(img);

        var caption = document.createElement("p");
        caption.id = "zoom-modal-caption";
        caption.className = "zoom-modal__caption";
        inner.appendChild(caption);

        var closeBtn = document.createElement("button");
        closeBtn.className = "zoom-modal__close";
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "Close zoomed image");
        closeBtn.textContent = "×";
        root.appendChild(closeBtn);

        function open(sourceImg) {
            img.src = sourceImg.src;
            img.alt = sourceImg.alt || "";
            var label = captionFor(sourceImg);
            caption.textContent = label;
            caption.hidden = !label;
            root.hidden = false;
            document.body.style.overflow = "hidden";
            closeBtn.focus();
        }

        function close() {
            root.hidden = true;
            img.src = "";
            document.body.style.overflow = "";
        }

        root.addEventListener("click", function (event) {
            // close on backdrop or close button — never on the image itself
            if (event.target === root || event.target === closeBtn) {
                close();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !root.hidden) {
                close();
            }
        });

        injectZoomModalStyles();

        return { root: root, open: open, close: close };
    }

    function injectZoomModalStyles() {
        if (document.getElementById("zoom-modal-styles")) {
            return;
        }
        var style = document.createElement("style");
        style.id = "zoom-modal-styles";
        style.textContent = [
            ".zoom-modal {",
            "  position: fixed; inset: 0;",
            "  background: rgba(20, 14, 6, 0.86);",
            "  backdrop-filter: blur(4px);",
            "  -webkit-backdrop-filter: blur(4px);",
            "  z-index: 200;",
            "  display: flex; align-items: center; justify-content: center;",
            "  padding: 24px;",
            "  cursor: zoom-out;",
            "  animation: zoomFadeIn 0.18s ease-out;",
            "}",
            ".zoom-modal[hidden] { display: none; }",
            "@keyframes zoomFadeIn {",
            "  from { opacity: 0; }",
            "  to { opacity: 1; }",
            "}",
            ".zoom-modal__inner {",
            "  display: flex; flex-direction: column; align-items: center;",
            "  gap: 16px; cursor: default;",
            "  max-width: 100%;",
            "}",
            ".zoom-modal__image {",
            "  max-width: min(90vw, 720px);",
            "  max-height: 80vh;",
            "  width: auto; height: auto;",
            "  border-radius: 16px;",
            "  box-shadow: 0 20px 60px rgba(0,0,0,0.5);",
            "  background: rgba(245, 236, 220, 0.04);",
            "  animation: zoomImageIn 0.22s ease-out;",
            "}",
            "@keyframes zoomImageIn {",
            "  from { transform: scale(0.92); opacity: 0; }",
            "  to { transform: scale(1); opacity: 1; }",
            "}",
            ".zoom-modal__caption {",
            "  margin: 0;",
            "  color: #f5ecdc;",
            "  font-family: var(--font-display, system-ui), sans-serif;",
            "  font-size: 1.1rem;",
            "  letter-spacing: 1px;",
            "  text-transform: uppercase;",
            "  text-align: center;",
            "}",
            ".zoom-modal__caption[hidden] { display: none; }",
            ".zoom-modal__close {",
            "  position: absolute; top: 16px; right: 20px;",
            "  width: 44px; height: 44px;",
            "  border-radius: 999px; border: none;",
            "  background: rgba(255,255,255,0.9); color: #2a2118;",
            "  font-size: 1.6rem; line-height: 1; cursor: pointer;",
            "  display: flex; align-items: center; justify-content: center;",
            "}",
            ".zoom-modal__close:hover { background: #fff; }",
            "@media (max-width: 600px) {",
            "  .zoom-modal__image { max-width: 92vw; max-height: 70vh; }",
            "}"
        ].join("\n");
        document.head.appendChild(style);
    }


    /* ----------- Init ----------- */

    function init() {
        setupActiveNavHighlight();
        setupBackToTop();
        setupImageZoom();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());
