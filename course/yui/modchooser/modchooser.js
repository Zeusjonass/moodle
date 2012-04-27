YUI.add('moodle-course-modchooser', function(Y) {

        var MODCHOOSERNAME = 'course-modchooser';

        var MODCHOOSER = function() {
            MODCHOOSER.superclass.constructor.apply(this, arguments);
        }

        Y.extend(MODCHOOSER, Y.Base, {
            // The overlay widget
            overlay: null,

            // The current section ID
            sectionid : null,

            // The hidden element holding the jump param
            jumplink : null,

            // The submit button - we disable this until an element is set
            submitbutton : null,

            initializer : function(config) {
                // Create our overlay
                this.overlay = new M.core.dialogue({
                    bodyContent:Y.one('#modchooserdialogue').get('innerHTML'),
                    headerContent:Y.one('#modchoosertitle').get('innerHTML'),
                    visible: false, // Hide by default
                    zindex: 100,    // Display in front of other items
                    lightbox: true, // This dialogue should be modal
                    width: '500px'
                });

                // Hide and then render the overlay
                this.overlay.hide();
                this.overlay.render();

                // Replace each menu section with a handler
                Y.all('.course-content li.section').each(function(section) {
                    // Determine the sectionid for this section
                    var sectionid = section.get('id').replace('section-', '');
                    sectionaddcontent = section.one('.section_add_module .mod-indent');
                    sectionaddcontent.on('click', this.display_chooser, this, sectionid);
                }, this);

                // Replace the frontpage menu too
                Y.all('div.region-content div.sitetopic').each(function(section) {
                    sectionaddcontent = addcontent.cloneNode(true);

                    // The sitetopic has a sectionid of 1
                    sectionaddcontent.on('click', this.display_chooser, this, 1);

                    if (section.one('ul.section') == null) {
                        sectionul = Y.Node.create('<ul class="section img-text"></ul>');
                        section.appendChild(sectionul);
                    }
                    var sectionarea = section.one('ul.section').appendChild(sectionaddcontent);

                    // Remove the add links if they're visible on this page
                    section.all('.section_add_menus').remove();
                }, this);

                // Clear the original dialogue that the javascript dialogue is based upon
                Y.one('#modchooserdialogue').set('innerHTML', '');
            },
            display_chooser : function (e, sectionid) {
                // Stop the default event actions before we proceed
                e.preventDefault();

                // Display the overlay
                this.overlay.show();

                // Try and set a sensible max-height
                // This must be done before setting the top
                var bb = this.overlay.get('boundingBox');
                var dialogue = Y.one('#modchoosercontainer #choosemod .modoptions');
                var winheight = bb.get('winHeight');

                // Set a default max-height of 640px
                var newheight = 640;
                if (winheight <= newheight) {
                    // Deal with smaller window sizes
                    if (winheight <= 300) {
                        newheight = 300;
                    } else {
                        newheight = winheight;
                    }
                }
                // Take off 15px top and bottom for borders, plus 40px each
                // for the title and button area before setting the new
                // max-height
                newheight = newheight - (15 + 15 + 40 + 40);
                dialogue.setStyle('max-height', newheight + 'px');

                // Re-calculate the location now that we've changed the size
                this.overlay.centerDialogue();

                // These will trigger a check_options call to display the
                // correct help
                Y.one('#modchoosercontainer').on('click', this.check_options, this);
                Y.one('#modchoosercontainer').on('key_up', this.check_options, this);

                // Hook onto the cancel button to hide the form
                Y.one('#modchoosercontainer #addcancel').on('click', this.cancel_popup, this, this);

                // Grab global keyup events and handle them
                Y.one('document').on('keyup', this.handle_key_press, this);

                // Set the section for this version of the dialogue
                this.sectionid = sectionid;

                // Add references to various elements we adjust
                this.jumplink     = Y.one('#modchoosercontainer #jump');
                this.submitbutton = Y.one('#modchoosercontainer #submit');

                // Disable the submit element until the user makes a selection
                this.submitbutton.set('disabled', 'true');

                // Finally, focus the first radio element - this enables
                // form selection via the keyboard
                Y.one('#modchoosercontainer .modoption input[type=radio]').focus();
                this.check_options();
            },
            handle_key_press : function(e) {
                if (e.keyCode == 27) {
                    // Escape pressed
                    e.preventDefault();
                    this.hide();
                }
            },
            cancel_popup : function (e, modchooser) {
                // Prevent normal form submission before hiding
                e.preventDefault();
                modchooser.hide();
            },
            hide : function() {
                // Detach the global keypress handler before hiding
                Y.one('document').detach('keyup', this.handle_key_press, this);
                this.overlay.hide();
            },
            check_options : function(e) {
                // Check which options are set, and change the parent class
                // to show/hide help as required
                Y.all('#modchoosercontainer .modoption input[type=radio]').each(function (modoption) {
                    var optiondiv = modoption.get('parentNode').get('parentNode');
                    if (modoption.get('checked')) {
                        optiondiv.addClass('selected');
                        // Add the sectionid to the URL
                        this.jumplink.set('value', modoption.get('value') + '&section=' + this.sectionid);

                        // Ensure that the form may be submitted
                        this.submitbutton.removeAttribute('disabled');

                        // Ensure that the radio remains focus so that
                        // keyboard navigation is still possible
                        modoption.focus();
                    } else {
                        optiondiv.removeClass('selected');
                    }
                }, this);
            }
        },
        {
            NAME : MODCHOOSERNAME,
            ATTRS : {
                // No attributes at present
            }
        });
        M.course = M.course || {};
        M.course.init_chooser = function(config) {
            return new MODCHOOSER(config);
        }
    },
    '@VERSION@', {
        requires:['base', 'overlay', 'moodle-enrol-notification']
    }
);
