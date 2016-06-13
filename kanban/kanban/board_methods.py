import frappe
import json

from frappe.async import emit_via_redis
from frappe.model.mapper import get_mapped_doc

# use this to get data on a board. returns react-friendly dataset
@frappe.whitelist()
def get_data(page_name):
    page = frappe.client.get("Page", page_name)
    doc_name = frappe.get_list(
        "Board", filters={"page_name": page_name}, ignore_permissions=True
        )[0]
    doc = frappe.get_doc("Board", doc_name['name'])
    return doc.get_board_data()


def console_post(update):
    message = "console.log(" + json.dumps(update) + ")"
    frappe.emit_js(message)


# TODO : find if there is an instance of the board before trying to update card
def update_card(doc, method):
    columns = frappe.client.get_list(
        "Board Column",
        filters={"dt": doc.doctype},
        fields=['name', 'parent']
        )
    if (len(columns) > 0):
        find_board(doc, columns)


def find_board(doc, columns):
    parents = []
    for column in columns:
        if column['parent'] not in parents:
            parents.append(column['parent'])
    for parent in parents:
        board = frappe.get_doc("Board", parent)
        board.update_card(doc.as_dict())



# unused
@frappe.whitelist()
def move_card(from_column, to_column, card):
    """ Moves a card from one column to another. Two cases:
    1. Movement within the same doctype [ex Lead moving from Open to Interested].
    2. Movement creates  [e.g. Lead to Opportunity]
        Update status of document in from_column, create document in to_column.
    """
    if from_column['dt'] == to_column['dt']:
        doc = update_status(to_column['dt'], card['name'],
                            to_column['field_name'], to_column['field_option'])
    elif from_column['dt'] != to_column['dt']:
        # should we have exit_status in the board_column document?
        # pros: makes this method more modular
        # cons: makes users have to do more input / thinking

        old_doc = update_status(from_column['dt'], card['name'],
                            from_column['field_name'], from_column['exit_status'])
        new_doc = make_new_doc(from_column, to_column, card)
    # else
        # figure out what happened / error

    # log analytics? could create burndown charts, etc. based on boards.
    # docs track creation and modification dates, but would need to add things
    # such as status updated on/by, oppt. date pushed back, etc.

    # this could also be done in the framework rather than the board...


def update_status(doctype, doc, status_field, new_status):
    """ Sets the status of a document """
    frappe.client.set_value(doctype, doc, status_field, new_status)


def make_new_doc(from_column, to_column, card):
    table_map = {from_column['dt']:
                    {   "doctype": to_column['dt'],
# Is the field map needed? Will test.
#                        "field_map": {
#                            "lead_name": "prospect_name",
#                        }
                    }
                }
    doc = get_mapped_doc(from_column['dt'], card['name'], table_map)
    doc.save() # Need to test. Should work, save is a classmethod


def get_fields(doctype):
    meta = frappe.desk.form.meta.get_meta(doctype)
    return [field for field in meta.fields]


@frappe.whitelist()
def get_all_fields(doc):
    doc = json.loads(doc)
    fields = get_fields(doc['dt'])
    return [name.label for name in fields]


@frappe.whitelist()
def get_select_fields(doc):
    doc = json.loads(doc)
    fields = get_fields(doc['dt'])
    return [name.label for name in fields if name.fieldtype == 'Select']


@frappe.whitelist()
def get_field_options(doc, chosen_field):
    doc = json.loads(doc)
    meta = frappe.desk.form.meta.get_meta(doc['dt'])
    fields = [field for field in meta.fields]
    options = [field.options for field in fields if field.label == chosen_field][0]
    return options
