<?php
/**
 * Luxe Hair Studio - One-Click Config Importer
 */

if (!defined('ABSPATH')) { exit; }

class Luxe_Config_Importer {
    
    private $option_name = 'luxe_config';
    private $json_path;
    
    public function __construct() {
        $this->json_path = get_template_directory() . '/luxe-config.json';
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_luxe_import_config', array($this, 'handle_import_ajax'));
        add_action('wp_ajax_luxe_reset_config', array($this, 'handle_reset_ajax'));
    }
    
    public function add_admin_menu() {
        add_theme_page('Luxe Console', 'Luxe Console', 'manage_options', 'luxe-console', array($this, 'render_console_page'));
    }
    
    public function render_console_page() {
        $current_config = get_option($this->option_name, array());
        $has_config = !empty($current_config);
        ?>
        <div class="wrap">
            <h1>Luxe Hair Studio — Console</h1>
            <div style="background:#fff;padding:20px;margin-top:20px;border:1px solid #c3c4c7;border-radius:8px;">
                <h2>Theme Configuration</h2>
                <p>Import the complete Luxe Hair Studio configuration.</p>
                <button type="button" id="luxe-import-btn" class="button button-primary button-hero" <?php echo $has_config ? 'disabled' : ''; ?>>
                    Import Luxe Configuration
                </button>
                <button type="button" id="luxe-reset-btn" class="button button-secondary button-hero" <?php echo !$has_config ? 'disabled' : ''; ?>>
                    Reset to Defaults
                </button>
                <div id="luxe-import-message" class="notice inline" style="display:none;"></div>
            </div>
        </div>
        <script>
        jQuery(document).ready(function($) {
            $('#luxe-import-btn').on('click', function() {
                var btn = $(this);
                var msg = $('#luxe-import-message');
                btn.prop('disabled', true).html('Importing...');
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: { action: 'luxe_import_config', nonce: '<?php echo wp_create_nonce('luxe_import_nonce'); ?>' },
                    success: function(response) {
                        if (response.success) {
                            msg.addClass('notice-success').html('<p>' + response.data.message + '</p>').fadeIn();
                            setTimeout(function() { location.reload(); }, 1500);
                        } else {
                            msg.addClass('notice-error').html('<p>Error: ' + response.data.message + '</p>').fadeIn();
                            btn.prop('disabled', false);
                        }
                    },
                    error: function() {
                        msg.addClass('notice-error').html('<p>Failed to import.</p>').fadeIn();
                        btn.prop('disabled', false);
                    }
                });
            });
            $('#luxe-reset-btn').on('click', function() {
                if (!confirm('Reset all configuration?')) return;
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: { action: 'luxe_reset_config', nonce: '<?php echo wp_create_nonce('luxe_reset_nonce'); ?>' },
                    success: function(response) { if (response.success) location.reload(); }
                });
            });
        });
        </script>
        <?php
    }
    
    public function handle_import_ajax() {
        check_ajax_referer('luxe_import_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error(array('message' => 'Permission denied.'));
        if (!file_exists($this->json_path)) wp_send_json_error(array('message' => 'File not found.'));
        
        $json_content = file_get_contents($this->json_path);
        $data = json_decode($json_content, true);
        if (json_last_error() !== JSON_ERROR_NONE) wp_send_json_error(array('message' => 'Invalid JSON.'));
        
        // Extract config from envelope and flatten
        $config = isset($data['config']) ? $data['config'] : $data;
        $flat_config = is_array($config) ? $config : array();
        $flat_config['imported_at'] = current_time('mysql');
        $flat_config['version'] = isset($data['version']) ? $data['version'] : '1.0';
        
        update_option($this->option_name, $flat_config, false);
        wp_cache_delete($this->option_name, 'options');
        wp_send_json_success(array('message' => 'Configuration imported successfully!'));
    }

    public function handle_reset_ajax() {
        check_ajax_referer('luxe_reset_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error(array('message' => 'Permission denied.'));
        delete_option($this->option_name);
        wp_cache_delete($this->option_name, 'options');
        wp_send_json_success(array('message' => 'Configuration reset.'));
    }

    public static function get_config() {
        return get_option('luxe_config', array());
    }
}

new Luxe_Config_Importer();
