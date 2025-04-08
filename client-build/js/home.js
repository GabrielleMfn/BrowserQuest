
define(['lib/class', 'lib/underscore.min', 'lib/stacktrace', 'util'], function() {

    require.config({
        paths: {
            'gametypes': '/shared/js/gametypes'
        }
    });

    require(["main"]);
});