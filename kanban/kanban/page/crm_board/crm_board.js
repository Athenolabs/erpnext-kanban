frappe.pages['crm-board'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Loading...',
		single_column: true
	});

	wrapper.crm_board = new Kanban(page, wrapper);

	frappe.breadcrumbs.add("Kanban");
}

this.Kanban = Class.extend({
	init: function(page, wrapper) {
		var me = this;
		frappe.call({
			method: "kanban.kanban.board_methods.get_data",
			freeze: true,
			args: {
				"page_name": "crm-board"
			},
			callback: function(r){
				loadKanban(r.message);
			}
		});
	},
});
