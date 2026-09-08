/**
 * Luxe Hair Studio - Mirror Module (Virtual Try-On)
 * 
 * Advanced hair color simulation using the mirror config
 */

(function($) {
    'use strict';
    
    var MirrorConfig = window.__LUXE_CONFIG__ ? window.__LUXE_CONFIG__.config.mirror : {};
    var engine = MirrorConfig.engine || { tolerance: 38, protectSkin: true, warmth: 40, shine: 45 };
    
    console.log('Mirror module initialized', engine);
    
    $(document).ready(function() {
        initMirrorCanvas();
        initColorPicker();
        initComparisonSlider();
    });
    
    function initMirrorCanvas() {
        var models = MirrorConfig.models || [];
        
        if (models.length === 0) return;
        
        // Set initial model
        var firstModel = models[0];
        $('.mirror-canvas').css('background-image', 'url(' + firstModel.image + ')');
    }
    
    function initColorPicker() {
        var shades = MirrorConfig.shades || [];
        
        shades.forEach(function(shade) {
            var hsl = shade.hsl || { h: 0, s: 0, l: 0 };
            var color = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
            
            $('<button class="shade-swatch" style="background-color: ' + color + '" data-shade=\'' + JSON.stringify(shade) + '\'></button>')
                .appendTo('.shade-picker')
                .on('click', function() {
                    applyShade(shade);
                });
        });
    }
    
    function applyShade(shade) {
        var hsl = shade.hsl || { h: 0, s: 0, l: 0 };
        var overlay = $('.mirror-overlay');
        
        // Apply color with blend mode for realistic effect
        overlay.css({
            'background-color': 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)',
            'mix-blend-mode': 'overlay',
            'opacity': 0.6
        });
        
        // Adjust warmth and shine based on engine settings
        if (engine.warmth) {
            overlay.css('filter', 'sepia(' + (engine.warmth / 100) + ')');
        }
    }
    
    function initComparisonSlider() {
        var slider = $('.comparison-slider');
        var beforeImg = $('.comparison-before');
        var afterImg = $('.comparison-after');
        
        if (slider.length === 0) return;
        
        slider.on('input', function() {
            var value = $(this).val();
            beforeImg.css('clip-path', 'polygon(0 0, ' + value + '% 0, ' + value + '% 100%, 0 100%)');
        });
    }
    
})(jQuery);
