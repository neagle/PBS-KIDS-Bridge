// Bridge v2.0
// by Nate Eagle

// Establish 'P'BS 'K'IDS namespace
var PK = PK || {};

(function($) {

PK.bridge = PK.bridge || {
    init: function(elem, settings) {
        var that = this;
        $.extend(this.options, settings);
        this._addEventListeners();

        /* Dynamically add stylesheet to head */
        $(document).ready(function() {
            $('<link />', {
                rel: 'stylesheet',
                type: 'text/css',
                href: that.options.css,
                media: 'screen'
            }).appendTo('head');

            that._preloadImages();

        });
    },

    // Default options
    options: {
        border: 10,
        css: 'bridge.css', // Name of CSS file
        // Eliminate color variables... these can and should be in the css.
        color: {
            background: '#B3CE34',
            border: '#fff',
            link: '#513F00',
            text: '#fff'
        },
        dim: .8, // How dim (between 0 and 1) to make background
        feature: {
            width: 602
        },
        height: 210,
        image: '/images/bridge/sprite.gif', // “A sad tale's best for winter. I have one of sprites and goblins.”
        padding: 15,
        titleHrefLength: 20, // Number of characters at which to truncate the URL displayed in the absence of a title attribute
        width: 370
    },

    // Add event listeners to anchor and area tags
    _addEventListeners: function() {
        var that = this;
        // If the bridge does not exist (pre init) yet, assign event listeners to links (and image maps) on page
        if (this.bridge == null) {
            $(document).ready(function() {
                $('a, area').bind('click.bridge', function(event) {
                    return that.test(event.target);
                });
            });
        } else {
        // If the bridge does exist (post init), assign event listeners to dimmed out section and close button
            // Dimmed out background should close bridge
            this.bridge.container.bind('click.bridge', function(event) {
                that.burn();
            });
            // Close button should close bridge
            if (this.bridge.x) {
                this.bridge.x.bind('click.bridge', function(event) {
                    that.burn();
                });
            }
            this.bridge.close.bind('click.bridge', function(event) {
                that.burn();
            });

            $(window).bind('resize.bridge', function() {
                that._position();
            });
            $(window).bind('scroll.bridge', function() {
                that._position();
            });
        }
    },

    // Preload Sponsor and Feature Images so that they're ready to go
    _preloadImages: function() {
        var that = this;
        PK.preloadedImages = [];

        // Check each anchor tag for a filename in the rel attribute
        $('a').each(function(i, item) {
            var rel = $(item).attr('rel');
            if (rel) {
                var ext = rel.substring(rel.length - 3, rel.length);
                // Check to see whether the string represents an image
                if (ext == 'gif' || ext == 'jpg' || ext == 'png') {
                    var img = new Image();
                    img.src = rel;
                    PK.preloadedImages.push(img); 
                }
            }
        });
    },

    // Test whether links should be bridged, or allowed to pass
    test: function(anchor) {
        var alreadyOutside = false,
            bridge = false;

        // Make sure we're not already outside the PBS KIDS zone, as defined by our conditions
        for (var i=0; i<this.conditions.length && alreadyOutside==false; i++) {
            if (this.conditions[i](window.location, this.urls) == false) {
                alreadyOutside = true;
            }
        }

        // Iterate through list of conditions
        // If any return false, bridge it!
        if (alreadyOutside == false) {
            for (var i=0; i<this.conditions.length && bridge==false; i++) {
                if (this.conditions[i](anchor, this.urls) == false) {
                    bridge = true;
                }
            }
        }
            
        if (bridge == true) {
            this.anchor = anchor;
            this.$anchor = $(anchor);
            this.build();
        }
        // Return the opposite of bridge
        // Logic returns 'true' if it should be bridged, so return 'false' to stop link's normal behavior
        return !bridge;
    },

    // Conditions for Bridging
    conditions: [
        // Test for URLs that should NOT be bridged
        // Return true as soon as we know it shouldn't be bridged
        function(anchor, urls) {
            for (var i = urls.nobridge.length - 1; i>=0; i--) {
                if (anchor.hostname == urls.nobridge[i]) {
                    return true;
                }
            }
            // If it passes no url tests, bridge it
            return false;
        },
        // Test for URLs that SHOULD be bridged
        function(anchor, urls) {
            for (var i=urls.bridge.length-1; i>=0; i--) {
                if (anchor.pathname.indexOf(urls.bridge[i]) != -1) {
                    return false;
                }
            }
        }
    ],
    urls: {
        // URLs that should NOT be bridged
        nobridge: [
            'www-tc.pbskids.org',
            'pbskids.org',
            'www.pbskids.org',
            'soup.pbskids.org',
            'pbskidsgo.org',
            'pbskidsplay.org',
            'www.pbskidsplay.org',
            'dipsy.pbs.org',
            'video.pbs.org'
        ],
        // URLs that SHOULD be bridged
        bridge: [
            'parentsteachers',
            'caregiver',
            'itsmylife/parents',
            'animalia/parents_and_teachers',
            'parentsTeachers',
            'mamamirabelle/parents',
            'barney/pareduc',
            'zoom/grownups',
            'readingrainbow/parents_and_teachers',
            'wordgirl/parentsandteachers',
            'electriccompany/parenseducators',
            'wordworld/parentsandteachers',
            'wordworld/sitemap',
            'wordworld/contactus',
            'wordworld/activities'
        ],

        // Set templates for bridged URLs
        template: {
            parents: [
                'pbsparents.org',
                '/parents',
                '/parents_and_teachers',
                '/grownups',
                '/caregiver'
            ],
            teachers: [
                'pbsteachers.org',
                '/teachers'
            ]
        },

        // Some sites have custom cursors or other issues that interfere with the overlay and must always hide Flash
        flashHide: [
            '/teletubbies',
            '/sesame',
            '/panwapa',
            '/mamamirabelle',
            '/caillou',
            '/toopyandbinoo',
            '/zoom/games/goldburgertogo'
        ]

    },

    /* 
       "Education is all a matter of building bridges."
        Build the bridge overlay
    */

    build: function() {
        this.bridge = {};

        var linkText,
            title = this.$anchor.attr('title');

        this.options.template = this.template();

        // Set link text
        // NOTE - change to remove http:// from slug?
        if (title) {
            // If title attribute is present, use as link text
            linkText = title; 
        } else {
            // If no title attribute, concatenate href to use as link text
            linkText = this.anchor.href;
            linkText = linkText.split('http://');
            linkText = linkText[linkText.length-1];
            linkText = linkText.substring(0, this.options.titleHrefLength); 
            if (linkText.length > this.options.titleHrefLength) { linkText += '&hellip;'; }
            // Remove any trailing slashes (they're ugly)
            if (linkText.substring(linkText.length-1, linkText.length) == '/') {
                linkText = linkText.substring(0, linkText.length-1);
            }
        }

        this.options.href = this.anchor.href,
        this.options.linkText = linkText;

        this._create();
        this._reveal();
    },
    // Create & Place DOM Elements
    _create: function() {
        var that = this;


        // Call the template-specific creation code
        this.templates[this.options.template].call(this);

        // Dynamically set height
        this.bridge.outline.css({
            height: that.bridge.bridge.css('height')
        });
        
        // Store width and height
        that.bridge.width = that.bridge.bridge.width(); 
        that.bridge.height = that.bridge.bridge.height(); 

        this._position();

        this._addEventListeners();
    },
    // Position (horizontally and vertically center) bridge
    // Contained in its own method so it can be called on window resize when overlay is active
    _position: function() {
        var that = this,
            win = $(window),
            winHeight = win.height(),
            winWidth = win.width();

        this.bridge.outline.css({
            left: (winWidth/2) - ((that.bridge.width + that.options.border) / 2),
            top: (winHeight/2) - ((that.bridge.height + that.options.border) / 2)
        });
    },

    // Reveal Bridge
    _reveal: function() {
        var that = this;
        this.bridge.container.animate({
            opacity: this.options.dim
        }, {
            complete: function() {
                that.bridge.outline.animate({
                    opacity: 1
                }, 'fast');
            },
            duration: 'fast'
        });
    },
    
    // Hide Bridge
    _hide: function(callback) {
        var that = this;
        this.bridge.outline.animate({
            opacity: 0
        }, {
            complete: function() {
                that.bridge.container.animate({
                    opacity: 0
                }, {
                    duration: 'fast',
                    complete: callback
                });
            },
            duration: 'fast'
        });
    },

    /*
        "I demolish my bridges behind me - then there is no choice but forward."
                                                 - Firdtjorf Nansen
        Close the bridge overlay
    */

    burn: function() {
        var that = this;

        // Remove all bridge events from window (scroll & resize)
        $(window).unbind('.bridge');

        that.bridge.container.unbind('click.bridge');

        this._hide(function() {
            that.bridge.container.remove();
            that.bridge.outline.empty().remove();
            that.bridge = null;       
        });
    },

    // TEMPLATE
    // Test the href and return the appropriate template name
    template: function() {
        var template = '';

        // Sponsor template
        if (this.$anchor.hasClass('pbskids_bridge_sponsor')) {
            return 'sponsor';
        }

        // Featured Sponsor template
        if (this.$anchor.hasClass('pbskids_bridge_feature')) {
            return 'feature';
        }

        // Parents template
        for (var i=this.urls.template.parents.length - 1; i>=0 && template == ''; i--) {
            if ((this.anchor.href).indexOf(this.urls.template.parents[i]) != -1) {
                return 'parents';
            }
        }
        
        // Teachers template
        for (var i=this.urls.template.teachers.length; i>=0 && template == ''; i--) {
            if ((this.anchor.href).indexOf(this.urls.template.teachers[i]) != -1) {
                return 'teachers';
            }
        }

        return 'generic';
    },

    // Specific template construction code
    templates: {
        generic: function() {
            // console.log('Generic!');
            var that = this;

            that.bridge.container = $('<div />', {
                id: 'pbs_bridge_container'
            }).css({
                opacity: 0
            }).appendTo('body');

            that.bridge.outline = $('<div />', {
                id: 'pbs_bridge_outline'
            }).css({
                background: that.options.color.border,
                // height: that.options.height,
                opacity: 0,
                padding: that.options.border,
                width: that.options.width
            }).appendTo('body');

            that.bridge.bridge = $('<div />', {
                id: 'pbs_bridge'
            }).css({
                // height: that.options.height,
                width: that.options.width
            }).appendTo(that.bridge.outline);

            that.bridge.inner = $('<div />', {
                id: 'pbs_bridge_inner'
            }).appendTo(that.bridge.bridge);

            that.bridge.header = $('<h1 />', {
                id: 'pbs_bridge_header',
                text: 'You are leaving PBS KIDS'
            }).appendTo(that.bridge.inner);

            that.bridge.close = $('<a />', {
                id: 'pbs_bridge_close',
                title: 'Back to PBS KIDS',
                text: 'Back'
            }).appendTo(that.bridge.inner);

            that.bridge.link = $('<a />', {
                id: 'pbs_bridge_link',
                href: that.options.href,
                html: 'Continue to ' + that.options.linkText + '&nbsp;&raquo;'
            }).appendTo(that.bridge.inner);

        },
        parents: function() {
            // console.log('Parents!');
            var that = this;

            // Start with the basics
            that.templates.generic.call(this);

            that.bridge.sign = $('<a />', {
                href: that.options.href,
                id: 'pbs_bridge_sign',
                title: 'Continue to PBS Parents'
            }).appendTo(that.bridge.inner);

            that.bridge.signLogo = $('<span />', {
                id: 'pbs_bridge_parentsLogo',
                'class': 'pbs_bridge_signLogo'
            }).appendTo(that.bridge.sign);
        },
        teachers: function() {
            // console.log('Teachers!');
            var that = this;

            // Start with the basics
            that.templates.generic.call(this);

            that.bridge.sign = $('<a />', {
                href: that.options.href,
                id: 'pbs_bridge_sign',
                title: 'Continue to PBS Teachers'
            }).appendTo(that.bridge.inner);

            that.bridge.signLogo = $('<span />', {
                id: 'pbs_bridge_teachersLogo',
                'class': 'pbs_bridge_signLogo'
            }).appendTo(that.bridge.sign);
        },
        sponsor: function() {
            // console.log('Sponsor!');
            var that = this;
        },
        feature: function() {
            // console.log('Featured sponsor!');
            var that = this;

            that.bridge.container = $('<div />', {
                id: 'pbs_bridge_container'
            }).css({
                opacity: 0
            }).appendTo('body');

            that.bridge.outline = $('<div />', {
                id: 'pbs_bridge_outline'
            }).css({
                background: that.options.color.border,
                opacity: 0,
                padding: that.options.border,
                width: that.options.feature.width
            }).appendTo('body');

            that.bridge.bridge = $('<div />', {
                id: 'pbs_bridge',
                'class': 'feature'
            }).css({
                width: that.options.feature.width
            }).appendTo(that.bridge.outline);

            that.bridge.inner = $('<div />', {
                id: 'pbs_bridge_inner'
            }).appendTo(that.bridge.bridge);

            that.bridge.x = $('<a />', {
                id: 'pbs_bridge_x',
                text: 'X',
                title: 'Back to PBS KIDS'
            }).appendTo(that.bridge.inner);

            that.bridge.close = $('<a />', {
                id: 'pbs_bridge_close',
                'class': 'feature',
                title: 'Back to PBS KIDS',
                text: 'Back'
            }).appendTo(that.bridge.inner);

            that.bridge.feature = $('<a />', {
                id: 'pbs_bridge_feature',
                href: that.options.href
            }).appendTo(that.bridge.inner);

            that.bridge.featureImage = $('<img />', {
                alt: that.$anchor.attr('rev'),
                src: that.$anchor.attr('rel')
            }).appendTo(that.bridge.feature);

        }
    }

}

})(jQuery);

PK.bridge.init();
