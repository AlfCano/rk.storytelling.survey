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
	}	if(is_preview) {
		echo("if(!base::require(dplyr)){stop(" + i18n("Preview not available, because package dplyr is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(dplyr)\n");
	}	if(is_preview) {
		echo("if(!base::require(lemon)){stop(" + i18n("Preview not available, because package lemon is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(lemon)\n");
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
   
    var df = getValue("m_svyby"); var x = getColumnName(getValue("m_x")); var est = getColumnName(getValue("m_est")); var se = getColumnName(getValue("m_se"));
    var focus = getValue("m_focus_val");
    echo("plot_data <- " + df + "\n");
    echo("focus_col <- \"" + getSafeColor("m_col_focus", "#941100") + "\"\n");
    echo("p <- ggplot2::ggplot(plot_data, ggplot2::aes(x = reorder(" + x + ", " + est + "), y = " + est + ")) +\n");
    echo("  ggplot2::geom_point(ggplot2::aes(color = (" + x + " == \"" + focus + "\")), size = 5) +\n");
    echo("  ggplot2::geom_errorbar(ggplot2::aes(ymin = " + est + " - 1.96*" + se + ", ymax = " + est + " + 1.96*" + se + "), width = 0.2, color = \"black\") +\n");
    echo("  ggplot2::scale_color_manual(values = c(\"FALSE\" = \"gray80\", \"TRUE\" = focus_col)) +\n");
    echo("  ggplot2::geom_text(ggplot2::aes(label = round(" + est + ", 1)), vjust = -1.5, fontface = \"bold\")\n");
    
    var labs_list = [];
    if(getValue("m_title")) labs_list.push("title = \"" + getValue("m_title") + "\"");
    if(getValue("m_subtitle")) labs_list.push("subtitle = \"" + getValue("m_subtitle") + "\"");
    if(getValue("m_caption")) labs_list.push("caption = \"" + getValue("m_caption") + "\"");
    if(getValue("m_xlab")) labs_list.push("x = \"" + getValue("m_xlab") + "\"");
    if(getValue("m_ylab")) labs_list.push("y = \"" + getValue("m_ylab") + "\"");
    var leg_t = getValue("m_legend_title"); if(leg_t) labs_list.push("color = \"" + leg_t + "\"");
    if(labs_list.length > 0) echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\n");

    echo("p <- p " + getThemeCode("m") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\"gray40\")) + lemon::coord_capped_cart(left = \"top\")\n");
  
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Means Graph results")).print();	
	}
        if (is_preview) { 
            echo("print(p)\n"); 
        } else {
            var opts = [];
            opts.push("device.type=\"" + getValue("m_dev_type") + "\"");
            opts.push("width=" + getValue("m_dev_w"));
            opts.push("height=" + getValue("m_dev_h"));
            opts.push("res=" + getValue("m_dev_res"));
            opts.push("bg=\"" + getValue("m_dev_bg") + "\"");
            echo("rk.graph.on(" + opts.join(", ") + ")\n");
            echo("print(p)\n");
            echo("rk.graph.off()\n");
            echo("p_svy_means <- p\n");
        }
      
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var mSave = getValue("m_save");
		var mSaveActive = getValue("m_save.active");
		var mSaveParent = getValue("m_save.parent");
		// assign object to chosen environment
		if(mSaveActive) {
			echo(".GlobalEnv$" + mSave + " <- p_svy_means\n");
		}	
	}

}

