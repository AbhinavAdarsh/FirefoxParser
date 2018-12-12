// "data" is a json object that contains the complete profile extracted by running profiler on Firefox

function load() {
	console.log("Parsing firefox profile:");
	var threads_profile = data['profile']['threads'];
	var markers = threads_profile[0]['markers'];
	var parse_data = markers['data'];
	var network_data = {}	// Contains parsed data for networking
	var parse_html_data = {}	// Contains parsed data for loading
	var paint_data = {}	// Contains parsed data for paint
	var css_data = [] // Contains parsed data for CSS objects
	var dom_content_data = {}	// Contains parsed data for DOM content
	var all_dict = {} // Contains all the combined information

	// Parsing for "Networking"
	for (var i = 0; i < parse_data.length; i++) {
		var my_dict = parse_data[i][2];

		if(my_dict != undefined && my_dict["type"] === "Network" && my_dict["status"] == "STATUS_STOP"){
			if(!(my_dict["id"] in network_data)){
				network_data[my_dict["id"]] = {"id":my_dict["id"]}
			}
			network_data[my_dict["id"]]["startTime"] = my_dict["requestStart"]
			network_data[my_dict["id"]]["endTime"] = my_dict["responseEnd"]
			network_data[my_dict["id"]]["url"] = my_dict["URI"]
		}
	}
	// console.log(network_data);
	
	var network_index = 0;
	for (var key in network_data) {
		all_dict["Networking_"+ String(network_index)] = network_data[key]
		network_index++;
	}

	// Parsing for Loading ("Parse HTML")
	var data_markers = data["markers"];
	for(var j = 0; j < data_markers.length; ++j) {
		var markers_data_dict = data_markers[j];
		if(markers_data_dict != undefined && markers_data_dict["name"] === "Parse HTML") {
			if(!(markers_data_dict["index"] in parse_html_data)) {
				parse_html_data[markers_data_dict["index"]] = {"index":markers_data_dict["index"]}
			}
			parse_html_data[markers_data_dict["index"]]["name"] = markers_data_dict["name"]
			parse_html_data[markers_data_dict["index"]]["startTime"] = markers_data_dict["start"]
			parse_html_data[markers_data_dict["index"]]["endTime"] = markers_data_dict["end"]
		}
	}
	// console.log(parse_html_data);
	
	var parse_index = 0;
	for (var key in parse_html_data) {
		all_dict["Loading_"+ String(parse_index)] = parse_html_data[key]
		parse_index++;
	}

	// Parsing for "Paint"
	for (var i = 0; i < parse_data.length; i++) {
		var paint_list = parse_data[i];
		var paint_dict = paint_list[2];

		if(paint_list.length > 0 && paint_dict != undefined && paint_dict["category"] === "Paint") {
			if(paint_dict["type"] === "tracing") {
				if(paint_dict["interval"] === "start") {
					if(!(paint_list[0] in paint_data)) {
						paint_data[paint_list[0]] = {"id":paint_list[0]}
						paint_data[paint_list[0]]["name"] = paint_dict["category"]
						paint_data[paint_list[0]]["startTime"] = paint_list[1]
					}
				} else if(paint_dict["interval"] === "end") {
					paint_data[paint_list[0]]["endTime"] = paint_list[1]
				}
			} else if(paint_dict["type"] === "Styles") {
					css_data.push({"id" : paint_list[0], 
									"type" : paint_dict["type"],
									"startTime": paint_dict["startTime"],
									"endTime" : paint_dict["endTime"],
									"category" : paint_dict["category"]
								  });
			}
		}
	}
	// console.log(paint_data);
	// console.log(css_data);
	for (var idx = 0; idx < css_data.length; ++idx) {
		all_dict["CSS_"+ String(idx)] = css_data[idx];
	}
	
	var paint_index = 0;
	for (var key in paint_data) {
		all_dict["Painting_"+ String(paint_index)] = paint_data[key]
		paint_index++;
	}

	// Parsing for DOM Content Loaded
	//var data_markers = data["markers"];
	for(var j = 0; j < data_markers.length; ++j) {
		var markers_data_dict_dom = data_markers[j];
		if(markers_data_dict_dom != undefined && markers_data_dict_dom["name"] === "DOMEvent") {
			if(!(markers_data_dict_dom["index"] in dom_content_data)) {
				dom_content_data[markers_data_dict_dom["index"]] = {"index":markers_data_dict_dom["index"]}
			}
			dom_content_data[markers_data_dict_dom["index"]]["name"] = markers_data_dict_dom["name"]
			dom_content_data[markers_data_dict_dom["index"]]["type"] = markers_data_dict_dom["type"]
			dom_content_data[markers_data_dict_dom["index"]]["startTime"] = markers_data_dict_dom["start"]
			dom_content_data[markers_data_dict_dom["index"]]["endTime"] = markers_data_dict_dom["end"]
		}
	}
	console.log(dom_content_data);

	// For the .js objects
	var parse_frames = data["frames"]
	var js_object_list = [];

	for(var k = 0; k < parse_frames.length; ++k) {
		if(parse_frames[k] != null) {
			js_object_dict = parse_frames[k];
			if(js_object_dict != undefined) {
				// console.log(js_oject_dict["source"]);
				js_object_list.push({"source": js_object_dict["source"], 
									"functionDisplayName": js_object_dict["functionDisplayName"],
									"parent":js_object_dict["parent"]}
									);
			}
		}
	}
	for (var idx = 0; idx < js_object_list.length; ++idx) {
		all_dict["Scripting_"+ String(idx)] = js_object_list[idx];
	}
	// console.log(js_object_list);
	console.log(all_dict);
}
