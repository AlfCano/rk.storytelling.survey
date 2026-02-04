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
            var lastBracketPos = item.lastIndexOf("[[");
            if (lastBracketPos > -1) {
                var lastPart = item.substring(lastBracketPos);
                var match = lastPart.match(/\[\[\"(.*?)\"\]\]/);
                if (match) { return match[1]; }
            }
            return item.indexOf("$") > -1 ? item.substring(item.lastIndexOf("$") + 1) : item;
        });
    }
    
    function getThemeCode(prefix) {
        var txt_size = getValue(prefix + "_txt_size");
        var x_ang = getValue(prefix + "_x_angle");
        var y_ang = getValue(prefix + "_y_angle");
        var x_t_ang = getValue(prefix + "_x_title_angle");
        var y_t_ang = getValue(prefix + "_y_title_angle");
        var show_leg = getValue(prefix + "_show_legend");
        var leg_pos = getValue(prefix + "_legend_pos");
        
        var y_vjust = (y_t_ang == 0) ? "1.02" : "0.5";
        var y_hjust = (y_t_ang == 0) ? "0" : "0.5";

        var code = " + ggplot2::theme_minimal(base_size = " + txt_size + ")";
        code += " + ggplot2::theme(plot.title.position = \"plot\", legend.justification = \"left\", panel.grid.minor = ggplot2::element_blank(), panel.grid.major.x = ggplot2::element_blank())";
        
        if (show_leg == "1") {
            code += " + ggplot2::theme(legend.position = \"" + leg_pos + "\")";
        } else {
            code += " + ggplot2::theme(legend.position = \"none\")";
        }

        code += " + ggplot2::theme(axis.title.y = ggplot2::element_text(angle = " + y_t_ang + ", vjust = " + y_vjust + ", hjust = " + y_hjust + ", color = \"gray40\"), axis.title.x = ggplot2::element_text(angle = " + x_t_ang + ", hjust = 0, color = \"gray40\"))";
        code += " + ggplot2::theme(axis.text.x = ggplot2::element_text(angle = " + x_ang + "), axis.text.y = ggplot2::element_text(angle = " + y_ang + "))";
        return code;
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
        if (is_preview) { 
            echo("print(p)\n"); 
        } else {
            var opts = [];
            opts.push("device.type=\"" + getValue("bn_dev_type") + "\"");
            opts.push("width=" + getValue("bn_dev_w"));
            opts.push("height=" + getValue("bn_dev_h"));
            opts.push("res=" + getValue("bn_dev_res"));
            opts.push("bg=\"" + getValue("bn_dev_bg") + "\"");
            echo("rk.graph.on(" + opts.join(", ") + ")\n");
            echo("print(p)\n");
            echo("rk.graph.off()\n");
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

