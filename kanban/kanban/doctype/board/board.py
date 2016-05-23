# -*- coding: utf-8 -*-
# Copyright (c) 2015, Alec Ruiz-Ramon and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Board(Document):
	def get_board_data(self):
		""" Returns a list of columns and cards in a Board document. """
		columns = self.get_all_children()
		lists = []
		cards = []
		filters = {
			'owner': 'alejandro.ruiz_ramon@energychoice.com'
		}
		for idx, column in enumerate(columns):
			lists.append({
				'id': idx,
				'title': column.column_title
				})
			doclist = column.get_docs_in_column(filters)
			for doc in doclist:
				cards.append({
					'parentList': idx,
					'doc': doc['doc'],
					'title': doc['card_fields']['title_field'][1],
					'descr_1': self.format_descr(
						doc['card_fields']['first_subtitle']
						),
					'descr_2': self.format_descr(
						doc['card_fields']['second_subtitle']
						),
					'communications': column.get_communication_feed(doc['doc'])
					})
		return_data = {
			'lists': lists,
			'cards': cards
		}
		return return_data

	def format_descr(self, kvpair):
		return (str(kvpair[0]).replace("_", " ").title() +
				" - " + str(kvpair[1]))
