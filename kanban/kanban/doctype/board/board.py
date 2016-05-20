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
		for idx, column in enumerate(columns):
			lists.append({
				'id': idx,
				'title': column.column_title
				})
			doclist = column.get_docs_in_column()
			for doc in doclist:
				cards.append({
					'parentList': idx,
					'doc': doc['doc'],
					'title': doc['doc']['name'],
					'description': doc['doc']['email_id']
					})

		return_data = {
			'lists': lists,
			'cards': cards
		}
		return return_data
