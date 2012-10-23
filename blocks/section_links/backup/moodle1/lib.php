<?php

/**
 * Provides support for the conversion of moodle1 backup to the moodle2 format
 *
 * @package    block_section_links
 * @copyright  2012 Paul Nicholls
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Block conversion handler for section_links
 */
class moodle1_block_section_links_handler extends moodle1_block_handler {
	public function get_paths() {
	    return array(
	        new convert_path('block', '/MOODLE_BACKUP/COURSE/BLOCKS/BLOCK/SECTION_LINKS'),
	    );
	}
}