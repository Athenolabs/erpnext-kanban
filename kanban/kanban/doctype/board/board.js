// Copyright (c) 2016, Alec Ruiz-Ramon and contributors
// For license information, please see license.txt

frappe.ui.form.on("Board", "onload", function(doc, cdt, cdn){ //onload for testing
	var doc = locals[cdt][cdn]
	frappe.call({
		method: "kanban.kanban.board_methods.get_columns",
		args: {
			"doc" : doc
		},
   	callback: function(r){
		  console.log(r.message) // log for now, since in testing
	  }
  })
});

frappe.ui.form.on("Board Column", "dt", function(doc, cdt, cdn){
	var doc = locals[cdt][cdn]
	frappe.call({
		method: "kanban.kanban.board_methods.get_select_fields",
		args: {
			"doc": doc
		},
		callback: function(r){
			var chosen_field = frappe.prompt(
				{label: "Field Name", fieldtype: "Select", options: r.message},
				function(data) {
				  console.log(data.field_name)
			    doc.field_name = data.field_name;
					cur_frm.refresh();
					frappe.call({
						method: "kanban.kanban.board_methods.get_field_options",
						args: {
							"doc": doc,
							"chosen_field": doc.field_name
						},
						callback: function(r){
							console.log(r.message)
							var chosen_option = frappe.prompt(
								{label: "Field Option", fieldtype: "Select",
								options: r.message},
								function(data) {
									console.log(data.field_option);
									doc.field_option = data.field_option;
									cur_frm.refresh();
								})
						}
				})
			});
		}
	})
});

frappe.ui.form.on("Board Column", "set_up_fields", function(doc, cdt, cdn){
	var doc = locals[cdt][cdn]
	frappe.call({
		method: "kanban.kanban.board_methods.get_all_fields",
		args: {
			"doc": doc
		},
		callback: function(r){
			var fields_dict = frappe.prompt([
				{ label: "Title Field", fieldtype: "Select",
				  name: "title_field", options: r.message },
				{ label: "First Subtitle", fieldtype: "Select",
				  name: "first_subtitle", options: r.message },
				{ label: "Second Subtitle", fieldtype: "Select",
				  name: "second_subtitle", options: r.message },
				{ label: "Field One", fieldtype: "Select",
				  name: "field_one", options: r.message },
				{ label: "Field Two", fieldtype: "Select",
			  	name: "field_two", options: r.message },
				{ label: "Field Three", fieldtype: "Select",
				  name: "field_three", options: r.message }
				],
			function(data) {
				console.log(data);
				doc.title_field = data.title_field;
				doc.first_subtitle = data.first_subtitle;
				doc.second_subtitle = data.second_subtitle;
				doc.field_one = data.field_one;
				doc.field_two = data.field_two;
				doc.field_three = data.field_three;
				cur_frm.refresh();
				}
			)
		}
	})
});
