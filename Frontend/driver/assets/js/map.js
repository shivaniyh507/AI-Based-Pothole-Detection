/* global MapEngine */
/**
 * Legacy map script alias redirecting to MapEngine
 */
if (typeof window !== 'undefined' && typeof MapEngine !== 'undefined') {
    window.initMap = function() {
        MapEngine.init('map');
    };
}
