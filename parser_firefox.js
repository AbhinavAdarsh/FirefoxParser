function load() {
	console.log("Parsing firefox profile:");
	// console.log(data);
	// console.log(data['profile']['threads']);
	var threads_profile = data['profile']['threads'];
	var markers = threads_profile[0]['markers'];
	var parse_data = markers['data'];
	var network_data = {}
	var parse_html_data = {}
	var paint_data = {}

	console.log("PARSE>>>",parse_data);

	// Parsing for networking
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
	console.log(network_data);

	// Parsing for "Parse HTML"
	var data_markers = data["markers"];
	for(var j = 0; j < data_markers.length; ++j) {
		var markers_data_dict = data_markers[j];
		//console.log(markers_data_dict)
		if(markers_data_dict != undefined && markers_data_dict["name"] === "Parse HTML") {
			// console.log(markers_data_dict);
			if(!(markers_data_dict["index"] in parse_html_data)) {
				parse_html_data[markers_data_dict["index"]] = {"index":markers_data_dict["index"]}
			}
			parse_html_data[markers_data_dict["index"]]["name"] = markers_data_dict["name"]
			parse_html_data[markers_data_dict["index"]]["startTime"] = markers_data_dict["start"]
			parse_html_data[markers_data_dict["index"]]["endTime"] = markers_data_dict["end"]
		}
	}
	console.log(parse_html_data);

	// Parsing for Paint
	for (var i = 0; i < parse_data.length; i++) {
		var paint_list = parse_data[i];
		var paint_dict = paint_list[2];

		if(paint_list.length > 0 && paint_dict != undefined && paint_dict["category"] === "Paint") {
			if(paint_dict["interval"] === "start") {
				if(!(paint_list[0] in paint_data)) {
					paint_data[paint_list[0]] = {"id":paint_list[0]}
					paint_data[paint_list[0]]["name"] = paint_dict["category"]
					paint_data[paint_list[0]]["startTime"] = paint_list[1]
				}
			} else if(paint_dict["interval"] === "end") {
				paint_data[paint_list[0]]["endTime"] = paint_list[1]
			}
		}
	}
	console.log(paint_data);
}
