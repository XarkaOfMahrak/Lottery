function readSomeLines(file, maxlines, forEachLine, onComplete) {
	var CHUNK_SIZE = 50000; // 50kb, arbitrarily chosen.
	var decoder = new TextDecoder();
	var offset = 0;
	var linecount = 0;
	var linenumber = 0;
	var results = '';
	var fr = new FileReader();
	fr.onload = function() {
		// Use stream:true in case we cut the file
		// in the middle of a multi-byte character
		results += decoder.decode(fr.result, {stream: true});
		var lines = results.split('\n');
		results = lines.pop(); // In case the line did not end yet.
		linecount += lines.length;

		if (linecount > maxlines) {
			// Read too many lines? Truncate the results.
			lines.length -= linecount - maxlines;
			linecount = maxlines;
		}

		for (var i = 0; i < lines.length; ++i) {
			forEachLine(lines[i] + '\n');
		}
		offset += CHUNK_SIZE;
		seek();
	};
	fr.onerror = function() {
		onComplete(fr.error);
	};
	seek();

	function seek() {
		if (linecount === maxlines) {
			// We found enough lines.
			onComplete(); // Done.
			return;
		}
		if (offset !== 0 && offset >= file.size) {
			// We did not find all lines, but there are no more lines.
			forEachLine(results); // This is from lines.pop(), before.
			onComplete(); // Done
			return;
		}
		var slice = file.slice(offset, offset + CHUNK_SIZE);
		fr.readAsArrayBuffer(slice);
	}
}