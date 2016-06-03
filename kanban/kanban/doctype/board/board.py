# -*- coding: utf-8 -*-
# Copyright (c) 2015, Alec Ruiz-Ramon and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

import datetime
import json


class Board(Document):
    def get_board_data(self):
        """ Returns a list of columns and cards in a Board document. """
        # get children (built-in from Document). since there are two child
        # tables, use a list comprehension to filter into columns and filters
        children = self.get_all_children()
        columns = [entry for entry in children if entry.doctype == "Board Column"]
        filters = [entry for entry in children if entry.doctype == "Board Filter"]

        lists = []
        cards = []

        # outermost iteration covers creation of lists. essentially converting
        # the Board Column doctype into a React-friendly data format.

        # inner iteration (doc in doclist) creates a React-friendly data format
        # for each card

        # subtitle is a field in board column, some ugly logic to determine
        # whether or not to compute a sum for this field that ends up at the
        # top of the column
        for idx, column in enumerate(columns):
            if column.get_subtitle_label() != None:
                subtitle = column.get_subtitle()
            else:
                subtitle = None
            doclist = column.get_docs_in_column()
            subtitle_sum = 0
            for doc in doclist:
                url = "desk#Form/" + doc['doc']['doctype'] + '/' + doc['doc']['name']
                cards.append({
                    'parentList': idx,
                    'doc': doc['doc'],
                    'title': doc['card_fields']['title_field'][1],
                    'descr_1': make_description(
                        doc['card_fields']['first_subtitle'][1],
                        doc['card_fields']['first_subtitle'][0],
                        doc['doc']['doctype']
                    ),
                    'descr_2': make_description(
                        doc['card_fields']['second_subtitle'][1],
                        doc['card_fields']['second_subtitle'][0],
                        doc['doc']['doctype']
                    ),
                    'communications': column.get_communication_feed(doc['doc']),
                    'url': url,
                })
                if subtitle != None:
                    subtitle_sum += int(doc['doc'][subtitle])
            lists.append({
                'id': idx,
                'title': column.column_title,
                'description': make_description(
                    subtitle_sum, column.get_subtitle_label(), column.dt
                ),
                'filters': {}
            })
        return { 'lists': lists, 'cards': cards }
        # when filters are complete:
        # return { 'lists': lists, 'cards': cards, 'filters': filters }


def make_modal_form(url):
    """If we want to render the doc's view for the modal on the server side"""
    # make our own template - scripting doesn't work, so no buttons.
    template = frappe.render_template(
        'kanban/templates/doc_modal.html', {'url': url}
        )
    return template


def make_description(value, label, doctype):
    """Format a description field into a label-value pair for rendering"""
    if label != None:
        field = get_field_meta(label.title(), doctype)
        ret = {'label': label.title(),
            'value': str(frappe.format_value(value, field))}
    else:
        ret = {'label': '', 'value': ''}
    return ret


def get_field_meta(label, doctype):
    """Get meta-info of a field.
    Helpful to convert/compare field label (i.e. Person Name) to fieldname
    (person_name), get field type (date, data, select), and so on"""
    meta = frappe.desk.form.meta.get_meta(doctype)
    try:
        field = [field for field in meta.fields if
			     field.label == label][0]
    except:
        field = None
    return field
