<?php

/**
 * Provides support for the conversion of moodle1 backup to the moodle2 format
 *
 * @package    block_news_items
 * @copyright  2012 Paul Nicholls
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Block conversion handler for news_items
 */
class moodle1_block_news_items_handler extends moodle1_block_handler {
	public function get_paths() {
	    return array(
	        new convert_path('block', '/MOODLE_BACKUP/COURSE/BLOCKS/BLOCK/NEWS_ITEMS'),
	    );
	}
}