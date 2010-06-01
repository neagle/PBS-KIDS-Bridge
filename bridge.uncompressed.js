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
        });
    },

    // Default options
    options: {
        border: 10,
        css: 'bridge.css', // Name of CSS file
        color: {
            background: '#b3ce34',
            border: '#fff',
            link: '#513F00',
            text: '#fff'
        },
        dim: .8, // How dim (between 0 and 1) to make background
        image: '/images/bridge/sprite.gif', // “A sad tale's best for winter. I have one of sprites and goblins.”
        height: 210,
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
            this.bridge.container.bind('click.bridge', function(event) {
                if (event.target === that.bridge.container[0] || event.target === that.bridge.close.children('span')[0]) {
                    that.burn();
                }
            });

            // $(window).bind('resize', that._position()).bind('scroll', that._position());
            $(window).scroll(that._position());
        }
    },

    // Test whether links should be bridged, or allowed to pass
    test: function(anchor) {
        var bridge = false;
        // Iterate through list of conditions
        // If any return false, bridge it!
        for (var i=0; i<this.conditions.length && bridge==false; i++) {
            if (this.conditions[i](anchor, this.urls) == false) {
                bridge = true;
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
            linkText = href.substring(0, this.options.titleHrefLength); 
            if (href.length > this.options.titleHrefLength) { linkText += '&hellip;'; }
        }

        this.options.href = this.anchor.href,
        this.options.linkText = linkText;

        this._create();
        this._reveal();
    },
    // Create & Place DOM Elements
    _create: function() {
        var that = this;

        // Create the items required for all templates
        this.bridge.container = $('<div />', {
            id: 'pbs_bridge_container'
        }).css({
            opacity: 0
        }).appendTo('body');

        this.bridge.outline = $('<div />', {
            id: 'pbs_bridge_outline'
        }).css({
            background: that.options.color.border,
            height: that.options.height,
            opacity: 0,
            padding: that.options.border,
            width: that.options.width
        }).appendTo(this.bridge.container);

        this.bridge.bridge = $('<div />', {
            id: 'pbs_bridge'
        }).css({
            background: that.options.color.background,
            height: that.options.height,
            width: that.options.width
        }).appendTo(this.bridge.outline);

        this.bridge.inner = $('<div />', {
            id: 'pbs_bridge_inner'
        }).appendTo(this.bridge.bridge);

        this.bridge.header = $('<h1 />', {
            id: 'pbs_bridge_header',
            text: 'You are leaving PBS KIDS'
        }).appendTo(this.bridge.inner);

        this.bridge.close = $('<a />', {
            id: 'pbs_bridge_close',
            title: 'Back to PBS KIDS',
            html: '<span></span> Back'
        }).appendTo(this.bridge.inner);

        this.bridge.link = $('<a />', {
            id: 'pbs_bridge_link',
            href: that.options.href,
            html: 'Continue to ' + that.options.linkText + '&nbsp;&raquo;'
        }).appendTo(this.bridge.inner);

        // Call the template-specific creation code
        this.templates[this.options.template]();

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
            left: (winWidth/2) - ((that.options.width + that.options.border) / 2),
            top: (winHeight/2) - ((that.options.height + that.options.border) / 2)
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
        that.bridge.container.unbind('click.bridge');

        this._hide(function() {
            that.bridge.container.empty().remove();
            that.bridge = null;       
        });
    },

    // TEMPLATE
    // Test the href and return the appropriate template name
    template: function() {
        var template = '';

        // Sponsor template
        if (this.$anchor.hasClass('pbskids_bridge_sponsor')) {
            template = 'sponsor';
        }

        // Parents template
        for (var i=this.urls.template.parents.length - 1; i>=0 && template == ''; i--) {
            if ((this.anchor.href).indexOf(this.urls.template.parents[i]) != -1) {
                template = 'parents';
            }
        }
        
        // Teachers template
        for (var i=this.urls.template.teachers.length; i>=0 && template == ''; i--) {
            if ((this.anchor.href).indexOf(this.urls.template.teachers[i]) != -1) {
                template = 'teachers';
            }
        }

        template = template || 'default';

        return template; 
    },

    // Specific template construction code
    templates: {
        default: function() {
            console.log('Default!');
        },
        parents: function() {
            console.log('Parents!');
        },
        teachers: function() {
            console.log('Teachers!');
        },
        sponsor: function() {
            console.log('Sponsor!');
        }
    }

}

})(jQuery);

PK.bridge.init();
