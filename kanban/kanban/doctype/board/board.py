# -*- coding: utf-8 -*-
# Copyright (c) 2015, Alec Ruiz-Ramon and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Board(Document):
	def get_board_data(self):
		""" Returns a list of columns in a Board document. """
		columns = self.get_all_children()
		return_data = {}
		for column in columns:
			return_data[column.column_title] = column.get_docs_in_column()

		return return_data
