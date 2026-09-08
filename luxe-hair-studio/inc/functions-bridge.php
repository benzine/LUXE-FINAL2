<?php
/**
 * Luxe Hair Studio Theme - Functions & Configuration Bridge
 * 
 * This file connects the JSON configuration to WordPress
 * and publishes it to the frontend as window.__LUXE_CONFIG__
 */

if (!defined('ABSPATH')) {
    exit;
}

// Include the One-Click Importer
require_once get_template_directory() . '/inc/importer.php';

/**
 * Get merged configuration from database and defaults
 */
function luxe_merged_config() {
    // Get configuration from database
    $config = Luxe_Config_Importer::get_config();
    
    // Fallback to defaults.json if no config imported yet
    if (empty($config)) {
        $defaults_path = get_template_directory() . '/inc/defaults.json';
        if (file_exists($defaults_path)) {
            $defaults_content = file_get_contents($defaults_path);
            $defaults = json_decode($defaults_content, true);
            $config = isset($defaults['config']) ? $defaults['config'] : $defaults;
        }
    }
    
    return $config;
}

/**
 * Add theme support features
 */
function luxe_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');
    
    // Let WordPress manage the document title
    add_theme_support('title-tag');
    
    // Enable support for Post Thumbnails
    add_theme_support('post-thumbnails');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => esc_html__('Primary Menu', 'luxe-hair-studio'),
        'footer' => esc_html__('Footer Menu', 'luxe-hair-studio'),
    ));
    
    // Switch default core markup for various elements to HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ));
    
    // Add support for custom logo
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    
    // Add support for custom background
    add_theme_support('custom-background');
    
    // Add support for responsive embeds
    add_theme_support('responsive-embeds');
    
    // Add support for editor styles
    add_theme_support('editor-styles');
}
add_action('after_setup_theme', 'luxe_setup');

/**
 * Register widget areas
 */
function luxe_widgets_init() {
    register_sidebar(array(
        'name'          => esc_html__('Sidebar', 'luxe-hair-studio'),
        'id'            => 'sidebar-1',
        'description'   => esc_html__('Add widgets here.', 'luxe-hair-studio'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
    
    register_sidebar(array(
        'name'          => esc_html__('Footer', 'luxe-hair-studio'),
        'id'            => 'footer-1',
        'description'   => esc_html__('Footer widget area', 'luxe-hair-studio'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'luxe_widgets_init');

/**
 * Custom excerpt length
 */
function luxe_excerpt_length($length) {
    return 25;
}
add_filter('excerpt_length', 'luxe_excerpt_length');

/**
 * Custom excerpt more
 */
function luxe_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'luxe_excerpt_more');

/**
 * Add custom body classes
 */
function luxe_body_classes($classes) {
    // Add a class if there's no sidebar
    if (!is_active_sidebar('sidebar-1')) {
        $classes[] = 'no-sidebar';
    }
    
    return $classes;
}
add_filter('body_class', 'luxe_body_classes');

/**
 * Preload key resources for performance
 */
function luxe_resource_hints($urls, $relation_type) {
    if ('preconnect' === $relation_type) {
        $urls[] = array(
            'href' => 'https://fonts.googleapis.com',
        );
        $urls[] = array(
            'href' => 'https://fonts.gstatic.com',
            'crossorigin' => 'anonymous',
        );
    }
    
    return $urls;
}
add_filter('wp_resource_hints', 'luxe_resource_hints', 10, 2);

/**
 * Remove unnecessary WordPress features for cleaner output
 */
function luxe_cleanup_head() {
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wp_shortlink_wp_head');
}
add_action('init', 'luxe_cleanup_head');

/**
 * Helper function to get config values in templates
 * Usage: luxe_get_config('salon.name') returns "Luxe Hair Studio"
 */
function luxe_get_config($key = null, $default = '') {
    $config = Luxe_Config_Importer::get_config();
    
    if (empty($config)) {
        return $default;
    }
    
    if ($key === null) {
        return $config;
    }
    
    // Support dot notation: 'salon.name'
    $keys = explode('.', $key);
    $value = $config;
    
    foreach ($keys as $k) {
        if (is_array($value) && isset($value[$k])) {
            $value = $value[$k];
        } else {
            return $default;
        }
    }
    
    return $value;
}

/**
 * Helper function to check if config exists
 */
function luxe_has_config() {
    $config = Luxe_Config_Importer::get_config();
    return !empty($config);
}
