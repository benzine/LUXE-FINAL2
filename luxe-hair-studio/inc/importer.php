<?php
/**
 * Luxe Hair Studio - One-Click Config Importer
 * 
 * Reads the luxe-config.json file and imports all settings
 * into the WordPress database for immediate use by the theme.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Luxe_Config_Importer {
    
    private $option_name = 'luxe_theme_config';
    private $json_path;
    
    public function __construct() {
        $this->json_path = get_template_directory() . '/luxe-config.json';
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Register AJAX handlers
        add_action('wp_ajax_luxe_import_config', array($this, 'handle_import_ajax'));
        add_action('wp_ajax_luxe_reset_config', array($this, 'handle_reset_ajax'));
    }
    
    /**
     * Add Luxe Console to WordPress Admin
     */
    public function add_admin_menu() {
        add_theme_page(
            __('Luxe Console', 'luxe-hair-studio'),
            __('Luxe Console', 'luxe-hair-studio'),
            'manage_options',
            'luxe-console',
            array($this, 'render_console_page')
        );
    }
    
    /**
     * Render the Luxe Console Admin Page
     */
    public function render_console_page() {
        $current_config = get_option($this->option_name, array());
        $has_config = !empty($current_config);
        $config_date = isset($current_config['imported_at']) ? $current_config['imported_at'] : 'Never';
        
        ?>
        <div class="wrap luxe-console-wrap">
            <h1><?php echo esc_html__('Luxe Hair Studio — Console', 'luxe-hair-studio'); ?></h1>
            
            <div class="luxe-console-card">
                <h2><?php echo esc_html__('Theme Configuration', 'luxe-hair-studio'); ?></h2>
                <p class="description">
                    <?php echo esc_html__('Import the complete Luxe Hair Studio configuration including services, stylists, packages, gallery, testimonials, products, and all UI labels.', 'luxe-hair-studio'); ?>
                </p>
                
                <div class="luxe-status-box">
                    <strong><?php echo esc_html__('Current Status:', 'luxe-hair-studio'); ?></strong>
                    <?php if ($has_config): ?>
                        <span class="luxe-status-success"><?php echo esc_html__('Configured', 'luxe-hair-studio'); ?></span>
                        <span class="luxe-date"><?php printf(esc_html__('Last imported: %s', 'luxe-hair-studio'), esc_html($config_date)); ?></span>
                    <?php else: ?>
                        <span class="luxe-status-warning"><?php echo esc_html__('Not configured', 'luxe-hair-studio'); ?></span>
                    <?php endif; ?>
                </div>
                
                <div class="luxe-actions">
                    <button type="button" id="luxe-import-btn" class="button button-primary button-hero" <?php echo $has_config ? 'disabled' : ''; ?>>
                        <span class="dashicons dashicons-upload"></span>
                        <?php echo esc_html__('Import Luxe Configuration', 'luxe-hair-studio'); ?>
                    </button>
                    
                    <button type="button" id="luxe-reset-btn" class="button button-secondary button-hero" <?php echo !$has_config ? 'disabled' : ''; ?>>
                        <span class="dashicons dashicons-image-rotate"></span>
                        <?php echo esc_html__('Reset to Defaults', 'luxe-hair-studio'); ?>
                    </button>
                </div>
                
                <div id="luxe-import-message" class="notice inline" style="display:none;"></div>
                
                <div class="luxe-progress-bar" id="luxe-progress" style="display:none;">
                    <div class="luxe-progress-fill"></div>
                </div>
            </div>
            
            <div class="luxe-console-card">
                <h2><?php echo esc_html__('Configuration Preview', 'luxe-hair-studio'); ?></h2>
                <?php if ($has_config): ?>
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th><?php echo esc_html__('Section', 'luxe-hair-studio'); ?></th>
                                <th><?php echo esc_html__('Items', 'luxe-hair-studio'); ?></th>
                                <th><?php echo esc_html__('Status', 'luxe-hair-studio'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $sections = array(
                                'salon' => 'Salon Identity',
                                'stages' => 'Hero Stages',
                                'services' => 'Services',
                                'stylists' => 'Stylists',
                                'packages' => 'Packages',
                                'gallery' => 'Gallery',
                                'testimonials' => 'Testimonials',
                                'products' => 'Products',
                                'amenities' => 'Amenities',
                                'stats' => 'Stats',
                                'quizQuestions' => 'Quiz Questions',
                                'bookingAddons' => 'Booking Add-ons',
                                'tiers' => 'Pricing Tiers',
                                'labels' => 'UI Labels',
                                'images' => 'Image Mappings'
                            );
                            
                            $config = isset($current_config['config']) ? $current_config['config'] : $current_config;
                            
                            foreach ($sections as $key => $label):
                                $count = 0;
                                if (isset($config[$key])) {
                                    if (is_array($config[$key])) {
                                        $count = count($config[$key]);
                                    } else {
                                        $count = '✓';
                                    }
                                }
                                ?>
                                <tr>
                                    <td><strong><?php echo esc_html($label); ?></strong></td>
                                    <td><?php echo esc_html(is_numeric($count) ? $count . ' items' : $count); ?></td>
                                    <td><span class="luxe-status-success"><?php echo esc_html__('Active', 'luxe-hair-studio'); ?></span></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p class="description"><?php echo esc_html__('No configuration imported yet. Click "Import Luxe Configuration" above to get started.', 'luxe-hair-studio'); ?></p>
                <?php endif; ?>
            </div>
            
            <div class="luxe-console-card">
                <h2><?php echo esc_html__('JSON Source File', 'luxe-hair-studio'); ?></h2>
                <p class="description">
                    <?php printf(
                        esc_html__('Reading from: %s', 'luxe-hair-studio'),
                        '<code>' . esc_html($this->json_path) . '</code>'
                    ); ?>
                </p>
                <?php if (file_exists($this->json_path)): ?>
                    <p><span class="luxe-status-success"><?php echo esc_html__('File found', 'luxe-hair-studio'); ?></span></p>
                <?php else: ?>
                    <p><span class="luxe-status-error"><?php echo esc_html__('File not found', 'luxe-hair-studio'); ?></span></p>
                <?php endif; ?>
            </div>
        </div>
        
        <style>
            .luxe-console-wrap { max-width: 1200px; }
            .luxe-console-card {
                background: #fff;
                border: 1px solid #c3c4c7;
                box-shadow: 0 1px 1px rgba(0,0,0,.04);
                padding: 20px;
                margin-top: 20px;
                border-radius: 8px;
            }
            .luxe-console-card h2 {
                margin-top: 0;
                color: #A67B7B;
                border-bottom: 2px solid #D4A5A5;
                padding-bottom: 10px;
            }
            .luxe-status-box {
                background: #f6f7f7;
                border-left: 4px solid #D4A5A5;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .luxe-status-success {
                color: #00a32a;
                font-weight: 600;
                margin-left: 10px;
            }
            .luxe-status-warning {
                color: #dba617;
                font-weight: 600;
                margin-left: 10px;
            }
            .luxe-status-error {
                color: #d63638;
                font-weight: 600;
            }
            .luxe-date {
                display: block;
                color: #646970;
                font-size: 13px;
                margin-top: 5px;
            }
            .luxe-actions {
                margin: 20px 0;
            }
            .luxe-actions button {
                margin-right: 10px;
                height: 45px;
                padding: 0 20px;
            }
            .luxe-progress-bar {
                height: 8px;
                background: #f0f0f1;
                border-radius: 4px;
                overflow: hidden;
                margin-top: 15px;
            }
            .luxe-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #D4A5A5, #A67B7B);
                transition: width 0.3s ease;
            }
            .notice.inline {
                margin: 15px 0 0 0;
                padding: 12px;
            }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            $('#luxe-import-btn').on('click', function() {
                var btn = $(this);
                var msg = $('#luxe-import-message');
                var progress = $('#luxe-progress');
                var fill = progress.find('.luxe-progress-fill');
                
                btn.prop('disabled', true).html('<span class="dashicons dashicons-admin-network spinning"></span> Importing...');
                msg.hide().removeClass('notice-success notice-error');
                progress.show();
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'luxe_import_config',
                        nonce: '<?php echo wp_create_nonce('luxe_import_nonce'); ?>'
                    },
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = (evt.loaded / evt.total) * 100;
                                fill.css('width', percentComplete + '%');
                            }
                        }, false);
                        return xhr;
                    },
                    success: function(response) {
                        fill.css('width', '100%');
                        setTimeout(function() {
                            if (response.success) {
                                msg.addClass('notice-success').html('<p><strong>' + response.data.message + '</strong></p>').fadeIn();
                                btn.html('<span class="dashicons dashicons-yes"></span> <?php echo esc_js__('Imported!', 'luxe-hair-studio'); ?>');
                                $('#luxe-reset-btn').prop('disabled', false);
                                setTimeout(function() { location.reload(); }, 1500);
                            } else {
                                msg.addClass('notice-error').html('<p><strong>Error:</strong> ' + response.data.message + '</p>').fadeIn();
                                btn.prop('disabled', false).html('<span class="dashicons dashicons-upload"></span> <?php echo esc_js__('Import Luxe Configuration', 'luxe-hair-studio'); ?>');
                                progress.hide();
                            }
                        }, 500);
                    },
                    error: function() {
                        msg.addClass('notice-error').html('<p><strong>Error:</strong> <?php echo esc_js__('Failed to import configuration. Please try again.', 'luxe-hair-studio'); ?></p>').fadeIn();
                        btn.prop('disabled', false).html('<span class="dashicons dashicons-upload"></span> <?php echo esc_js__('Import Luxe Configuration', 'luxe-hair-studio'); ?>');
                        progress.hide();
                    }
                });
            });
            
            $('#luxe-reset-btn').on('click', function() {
                if (!confirm('<?php echo esc_js__('Are you sure you want to reset all configuration to defaults?', 'luxe-hair-studio'); ?>')) {
                    return;
                }
                
                var btn = $(this);
                var msg = $('#luxe-import-message');
                
                btn.prop('disabled', true).html('<span class="dashicons dashicons-admin-network spinning"></span> Resetting...');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'luxe_reset_config',
                        nonce: '<?php echo wp_create_nonce('luxe_reset_nonce'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            msg.addClass('notice-success').html('<p><strong>' + response.data.message + '</strong></p>').fadeIn();
                            setTimeout(function() { location.reload(); }, 1000);
                        } else {
                            msg.addClass('notice-error').html('<p><strong>Error:</strong> ' + response.data.message + '</p>').fadeIn();
                            btn.prop('disabled', false);
                        }
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * Handle AJAX import request
     */
    public function handle_import_ajax() {
        check_ajax_referer('luxe_import_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'luxe-hair-studio')));
        }
        
        if (!file_exists($this->json_path)) {
            wp_send_json_error(array('message' => __('Configuration file not found.', 'luxe-hair-studio')));
        }
        
        $json_content = file_get_contents($this->json_path);
        $data = json_decode($json_content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => __('Invalid JSON in configuration file.', 'luxe-hair-studio')));
        }
        
        // Extract config from envelope if it exists
        $config = isset($data['config']) ? $data['config'] : $data;
        
        // Add metadata
        $config['imported_at'] = current_time('mysql');
        $config['version'] = isset($data['version']) ? $data['version'] : '1.0';
        
        // Save to database
        update_option($this->option_name, $config, false);
        
        // Clear any caches
        wp_cache_delete($this->option_name, 'options');
        
        wp_send_json_success(array(
            'message' => __('Configuration imported successfully! Your salon is now ready.', 'luxe-hair-studio')
        ));
    }
    
    /**
     * Handle AJAX reset request
     */
    public function handle_reset_ajax() {
        check_ajax_referer('luxe_reset_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'luxe-hair-studio')));
        }
        
        delete_option($this->option_name);
        wp_cache_delete($this->option_name, 'options');
        
        wp_send_json_success(array(
            'message' => __('Configuration reset. You can now import fresh settings.', 'luxe-hair-studio')
        ));
    }
    
    /**
     * Get current config for frontend use
     */
    public static function get_config() {
        return get_option('luxe_theme_config', array());
    }
}

// Initialize the importer
new Luxe_Config_Importer();
