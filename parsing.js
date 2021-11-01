const parse_curl = (script) => {
	function substring(s, a, b) {
		var p = s.indexOf(a) + a.length;
		return s.substring(p, s.indexOf(b, p));
	}

	const parse_headers = (script) => {
		let lines = script.split("\n");
		let headers = {};
		for (let i = 0; i < lines.length; ++i) {
			let line = lines[i].trim();
			let is_header = line.includes("-H");
			if (is_header) {
				// Removes unnecessary thing from line
				let clean_line = line.replace("-H '", "").replace("'", "");
				let vals = clean_line.split(":");
				let key = vals[0].trim();
				// To bypass https:// breaking before the //
				let full_key = ": " + key;
				let value = clean_line.replace(key, "").trim();
				// Cleans the left over ": " at the start of the string
				value = value.replace(": ", "");
				headers[key] = value;
			}
		}
		return headers;
	};

	script = script.replace("\\", "");
	let method = script.includes("--data-raw") ? "POST" : "GET";

	if (method == "POST") {
		var data = substring(script, "--data-raw '", "'");
		var headers_space = ", ";
	} else {
		var data = "";
		var headers_space = "";
	}

	let output = "";
	let url = substring(script, "curl '", "'");
	let headers = parse_headers(script);

	// Puts the headers into the output string
	let headers_cleaned = JSON.stringify(headers, null, 4);
	let headers_string = `  let headers = ${headers_cleaned}\n`;

	let request_string = `
    const response = await axios({
        url: "${url}",
        method: "${method}",
        headers: headers${headers_space}
`;
	if (data !== "") {
		var data_string = `    data: "${data}"\n`;
	} else {
		var data_string = "";
	}

	const function_start_string = `async function ${method.toLowerCase()}Request() {\n`;
	output += function_start_string;
	output += headers_string;
	output += request_string;
	output += data_string;
	output += "   })\n";
	output += "}";

	return output;
};
