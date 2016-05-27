frappe.pages['crm-board'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'None',
		single_column: true
	});

	wrapper.conversion_rates = new Kanban(page, wrapper);

	frappe.breadcrumbs.add("Kanban");
}

this.Kanban = Class.extend({
	init: function(page, wrapper) {
		var me = this;
		frappe.call({
			method: "kanban.kanban.board_methods.get_data",
			args: {
				"page_name": "crm-board"
			},
			callback: function(r){
				console.log("loading....")
				load_my_kanban(r.message);
				// console.log(r.message)
			}
		});
			console.log("success")
			$(".offcanvas-container").append("<div id='canvas'></div>")
			//$("#canvas").replaceWith(frappe.render_template("/assets/kanban/prius/index.html"));

	},

});
