# -*- coding: utf-8 -*-
# Copyright (c) 2015, Alec Ruiz-Ramon and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class BoardColumn(Document):
	def get_docs_in_column(self, addl_filters):
		filters = {
	    	self.field_name: self.field_option,
        }
		# add'l filters not used, can be used for server-side filtering,
		# react filtering is better for non-sensitive data though.
		for key, value in addl_filters.iteritems():
			filters[key] = value

		# get a list of documents (just name though) in the column.
		# faster query would get_list with the fields we want
		docs = frappe.client.get_list(self.dt, filters=filters,
									  limit_page_length=None)
		# query each doc in the doc list
		full_list = []
		for doc in docs:
			full_list.append(frappe.client.get(self.dt, doc['name']))

		return self.prepare_docs_for_board(full_list)

	def prepare_docs_for_board(self, doc_list):
		"""Format docs - get the six card fields spec'd in column, and then
		dump entire doc in "doc" """
		data = []
		display_fields = self.get_display_fields()
	    # need to take display_field: field_name pairs & replace field_name with
	    # the field's value in the document.
	    # then, create return packet of full doc, and displayed doc
		for doc in doc_list:
			card_fields = {}
			for k, v in display_fields.iteritems():
				try:
					card_fields[k] = (v.replace("_", " "), doc[v])
				except:
					pass
			data.append({
				"doc": doc,
				"card_fields": card_fields
				})
		return data

	def get_display_fields(self):
	    """ Gets dict of display_field: doc_field pairs.
	    Gets Label:fieldname pairs from document spec'd in column,
	    and 'zips' with pairs of display_field:Label from board column"""

	    display_fields = [
	        "title_field", "first_subtitle", "second_subtitle",
	        "field_one", "field_two", "field_three"
	        ]
	    doc_fields = { field.label:field.fieldname for field in
	                   self.get_associated_doc_fields()}
	    col_dict = frappe.client.get(self)
	    board_fields = { k:v for k, v in col_dict.iteritems() if
	                     k in display_fields }
	    ret = {}
	    for k, v in board_fields.iteritems():
	        ret[k] = doc_fields[v]
	    return ret

	def get_associated_doc_fields(self):
	    meta = frappe.desk.form.meta.get_meta(self.dt)
	    return [field for field in meta.fields]

	def get_communication_feed(self, doc):
		communications = frappe.client.get_list(
			"Communication",
			fields=["user", "creation", "content"],
			filters={
				"reference_doctype": doc['doctype'],
				"reference_name": doc['name']}
		)
		return communications

	def get_subtitle(self):
		if self.column_subheading != "":
			frappe.msgprint(self.column_subheading)
			meta = frappe.desk.form.meta.get_meta(self.dt)
			return [field.fieldname for field in meta.fields if
					field.label == self.column_subheading][0]
		else:
			return None

	def get_subtitle_label(self):
		return self.column_subheading
