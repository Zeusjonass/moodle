/**
 * Based on editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	tinymce.create('tinymce.plugins.MoodleImagePlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceMoodleImage', function() {
				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(ed.selection.getNode(), 'class', '').indexOf('mceItem') != -1)
					return;

				ed.windowManager.open({
					file : url + '/image.htm',
					width : 480 + parseInt(ed.getLang('advimage.delta_width', 0)),
					height : 385 + parseInt(ed.getLang('advimage.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('image', {
				title : 'advimage.image_desc',
				cmd : 'mceMoodleImage'
			});

            ed.onInit.add(function() {
                ed.dom.bind(ed.getWin(), ['drop'], function(e) {
                    // Only handle the event if an image file was dropped in.
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length && /^image\//.test(e.dataTransfer.files[0].type)) {
                        e.preventDefault();
                        e.stopPropagation();
                        var editorId = tinyMCE.selectedInstance.editorId;
                        var options = M.editor_tinymce.filepicker_options[editorId]['image'];
                        var formData = new FormData();

                        formData.append('repo_upload_file', e.dataTransfer.files[0]);
                        formData.append('itemid', options.itemid);
                        // List of repositories is an object rather than an array.  This makes iteration more awkward.
                        var i=0;
                        while (true) {
                            if (options.repositories[++i] === undefined) {
                                // No more repos in list.  This is a problem, but we'll get an error back anyway so we'll handle it later.
                                break;
                            }
                            if (options.repositories[i].type === 'upload') {
                                formData.append('repo_id', options.repositories[i].id);
                                break;
                            }
                        }
                        formData.append('env', options.env);
                        formData.append('sesskey', M.cfg.sesskey);
                        formData.append('client_id', options.client_id);
                        formData.append('savepath', options.savepath);
                        formData.append('ctx_id', options.context.id);

                        // Insert spinner as a placeholder.
                        var timestamp = new Date().getTime();
                        var uploadid = 'moodleimage_' + Math.round(Math.random()*100000)+'-'+timestamp;
                        var args = {
                            src: M.util.image_url("i/loading_small", 'moodle'),
                            id: uploadid, 'class': 'mceNonEditable'
                        };
                        ed.execCommand('mceInsertContent', false, ed.dom.createHTML('img', args), {skip_undo : 1});
                        ed.undoManager.add();
                        ed.execCommand('mceRepaint');
                        ed.focus();

                        var xhr = new XMLHttpRequest();

                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    var result = JSON.parse(xhr.responseText);
                                    if (result) {
                                        if (result.error) {
                                            ed.remove(uploadid);
                                            return new M.core.ajaxException(result);
                                        }

                                        var file = result;
                                        if (result.event && result.event === 'fileexists') {
                                            // A file with this name is already in use here - rename to avoid conflict.
                                            // Chances are, it's a different image (stored in a different folder on the user's computer).
                                            // If the user wants to reuse an existing image, they can copy/paste it within the editor.
                                            file = result.newfile;
                                        }

                                        // Replace placeholder with actual image.
                                        var args = {
                                            src: file.url
                                        };
                                        ed.dom.replace(ed.dom.create('img', args), uploadid);
                                    }
                                } else {
                                    alert(M.util.get_string('servererror', 'moodle'));
                                    ed.remove(uploadid);
                                }
                            }
                        };

                        // Send the AJAX call.
                        xhr.open("POST", M.cfg.wwwroot + '/repository/repository_ajax.php?action=upload', true);
                        xhr.send(formData);

                        return false;
                    }
                });
            });
		},

		getInfo : function() {
			return {
				longname : 'Moodle image',
				author : 'Moodle.com - based on AdvImage by Moxiecode Systems AB',
				authorurl : 'http://moodle.org',
                infourl : 'http://moodle.org',
                version : '3.6.0' // Version of AdvImage plugin this plugin is based on.
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('moodleimage', tinymce.plugins.MoodleImagePlugin);
})();