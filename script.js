document.addEventListener("DOMContentLoaded", () => {

    // sticky header behavior

    const header = document.getElementById("mainHeader");
    const firstFold = document.querySelector(".main-content") || document.querySelector(".product-detail-section");
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.querySelector(".nav-list");
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    const setNavState = (isOpen) => {
        if (!menuToggle || !navList) return;
        const isMobile = window.innerWidth <= 992;
        navList.classList.toggle("show", isOpen);
        navList.setAttribute("aria-hidden", !isMobile || isOpen ? "false" : "true");
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    if (menuToggle && navList) {
        setNavState(false);

        menuToggle.addEventListener("click", () => {
            const isOpen = navList.classList.contains("show");
            setNavState(!isOpen);
        });

        navList.addEventListener("click", (event) => {
            const target = event.target.closest("a, button");
            if (!target) return;
            if (window.innerWidth <= 992 && !target.classList.contains("dropdown-toggle")) {
                setNavState(false);
            }
        });

        document.addEventListener("click", (event) => {
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest(".nav") && !event.target.closest(".menu-toggle")) {
                setNavState(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 992) {
                setNavState(false);
            }
        });
    }

    if (dropdownToggles.length > 0) {
        const closeDropdowns = (except) => {
            dropdownToggles.forEach((toggle) => {
                const dropdown = toggle.closest(".dropdown");
                const menu = dropdown ? dropdown.querySelector(".dropdown-menu") : null;
                if (!dropdown || !menu) return;
                if (except && dropdown === except) return;
                menu.classList.remove("show");
                dropdown.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        };

        dropdownToggles.forEach((toggle) => {
            const dropdown = toggle.closest(".dropdown");
            const menu = dropdown ? dropdown.querySelector(".dropdown-menu") : null;
            if (!dropdown || !menu) return;

            toggle.addEventListener("click", (event) => {
                event.preventDefault();
                if (menu.children.length === 0) {
                    toggle.setAttribute("aria-expanded", "false");
                    return;
                }
                const isOpen = menu.classList.contains("show");
                closeDropdowns(dropdown);
                menu.classList.toggle("show", !isOpen);
                dropdown.classList.toggle("is-open", !isOpen);
                toggle.setAttribute("aria-expanded", (!isOpen).toString());
            });
        });

        document.addEventListener("click", (event) => {
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest(".dropdown")) {
                closeDropdowns();
            }
        });
    }

    if (header && firstFold) {
        const headerObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    header.classList.remove("sticky");
                } else {
                    header.classList.add("sticky");
                }
            },
            { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
        );

        headerObserver.observe(firstFold);
    }
    // product image carousel

    const mainProductImage = document.querySelector(".main-product-image");
    const thumbnailContainer = document.querySelector(".thumbnail-container");
    const thumbnails = thumbnailContainer ? Array.from(thumbnailContainer.querySelectorAll(".thumbnail")) : [];
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    const zoomPreview = document.querySelector(".thumbnail-zoom-preview");
    const zoomPreviewImage = zoomPreview ? document.createElement("img") : null;

    let currentIndex = 0;

    if (zoomPreviewImage) {
        zoomPreviewImage.className = "zoom-preview-image";
        zoomPreview.appendChild(zoomPreviewImage);
        if (mainProductImage) {
            zoomPreviewImage.src = mainProductImage.src;
        }
    }

    if (mainProductImage && thumbnails.length > 0) {

        function updateImage(index) {

            thumbnails.forEach(t => t.classList.remove("active"));

            thumbnails[index].classList.add("active");

            mainProductImage.src = thumbnails[index].src;
            if (zoomPreviewImage) {
                zoomPreviewImage.src = thumbnails[index].src;
            }

            currentIndex = index;
        }

        if (thumbnailContainer) {
            thumbnailContainer.addEventListener("click", (event) => {
                const clickedThumb = event.target.closest(".thumbnail");
                if (!clickedThumb) return;
                const index = thumbnails.indexOf(clickedThumb);
                if (index >= 0) {
                    updateImage(index);
                }
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener("click", () => {

                currentIndex = (currentIndex + 1) % thumbnails.length;

                updateImage(currentIndex);

            });
        }

        if (leftArrow) {
            leftArrow.addEventListener("click", () => {

                currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;

                updateImage(currentIndex);

            });
        }

    }


    // image zoom preview

    const mainImageContainer = document.querySelector(".main-image-container");
    const zoomScale = 2;
    let mainImageRect = null;
    let zoomRafId = null;
    let lastPointer = null;

    if (mainImageContainer && zoomPreview && mainProductImage && zoomPreviewImage) {
        const updateMainRect = () => {
            mainImageRect = mainImageContainer.getBoundingClientRect();
        };

        const setZoomVisible = (isVisible) => {
            zoomPreview.classList.toggle("is-visible", isVisible);
        };

        updateMainRect();

        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                updateMainRect();
            });

            resizeObserver.observe(mainImageContainer);
        } else {
            window.addEventListener("resize", updateMainRect);
        }

        const renderZoom = () => {
            zoomRafId = null;
            if (!lastPointer || !mainImageRect) return;

            const rawX = (lastPointer.x - mainImageRect.left) / mainImageRect.width;
            const rawY = (lastPointer.y - mainImageRect.top) / mainImageRect.height;
            const x = Math.min(1, Math.max(0, rawX));
            const y = Math.min(1, Math.max(0, rawY));

            const maxTranslateX = mainImageRect.width * (zoomScale - 1);
            const maxTranslateY = mainImageRect.height * (zoomScale - 1);
            const translateX = -x * maxTranslateX;
            const translateY = -y * maxTranslateY;

            zoomPreviewImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
            zoomPreview.style.left = `${mainImageRect.right + 20}px`;
            zoomPreview.style.top = `${mainImageRect.top}px`;
        };

        const scheduleZoom = () => {
            if (zoomRafId) return;
            zoomRafId = requestAnimationFrame(renderZoom);
        };

        mainImageContainer.addEventListener("mouseenter", () => {
            updateMainRect();
            setZoomVisible(true);
        });

        mainImageContainer.addEventListener("mousemove", (e) => {
            setZoomVisible(true);
            lastPointer = { x: e.clientX, y: e.clientY };
            scheduleZoom();
        });

        mainImageContainer.addEventListener("mouseleave", () => {
            setZoomVisible(false);
            lastPointer = null;
            if (zoomRafId) {
                cancelAnimationFrame(zoomRafId);
                zoomRafId = null;
            }
        });
    }

});

document.addEventListener("DOMContentLoaded", () => {
    const floatingBar = document.getElementById("floatingPriceBar");
    const header = document.getElementById("mainHeader");
    const heroSection = document.querySelector(".main-content");

    if (!floatingBar || !heroSection) return;

    const title = document.querySelector(".product-title");
    const price = document.querySelector(".price-box");
    const heroImage = document.querySelector(".main-product-image");
    const floatingTitle = floatingBar.querySelector(".floating-title");
    const floatingPrice = floatingBar.querySelector(".floating-price");
    const floatingImage = floatingBar.querySelector(".floating-thumb img");

    if (title && floatingTitle) floatingTitle.textContent = title.textContent.trim();
    if (price && floatingPrice) floatingPrice.textContent = price.textContent.trim();
    if (heroImage && floatingImage) floatingImage.src = heroImage.src;

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) {
                const headerHeight = header ? header.getBoundingClientRect().height : 0;
                floatingBar.style.position = "fixed";
                floatingBar.style.top = headerHeight + "px";
                floatingBar.style.left = "0";
                floatingBar.style.right = "0";
                floatingBar.style.zIndex = "1100";
                floatingBar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            } else {
                floatingBar.style.position = "relative";
                floatingBar.style.top = "";
                floatingBar.style.boxShadow = "";
            }
        },
        { threshold: 0 }
    );

    observer.observe(heroSection);

    window.addEventListener("resize", () => {
        if (floatingBar.style.position === "fixed" && header) {
            floatingBar.style.top = header.getBoundingClientRect().height + "px";
        }
    });
});

function handleCompanyLogos() {
    const companyLogos = document.querySelector('.company-logos');
    const logoImages = companyLogos ? companyLogos.querySelectorAll('img') : [];

    if (logoImages.length === 0) return;

    const screenWidth = window.innerWidth;

    // Hide all logos first
    logoImages.forEach(img => {
        img.style.display = 'none';
    });

    // Show appropriate number of logos based on screen width
    if (screenWidth >= 1240) {
        // Desktop: Show all 6 icons
        logoImages.forEach(img => {
            img.style.display = 'block';
        });
    } else if (screenWidth >= 1000) {
        // Tablet: Show 4-5 icons
        logoImages.forEach((img, index) => {
            img.style.display = index < 5 ? 'block' : 'none';
        });
    } else if (screenWidth >= 550) {
        // Mobile: Show 3 icons
        logoImages.forEach((img, index) => {
            img.style.display = index < 4 ? 'block' : 'none';
        });
    }
    else {
        // Mobile: Show 3 icons
        logoImages.forEach((img, index) => {
            img.style.display = index < 3 ? 'block' : 'none';
        });
    }

}

// initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    handleCompanyLogos();
});

// handle resize events
window.addEventListener('resize', () => {
    handleCompanyLogos();
});

// faq behavior

document.addEventListener("DOMContentLoaded", () => {
    // faq toggles
    const faqItems = document.querySelectorAll(".faq-item")

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question")
        const answer = item.querySelector(".faq-answer")

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active")

            // Close all FAQ items
            faqItems.forEach((faqItem) => {
                faqItem.classList.remove("active")
                faqItem.querySelector(".faq-question").setAttribute("aria-expanded", "false")
            })

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add("active")
                question.setAttribute("aria-expanded", "true")
            }
        })
    })

    // email catalogue
    const emailInput = document.querySelector(".email-input")
    const sendButton = document.querySelector(".send-catalogue-btn")

    if (sendButton && emailInput) {
        sendButton.addEventListener("click", () => {
            const email = emailInput.value.trim()

            if (!email) {
                alert("Please enter your email address")
                emailInput.focus()
                return
            }

            if (!isValidEmail(email)) {
                alert("Please enter a valid email address")
                emailInput.focus()
                return
            }

            // simulate sending the catalogue
            const originalText = sendButton.textContent
            sendButton.textContent = "SENDING..."
            sendButton.disabled = true

            setTimeout(() => {
                sendButton.textContent = "SENT ✓"
                setTimeout(() => {
                    sendButton.textContent = originalText
                    sendButton.disabled = false
                    emailInput.value = ""
                    alert("Catalogue sent successfully! Check your email.")
                }, 2000)
            }, 1500)
        })

        // allow enter to submit
        emailInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendButton.click()
            }
        })
    }

    // manufacturing tabs
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab")

            // reset active state
            tabButtons.forEach((btn) => btn.classList.remove("active"))
            tabContents.forEach((content) => content.classList.remove("active"))

            // activate the selected tab
            button.classList.add("active")
            const targetContent = document.getElementById(targetTab)
            if (targetContent) {
                targetContent.classList.add("active")
            }
        })
    })

    // reveal tab content on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    }

    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1"
                entry.target.style.transform = "translateY(0)"
            }
        })
    }, observerOptions)

    // observe tab content blocks
    tabContents.forEach((content) => {
        content.style.opacity = "0"
        content.style.transform = "translateY(20px)"
        content.style.transition = "opacity 0.6s ease, transform 0.6s ease"
        contentObserver.observe(content)
    })

    // helpers
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }
})

// modal behavior
document.addEventListener("DOMContentLoaded", () => {
    const modalConfigs = [
        {
            selectors: [".download-button"],
            modalId: "datasheetModal",
            focusSelector: "#datasheetEmail",
        },
        {
            selectors: [".quote-button", ".primary-button"],
            modalId: "quoteModal",
            focusSelector: "#quoteFullName",
        },
    ]

    const body = document.body
    let activeModal = null
    let lastFocusedElement = null

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const openModal = (modal, focusSelector) => {
        if (!modal) return
        modal.classList.add("is-open")
        modal.setAttribute("aria-hidden", "false")
        body.classList.add("modal-open")
        lastFocusedElement = document.activeElement
        activeModal = modal

        const focusTarget = focusSelector
            ? modal.querySelector(focusSelector)
            : modal.querySelector("input, button, select, textarea")

        if (focusTarget) {
            focusTarget.focus()
        }
    }

    const closeModal = (modal) => {
        if (!modal) return
        modal.classList.remove("is-open")
        modal.setAttribute("aria-hidden", "true")
        body.classList.remove("modal-open")
        activeModal = null

        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus()
        }
    }

    modalConfigs.forEach((config) => {
        const modal = document.getElementById(config.modalId)
        if (!modal) return

        config.selectors.forEach((selector) => {
            const triggers = document.querySelectorAll(selector)
            triggers.forEach((trigger) => {
                trigger.addEventListener("click", () => {
                    openModal(modal, config.focusSelector)
                })
            })
        })

        const closeControls = modal.querySelectorAll("[data-modal-close]")
        closeControls.forEach((control) => {
            control.addEventListener("click", () => closeModal(modal))
        })
    })

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && activeModal) {
            closeModal(activeModal)
        }
    })

    const datasheetModal = document.getElementById("datasheetModal")
    if (datasheetModal) {
        const emailInput = datasheetModal.querySelector("#datasheetEmail")
        const submitButton = datasheetModal.querySelector("button[type='submit']")
        const form = datasheetModal.querySelector("form")

        if (emailInput && submitButton) {
            const syncButtonState = () => {
                const emailValue = emailInput.value.trim()
                submitButton.disabled = !isValidEmail(emailValue)
            }

            emailInput.addEventListener("input", syncButtonState)
            syncButtonState()

            if (form) {
                form.addEventListener("submit", (event) => {
                    event.preventDefault()
                    const emailValue = emailInput.value.trim()

                    if (!isValidEmail(emailValue)) {
                        emailInput.focus()
                        return
                    }

                    const originalText = submitButton.textContent
                    submitButton.textContent = "Sending..."
                    submitButton.disabled = true

                    window.setTimeout(() => {
                        submitButton.textContent = originalText
                        form.reset()
                        closeModal(datasheetModal)
                        alert("Brochure sent successfully. Check your email.")
                    }, 1200)
                })
            }
        }
    }

    const quoteModal = document.getElementById("quoteModal")
    if (quoteModal) {
        const form = quoteModal.querySelector("form")

        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault()

                const requiredFields = form.querySelectorAll("input[required]")
                let allValid = true

                requiredFields.forEach((field) => {
                    if (!field.value.trim()) {
                        allValid = false
                    }
                })

                const emailField = form.querySelector("input[type='email']")
                if (emailField && !isValidEmail(emailField.value.trim())) {
                    allValid = false
                    emailField.focus()
                }

                if (!allValid) {
                    alert("Please complete the required fields.")
                    return
                }

                form.reset()
                closeModal(quoteModal)
                alert("Thanks for your request. Our team will call you back shortly.")
            })
        }
    }
})


// continuous carousels

document.addEventListener("DOMContentLoaded", () => {
    function setupContinuousCarousel(options) {
        const container = document.querySelector(options.containerSelector)
        if (!container) return

        const track = container.querySelector(options.trackSelector)
        if (!track) return

        const originalCards = Array.from(track.querySelectorAll(options.cardSelector))
        if (originalCards.length < 2) return

        originalCards.forEach((card) => {
            const clone = card.cloneNode(true)
            clone.classList.add("is-clone")
            clone.setAttribute("aria-hidden", "true")
            track.appendChild(clone)
        })

        let step = 0
        let resetPoint = 0

        const recalculateSizes = () => {
            const firstCard = track.querySelector(options.cardSelector)
            const computed = window.getComputedStyle(track)
            const gap = Number.parseFloat(computed.columnGap || computed.gap || "0") || 0

            step = firstCard ? firstCard.getBoundingClientRect().width + gap : 0
            const firstClone = track.querySelector(`${options.cardSelector}.is-clone`)
            resetPoint = firstClone ? firstClone.offsetLeft - track.offsetLeft : 0
        }

        const normalizeLoopPosition = () => {
            if (!resetPoint) return

            if (container.scrollLeft >= resetPoint) {
                container.scrollLeft -= resetPoint
            }

            if (container.scrollLeft < 0) {
                container.scrollLeft += resetPoint
            }
        }

        const moveNext = () => {
            if (!step) return
            container.scrollBy({ left: step, behavior: "smooth" })
        }

        const movePrev = () => {
            if (!step) return

            if (container.scrollLeft <= 1 && resetPoint) {
                container.scrollLeft += resetPoint
            }

            container.scrollBy({ left: -step, behavior: "smooth" })
        }

        let autoTimer = null
        let isPointerDown = false

        const stopAuto = () => {
            if (autoTimer) {
                clearInterval(autoTimer)
                autoTimer = null
            }
        }

        const startAuto = () => {
            stopAuto()
            autoTimer = window.setInterval(() => {
                if (!isPointerDown) {
                    moveNext()
                }
            }, options.interval || 2600)
        }

        const controlsRoot = container.closest(options.controlsScopeSelector || "body") || document
        const prevBtn = options.prevSelector ? controlsRoot.querySelector(options.prevSelector) : null
        const nextBtn = options.nextSelector ? controlsRoot.querySelector(options.nextSelector) : null

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                stopAuto()
                movePrev()
                startAuto()
            })
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                stopAuto()
                moveNext()
                startAuto()
            })
        }

        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                recalculateSizes()
                normalizeLoopPosition()
            })

            resizeObserver.observe(track)
        } else {
            window.addEventListener("resize", () => {
                recalculateSizes()
                normalizeLoopPosition()
            })
        }
        recalculateSizes()

        container.addEventListener("scroll", normalizeLoopPosition, { passive: true })
        container.addEventListener("mouseenter", stopAuto)
        container.addEventListener("mouseleave", startAuto)

        container.addEventListener("touchstart", () => {
            isPointerDown = true
            stopAuto()
        }, { passive: true })

        container.addEventListener("touchend", () => {
            isPointerDown = false
            startAuto()
        }, { passive: true })

        container.addEventListener("mousedown", () => {
            isPointerDown = true
            stopAuto()
        })

        window.addEventListener("mouseup", () => {
            if (!isPointerDown) return
            isPointerDown = false
            startAuto()
        })

        window.addEventListener("resize", normalizeLoopPosition)

        startAuto()
    }

    setupContinuousCarousel({
        containerSelector: ".applications-carousel",
        trackSelector: ".carousel-track",
        cardSelector: ".application-card",
        controlsScopeSelector: ".applications-section",
        prevSelector: ".prev-btn",
        nextSelector: ".next-btn",
        interval: 2600,
    })

    setupContinuousCarousel({
        containerSelector: ".testimonials-carousel",
        trackSelector: ".carousel-track",
        cardSelector: ".testimonial-card",
        interval: 3200,
    })

    // portfolio cta
    const learnMoreButtons = document.querySelectorAll(".learn-more-btn")

    learnMoreButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // placeholder action
            const cardTitle = button.closest(".portfolio-card").querySelector("h3").textContent
            alert(`You clicked "Learn More" for: ${cardTitle}`)
            console.log(`Learn More clicked for: ${cardTitle}`)
        })
    })

    // contact cta
    const talkToExpertBtn = document.querySelector(".talk-to-expert-btn")

    if (talkToExpertBtn) {
        talkToExpertBtn.addEventListener("click", () => {
            // placeholder action
            alert("Connecting you with an expert! Please wait...")
            console.log("Talk to an Expert button clicked.")
        })
    }

    // section animation triggers
    const sectionsToAnimate = document.querySelectorAll(
        ".testimonials-section .section-title, .testimonials-section .section-subtitle, .testimonial-card, " +
        ".portfolio-section .section-title, .portfolio-section .section-subtitle, .portfolio-card, " +
        ".cta-section .cta-box",
    )

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    }

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in-up")
                observer.unobserve(entry.target)
            }
        })
    }, observerOptions)

})


class ManufacturingCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 8;
        this.isAnimating = false;

        this.slides = [
            { title: 'Raw Material', step: 1 },
            { title: 'Extrusion', step: 2 },
            { title: 'Cooling', step: 3 },
            { title: 'Sizing', step: 4 },
            { title: 'Quality Control', step: 5 },
            { title: 'Marking', step: 6 },
            { title: 'Cutting', step: 7 },
            { title: 'Packaging', step: 8 }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.setupSwipeGestures();
        this.setupKeyboardNavigation();
    }

    bindEvents() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
    }

    setupSwipeGestures() {
        const container = document.querySelector('.carousel-content');
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            this.handleSwipe(startX, startY, endX, endY, endTime - startTime);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY, duration) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;

        // Only handle horizontal swipes that are fast enough
        if (Math.abs(deltaX) > Math.abs(deltaY) &&
            Math.abs(deltaX) > minSwipeDistance &&
            duration < maxSwipeTime) {

            if (deltaX > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
    }

    nextSlide() {
        if (this.isAnimating || this.currentSlide >= this.totalSlides - 1) return;

        this.goToSlide(this.currentSlide + 1, 'next');
    }

    previousSlide() {
        if (this.isAnimating || this.currentSlide <= 0) return;

        this.goToSlide(this.currentSlide - 1, 'prev');
    }

    goToSlide(index, direction = 'next') {
        if (this.isAnimating || index === this.currentSlide ||
            index < 0 || index >= this.totalSlides) return;

        this.isAnimating = true;
        this.animateSlide(this.currentSlide, index, direction);
        this.currentSlide = index;
        this.updateUI();

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    }

    animateSlide(fromIndex, toIndex, direction) {
        const slides = document.querySelectorAll('.slide');
        const currentSlide = slides[fromIndex];
        const nextSlide = slides[toIndex];

        // Prepare next slide
        nextSlide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
        nextSlide.style.opacity = '0';
        nextSlide.style.position = 'absolute';
        nextSlide.style.top = '0';
        nextSlide.style.left = '0';
        nextSlide.style.width = '100%';

        // Force reflow
        nextSlide.offsetHeight;

        // Start animation
        requestAnimationFrame(() => {
            // Animate current slide out
            currentSlide.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
            currentSlide.style.opacity = '0';

            // Animate next slide in
            nextSlide.style.transform = 'translateX(0)';
            nextSlide.style.opacity = '1';

            // Clean up after animation
            setTimeout(() => {
                // Reset all slides
                slides.forEach((slide, index) => {
                    slide.classList.remove('active');
                    if (index === toIndex) {
                        slide.classList.add('active');
                        slide.style.position = 'relative';
                        slide.style.transform = '';
                        slide.style.opacity = '';
                        slide.classList.add('fade-in');

                        // Remove fade-in class after animation
                        setTimeout(() => {
                            slide.classList.remove('fade-in');
                        }, 400);
                    } else {
                        slide.style.position = 'absolute';
                        slide.style.transform = 'translateX(100%)';
                        slide.style.opacity = '0';
                    }
                });
            }, 400);
        });
    }

    updateUI() {
        // Update step badge
        const stepBadge = document.getElementById('stepBadge');
        const currentSlideData = this.slides[this.currentSlide];
        stepBadge.textContent = `Step ${currentSlideData.step}/8: ${currentSlideData.title}`;

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.totalSlides - 1;

        // Add visual feedback for disabled state
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.style.opacity = '1';
        }

        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.style.opacity = '1';
        }
    }

    // Public method to go to specific slide (for external control)
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSlides) {
            const direction = stepNumber > this.currentSlide + 1 ? 'next' : 'prev';
            this.goToSlide(stepNumber - 1, direction);
        }
    }

    // Get current step info
    getCurrentStep() {
        return {
            step: this.currentSlide + 1,
            title: this.slides[this.currentSlide].title,
            total: this.totalSlides
        };
    }
}

// initialize manufacturing carousel
document.addEventListener('DOMContentLoaded', () => {
    window.manufacturingCarousel = new ManufacturingCarousel();
});

// stop animation when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.manufacturingCarousel) {
        window.manufacturingCarousel.isAnimating = false;
    }
});

// prevent long-press context menu on carousel
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.carousel-card')) {
        e.preventDefault();
    }
});
