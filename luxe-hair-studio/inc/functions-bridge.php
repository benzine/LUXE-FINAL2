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
