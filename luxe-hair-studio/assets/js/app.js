/**
 * Luxe Hair Studio - Main Application JavaScript
 * 
 * This file reads window.__LUXE_CONFIG__ and initializes
 * all frontend functionality for the salon website.
 */

(function($) {
    'use strict';
    
    // Configuration from WordPress (via wp_localize_script)
    var LuxeConfig = window.__LUXE_CONFIG__ || {};
    var config = LuxeConfig.config || {};
    
    // Expose config globally for other scripts
    window.LuxeData = config;
    
    console.log('Luxe Hair Studio initialized', config);
    
    /**
     * Initialize all modules when DOM is ready
     */
    $(document).ready(function() {
        initNavigation();
        initHeroStages();
        initServices();
        initStylists();
        initPackages();
        initGallery();
        initTestimonials();
        initProducts();
        initBooking();
        initMirror();
        initQuiz();
        initMarquee();
        initStats();
        initConcierge();
    });
    
    /**
     * Navigation - Smooth scroll and active states
     */
    function initNavigation() {
        var navLinks = $('.nav-link, .dock-link');
        
        navLinks.on('click', function(e) {
            var targetId = $(this).data('target') || $(this).attr('href');
            
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                var $target = $(targetId);
                
                if ($target.length) {
                    $('html, body').animate({
                        scrollTop: $target.offset().top - 80
                    }, 800);
                    
                    // Update active state
                    navLinks.removeClass('active');
                    $(this).addClass('active');
                }
            }
        });
        
        // Highlight active section on scroll
        $(window).on('scroll', function() {
            var scrollPos = $(window).scrollTop() + 100;
            
            $('section[id]').each(function() {
                var sectionTop = $(this).offset().top;
                var sectionBottom = sectionTop + $(this).outerHeight();
                var sectionId = $(this).attr('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    navLinks.removeClass('active');
                    $('[data-target="#' + sectionId + '"], [href="#' + sectionId + '"]').addClass('active');
                }
            });
        });
    }
    
    /**
     * Hero Stages - Reveal animation
     */
    function initHeroStages() {
        var stages = config.stages || [];
        var $hero = $('.hero-section');
        var currentStage = 0;
        
        if (stages.length === 0) return;
        
        function showStage(index) {
            var stage = stages[index];
            
            $hero.find('.hero-kicker').text(stage.kicker || '');
            $hero.find('.hero-line1').text(stage.line1 || '');
            $hero.find('.hero-line2').text(stage.line2 || '');
            $hero.find('.hero-sub').text(stage.sub || '');
            
            if (stage.image) {
                $hero.find('.hero-image').css('background-image', 'url(' + stage.image + ')');
            }
            
            if (stage.accent) {
                $hero.css('--accent-color', stage.accent);
            }
        }
        
        // Auto-rotate stages every 5 seconds
        if (stages.length > 1) {
            setInterval(function() {
                currentStage = (currentStage + 1) % stages.length;
                showStage(currentStage);
            }, 5000);
        }
        
        // Show initial stage
        showStage(0);
    }
    
    /**
     * Services - Category tabs and expandable items
     */
    function initServices() {
        var services = config.services || [];
        var $container = $('.services-container');
        
        if (services.length === 0) return;
        
        services.forEach(function(category) {
            var $category = $('<div class="service-category"></div>');
            var $title = $('<h3 class="service-category-title">' + (category.category || '') + '</h3>');
            var $items = $('<ul class="service-items"></ul>');
            
            if (category.items && category.items.length > 0) {
                category.items.forEach(function(item) {
                    var $item = $('<li class="service-item">' +
                        '<div class="service-name">' + (item.name || '') + '</div>' +
                        '<div class="service-meta">' +
                            '<span class="service-duration">' + (item.duration || '') + '</span>' +
                            '<span class="service-price">' + (item.price || '') + '</span>' +
                        '</div>' +
                    '</li>');
                    $items.append($item);
                });
            }
            
            $category.append($title).append($items);
            $container.append($category);
        });
    }
    
    /**
     * Stylists - Team grid with hover effects
     */
    function initStylists() {
        var stylists = config.stylists || [];
        var $container = $('.stylists-grid');
        
        if (stylists.length === 0) return;
        
        stylists.forEach(function(stylist) {
            var $card = $('<div class="stylist-card">' +
                '<div class="stylist-image" style="background-image: url(' + (stylist.image || '') + ')"></div>' +
                '<div class="stylist-info">' +
                    '<h3 class="stylist-name">' + (stylist.name || '') + '</h3>' +
                    '<p class="stylist-role">' + (stylist.role || '') + '</p>' +
                    '<p class="stylist-specialty">' + (stylist.specialty || '') + '</p>' +
                    '<p class="stylist-traits">' + (stylist.traits || '') + '</p>' +
                    '<blockquote class="stylist-quote">"' + (stylist.quote || '') + '"</blockquote>' +
                '</div>' +
            '</div>');
            
            $container.append($card);
        });
    }
    
    /**
     * Packages - Feature cards
     */
    function initPackages() {
        var packages = config.packages || [];
        var $container = $('.packages-grid');
        
        if (packages.length === 0) return;
        
        packages.forEach(function(pkg) {
            var $card = $('<div class="package-card">' +
                '<div class="package-tag">' + (pkg.tag || '') + '</div>' +
                '<h3 class="package-name">' + (pkg.name || '') + '</h3>' +
                '<p class="package-description">' + (pkg.description || '') + '</p>' +
                '<div class="package-duration">' + (pkg.duration || '') + '</div>' +
                '<div class="package-price">' + (pkg.price || '') + '</div>' +
                '<button class="package-book-btn">Book Now</button>' +
            '</div>');
            
            $container.append($card);
        });
    }
    
    /**
     * Gallery - Before/after slider
     */
    function initGallery() {
        var gallery = config.gallery || [];
        var $container = $('.gallery-grid');
        
        if (gallery.length === 0) return;
        
        gallery.forEach(function(item) {
            var $card = $('<div class="gallery-item">' +
                '<div class="gallery-before" style="background-image: url(' + (item.before || '') + ')"></div>' +
                '<div class="gallery-after" style="background-image: url(' + (item.after || '') + ')"></div>' +
                '<div class="gallery-overlay">' +
                    '<blockquote class="gallery-quote">"' + (item.quote || '') + '"</blockquote>' +
                '</div>' +
            '</div>');
            
            $container.append($card);
        });
    }
    
    /**
     * Testimonials - Carousel
     */
    function initTestimonials() {
        var testimonials = config.testimonials || [];
        var $container = $('.testimonials-container');
        
        if (testimonials.length === 0) return;
        
        testimonials.forEach(function(testimonial) {
            var stars = '';
            for (var i = 0; i < (testimonial.rating || 5); i++) {
                stars += '★';
            }
            
            var $card = $('<div class="testimonial-card">' +
                '<div class="testimonial-stars">' + stars + '</div>' +
                '<blockquote class="testimonial-text">"' + (testimonial.quote || testimonial.text || '') + '"</blockquote>' +
                '<div class="testimonial-author">' +
                    '<strong class="author-name">' + (testimonial.client || testimonial.name || '') + '</strong>' +
                    '<span class="author-service">' + (testimonial.service || '') + '</span>' +
                '</div>' +
            '</div>');
            
            $container.append($card);
        });
    }
    
    /**
     * Products - Apothecary grid
     */
    function initProducts() {
        var products = config.products || [];
        var $container = $('.products-grid');
        
        if (products.length === 0) return;
        
        products.forEach(function(product) {
            var $card = $('<div class="product-card">' +
                '<div class="product-image" style="background-image: url(' + (product.image || '') + ')"></div>' +
                '<h3 class="product-name">' + (product.name || '') + '</h3>' +
                '<p class="product-description">' + (product.description || '') + '</p>' +
                '<div class="product-price">' + (product.price || '') + '</div>' +
                '<button class="product-add-btn">Add to Cart</button>' +
            '</div>');
            
            $container.append($card);
        });
    }
    
    /**
     * Booking - Multi-step form
     */
    function initBooking() {
        var labels = config.labels || {};
        var bookingSteps = labels.bookingSteps || {
            step1: 'Select Service',
            step2: 'Choose Stylist',
            step3: 'Pick Date',
            step4: 'Confirm'
        };
        
        var $form = $('.booking-form');
        var currentStep = 1;
        var totalSteps = 4;
        
        function updateStep(step) {
            $form.find('.booking-step').removeClass('active');
            $form.find('.step-' + step).addClass('active');
            
            $form.find('.progress-indicator').text(step + ' / ' + totalSteps);
        }
        
        $form.find('.next-step').on('click', function() {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStep(currentStep);
            }
        });
        
        $form.find('.prev-step').on('click', function() {
            if (currentStep > 1) {
                currentStep--;
                updateStep(currentStep);
            }
        });
        
        // Initialize first step
        updateStep(1);
    }
    
    /**
     * Mirror - Virtual try-on
     */
    function initMirror() {
        var mirrorConfig = config.mirror || {};
        var models = mirrorConfig.models || [];
        var shades = mirrorConfig.shades || [];
        
        var $mirrorCanvas = $('.mirror-canvas');
        var $modelSelector = $('.mirror-models');
        var $shadeSelector = $('.mirror-shades');
        
        if (models.length === 0 || shades.length === 0) return;
        
        // Populate models
        models.forEach(function(model, index) {
            var $btn = $('<button class="model-btn">' +
                '<img src="' + (model.image || '') + '" alt="' + (model.name || '') + '">' +
                '<span>' + (model.name || '') + '</span>' +
            '</button>');
            
            $btn.on('click', function() {
                $modelSelector.find('.model-btn').removeClass('active');
                $(this).addClass('active');
                $mirrorCanvas.css('background-image', 'url(' + model.image + ')');
            });
            
            $modelSelector.append($btn);
        });
        
        // Populate shades
        shades.forEach(function(shade) {
            var hsl = shade.hsl || { h: 0, s: 0, l: 0 };
            var color = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
            
            var $btn = $('<button class="shade-btn" style="background-color: ' + color + '">' +
                '<span>' + (shade.name || '') + '</span>' +
            '</button>');
            
            $btn.on('click', function() {
                $shadeSelector.find('.shade-btn').removeClass('active');
                $(this).addClass('active');
                
                // Apply shade overlay to canvas
                $mirrorCanvas.find('.shade-overlay').css('background-color', color);
            });
            
            $shadeSelector.append($btn);
        });
        
        // Select first model by default
        if (models.length > 0) {
            $modelSelector.find('.model-btn:first').trigger('click');
        }
    }
    
    /**
     * Quiz - Stylist matcher
     */
    function initQuiz() {
        var questions = config.quizQuestions || [];
        var $quizContainer = $('.quiz-container');
        
        if (questions.length === 0) return;
        
        var answers = {};
        var currentQuestion = 0;
        
        function showQuestion(index) {
            if (index >= questions.length) {
                showResults();
                return;
            }
            
            var q = questions[index];
            var $qContainer = $('<div class="quiz-question">' +
                '<h3>' + (q.question || '') + '</h3>' +
                '<div class="quiz-options"></div>' +
            '</div>');
            
            var $options = $qContainer.find('.quiz-options');
            
            if (q.options && q.options.length > 0) {
                q.options.forEach(function(option) {
                    var $btn = $('<button class="quiz-option">' + (option.value || '') + '</button>');
                    
                    $btn.on('click', function() {
                        answers[q.id || index] = option.value;
                        currentQuestion++;
                        showQuestion(currentQuestion);
                    });
                    
                    $options.append($btn);
                });
            }
            
            $quizContainer.empty().append($qContainer);
        }
        
        function showResults() {
            // Simple matching logic
            var matches = {};
            
            Object.keys(answers).forEach(function(qId) {
                var answer = answers[qId];
                var question = questions[qId];
                
                if (question && question.options) {
                    var option = question.options.find(function(o) { return o.value === answer; });
                    
                    if (option && option.matches) {
                        Object.keys(option.matches).forEach(function(stylist) {
                            matches[stylist] = (matches[stylist] || 0) + option.matches[stylist];
                        });
                    }
                }
            });
            
            // Find best match
            var bestMatch = Object.keys(matches).reduce(function(a, b) {
                return matches[a] > matches[b] ? a : b;
            }, '');
            
            var resultText = bestMatch ? 
                'Your perfect stylist: ' + bestMatch :
                'Any of our stylists would be a great fit!';
            
            $quizContainer.html('<div class="quiz-result"><h3>' + resultText + '</h3></div>');
        }
        
        // Start quiz
        showQuestion(0);
    }
    
    /**
     * Marquee - Scrolling words
     */
    function initMarquee() {
        var words = config.marqueeWords || [];
        var $marquee = $('.marquee-content');
        
        if (words.length === 0) return;
        
        // Duplicate words for seamless loop
        var allWords = words.concat(words).concat(words);
        
        allWords.forEach(function(word) {
            var $span = $('<span class="marquee-word">' + word + '</span>');
            $marquee.append($span);
        });
    }
    
    /**
     * Stats - Counter animation
     */
    function initStats() {
        var stats = config.stats || [];
        var $statsContainer = $('.stats-container');
        
        if (stats.length === 0) return;
        
        stats.forEach(function(stat) {
            var $stat = $('<div class="stat-item">' +
                '<div class="stat-value" data-target="' + (stat.value || '0') + '">0</div>' +
                '<div class="stat-label">' + (stat.label || '') + '</div>' +
            '</div>');
            
            $statsContainer.append($stat);
        });
        
        // Animate counters when in view
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var $value = $(entry.target).find('.stat-value');
                    var target = $value.data('target');
                    
                    // Simple counter animation
                    var current = 0;
                    var increment = parseInt(target) / 50;
                    var timer = setInterval(function() {
                        current += increment;
                        if (current >= target) {
                            $value.text(target);
                            clearInterval(timer);
                        } else {
                            $value.text(Math.floor(current));
                        }
                    }, 30);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        $statsContainer.find('.stat-item').each(function() {
            observer.observe(this);
        });
    }
    
    /**
     * Concierge - Chat widget
     */
    function initConcierge() {
        var concierge = config.concierge || {};
        var labels = config.labels || {};
        var conciergeLabels = labels.concierge || {};
        
        var name = concierge.name || 'Vivienne';
        var greeting = conciergeLabels.greeting || 'Hello! How may we assist you today?';
        
        var $chatToggle = $('.concierge-toggle');
        var $chatWindow = $('.concierge-window');
        var $chatMessages = $('.concierge-messages');
        var $chatInput = $('.concierge-input');
        
        // Initial greeting
        if ($chatMessages.length > 0) {
            $chatMessages.append('<div class="message bot">' + greeting + '</div>');
        }
        
        // Toggle chat window
        $chatToggle.on('click', function() {
            $chatWindow.toggleClass('open');
        });
        
        // Handle user messages
        $chatInput.on('keypress', function(e) {
            if (e.which === 13) {
                var message = $(this).val().trim();
                
                if (message) {
                    $chatMessages.append('<div class="message user">' + message + '</div>');
                    $(this).val('');
                    
                    // Scroll to bottom
                    $chatMessages.scrollTop($chatMessages[0].scrollHeight);
                    
                    // Simulate bot response
                    setTimeout(function() {
                        var responses = [
                            'Thank you for your message. Our team will respond shortly.',
                            'You can book an appointment directly through our booking system.',
                            'Our services include cuts, colour, treatments, and bridal styling.',
                            'Would you like to speak with a specific stylist?'
                        ];
                        var randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        $chatMessages.append('<div class="message bot">' + randomResponse + '</div>');
                        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
                    }, 1000);
                }
            }
        });
    }
    
})(jQuery);
