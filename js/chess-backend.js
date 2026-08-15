/**
 * ====================================================================
 * CHESS BACKEND ADAPTER (PORTABLE API & TELEMETRY — ES5 COMPLIANT)
 * Sends lightweight Beacon Pings (Realtime, DAU, WAU, MAU, YAU),
 * Quota syncing and Ko-fi integration.
 * ====================================================================
 */

(function(root) {
    'use strict';

    // CONFIGURATION (Default Supabase or Custom VPS endpoint)
    // Sửa các thông số dưới đây khi kết nối với dự án Supabase của bạn
    var CONFIG = {
        SUPABASE_URL: '%%SUPABASE_URL%%', // ví dụ: 'https://xyzcompany.supabase.co'
        SUPABASE_ANON_KEY: '%%SUPABASE_ANON_KEY%%', // ví dụ: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        KOFI_URL: 'https://ko-fi.com/thaibm', // URL trang Ko-fi của tác giả
        KOFI_QR_IMAGE: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ko-fi.com/thaibm'
    };

    var ChessBackend = {
        config: CONFIG,

        // Gửi ping thống kê Active Users (siêu nhẹ ~500 bytes XHR)
        sendPing: function(actionType, pageUrl, callback) {
            var deviceId = root.ChessStorage ? root.ChessStorage.getDeviceId() : 'unknown';
            var deviceType = root.ChessStorage ? root.ChessStorage.getDeviceType() : 'kindle';
            var lang = root.ChessStorage ? root.ChessStorage.getLang() : 'vi';

            var payload = {
                device_id: deviceId,
                device_type: deviceType,
                lang: lang,
                action_type: actionType || 'ping',
                page_url: pageUrl || window.location.pathname || '/'
            };

            var url = this.config.SUPABASE_URL;
            var key = this.config.SUPABASE_ANON_KEY;

            // Nếu chưa cấu hình Supabase URL hoặc vẫn là placeholder, log ra console hoặc bỏ qua an toàn
            if (!url || !key || url.indexOf('%%') === 0 || key.indexOf('%%') === 0) {
                if (callback) callback(null, { offline: true });
                return;
            }

            try {
                var xhr = new XMLHttpRequest();
                var endpoint = this.config.SUPABASE_URL + '/rest/v1/active_pings';
                xhr.open('POST', endpoint, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('apikey', this.config.SUPABASE_ANON_KEY);
                xhr.setRequestHeader('Authorization', 'Bearer ' + this.config.SUPABASE_ANON_KEY);
                xhr.setRequestHeader('Prefer', 'return=minimal');

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            if (callback) callback(null, { success: true });
                        } else {
                            if (callback) callback(new Error('Ping failed status: ' + xhr.status));
                        }
                    }
                };

                xhr.send(JSON.stringify(payload));
            } catch (e) {
                if (callback) callback(e);
            }
        },

        // Mở Modal Ủng hộ tác giả Ko-fi
        showDonateModal: function() {
            var modal = document.getElementById('donate-modal');
            if (modal) {
                modal.className = 'modal-overlay active';
            }
        },

        // Đóng Modal Ko-fi
        closeDonateModal: function() {
            var modal = document.getElementById('donate-modal');
            if (modal) {
                modal.className = 'modal-overlay';
            }
        }
    };

    root.ChessBackend = ChessBackend;

})(typeof window !== 'undefined' ? window : this);
