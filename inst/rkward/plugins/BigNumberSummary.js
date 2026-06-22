// this code was generated using the rkwarddev package.
// perhaps don't make changes here, but in the rkwarddev script instead!

function preview(){
	preprocess(true);
	calculate(true);
	printout(true);
}

function preprocess(is_preview){
	// add requirements etc. here
	if(is_preview) {
		echo("if(!base::require(ggplot2)){stop(" + i18n("Preview not available, because package ggplot2 is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(ggplot2)\n");
	}
}

function calculate(is_preview){
	// read in variables from dialog


	// the R code to be evaluated

    function getColumnName(fullName) {
        if (!fullName) return "";
        var lastBracketPos = fullName.lastIndexOf("[[");
        if (lastBracketPos > -1) {
            var lastPart = fullName.substring(lastBracketPos);
            var match = lastPart.match(/\[\[\"(.*?)\"\]\]/);
            if (match) return match[1];
        }
        if (fullName.indexOf("$") > -1) return fullName.substring(fullName.lastIndexOf("$") + 1);
        return fullName;
    }

    function getCleanArray(id) {
        var rawValue = getValue(id);
        if (!rawValue) return [];
        var raw = rawValue.split(/\n/).filter(function(s){return s != ""});
        return raw.map(function(item) {
            return getColumnName(item);
        });
    }

    function getSafeColor(id, defaultVal) {
        var c = getValue(id);
        if (!c || c === "") return defaultVal;
        return c;
    }
  
    var val = getValue("bn_val"); var txt = getValue("bn_text");
    echo("focus_col <- \"" + getSafeColor("bn_col_focus", "#FF7F0E") + "\"\n");
    echo("p <- ggplot2::ggplot() + ggplot2::annotate(\"text\", x = 0, y = 0.2, label = \"" + val + "\", size = 40, fontface = \"bold\", color = focus_col) + ggplot2::annotate(\"text\", x = 0, y = -0.1, label = \"" + txt + "\", size = 8, color = \"gray40\") + ggplot2::xlim(-1, 1) + ggplot2::ylim(-0.5, 0.5)\n");
    var tit = getValue("bn_title"); if(tit) echo("p <- p + ggplot2::labs(title = \"" + tit + "\")\n");
    var sub = getValue("bn_subtitle"); if(sub) echo("p <- p + ggplot2::labs(subtitle = \"" + sub + "\")\n");
    echo("p <- p + ggplot2::theme_void(base_size = " + getValue("bn_txt_size") + ") + ggplot2::theme(plot.title.position = \"plot\", plot.title = ggplot2::element_text(hjust = 0, color = \"gray40\", face = \"bold\"), plot.subtitle = ggplot2::element_text(hjust = 0, color = \"gray40\"))\n");
  
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Big Number Summary results")).print();	
	}
      if(!is_preview){
        var graph_options = [];
        graph_options.push("device.type=\"" + getValue("bn_device_type") + "\"");
        graph_options.push("width=" + getValue("bn_dev_width"));
        graph_options.push("height=" + getValue("bn_dev_height"));
        graph_options.push("pointsize=10.0");
        graph_options.push("res=" + getValue("bn_dev_res"));
        graph_options.push("bg=\"" + getValue("bn_dev_bg") + "\"");
        echo("try(rk.graph.on(" + graph_options.join(", ") + "))\n");
      }
      echo("try(print(p))\n");
      if(!is_preview){
        echo("try(rk.graph.off())\n");
        echo("p_big_number <- p\n");
      }
    
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var bnSave = getValue("bn_save");
		var bnSaveActive = getValue("bn_save.active");
		var bnSaveParent = getValue("bn_save.parent");
		// assign object to chosen environment
		if(bnSaveActive) {
			echo(".GlobalEnv$" + bnSave + " <- p_big_number\n");
		}	
	}

}

