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
		echo("if(!base::require(survey)){stop(" + i18n("Preview not available, because package survey is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(survey)\n");
	}	if(is_preview) {
		echo("if(!base::require(lemon)){stop(" + i18n("Preview not available, because package lemon is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(lemon)\n");
	}	if(is_preview) {
		echo("if(!base::require(scales)){stop(" + i18n("Preview not available, because package scales is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(scales)\n");
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
  
    var svy = getValue("b_svy"); var x = getColumnName(getValue("b_x")); var fill = getColumnName(getValue("b_fill")); var focus = getValue("b_focus_val");
    var freq = getValue("b_freq_type"); var pos = getValue("b_bar_pos");
    var ord = getValue("b_order_freq"); var inv = getValue("b_invert");

    echo("tab <- as.data.frame(survey::svytable(~" + x + "+" + fill + ", design = " + svy + "))\n");
    echo("tab <- tab %>% dplyr::group_by(" + x + ") %>% dplyr::mutate(Prop = Freq / sum(Freq)) %>% dplyr::ungroup()\n");
    
    if(ord == "1") { echo("tab[[\"" + x + "\"]] <- forcats::fct_reorder(factor(tab[[\"" + x + "\"]]), tab$Freq, .fun = sum)\n"); }
    if(inv == "1") { echo("tab[[\"" + x + "\"]] <- forcats::fct_rev(factor(tab[[\"" + x + "\"]]))\n"); }

    echo("focus_col <- \"" + getSafeColor("b_col_focus", "#941100") + "\"\n");
    echo("lvls <- unique(as.character(tab[[\"" + fill + "\"]]))\n");
    echo("fill_cols <- setNames(rep(\"gray85\", length(lvls)), lvls)\n");
    echo("if(\"" + focus + "\" %in% lvls) fill_cols[\"" + focus + "\"] <- focus_col\n");

    var y_aes = (freq == "abs") ? "Freq" : "Prop";
    echo("p <- ggplot2::ggplot(tab, ggplot2::aes(x = " + x + ", y = " + y_aes + ", fill = " + fill + ")) +\n");
    echo("  ggplot2::geom_col(position = \"" + pos + "\", width = 0.7, color = \"white\") +\n");
    echo("  ggplot2::scale_fill_manual(values = fill_cols) +\n");
    
    var label_val = (freq == "abs") ? "round(Freq, 1)" : "scales::percent(Prop, accuracy = 1)";
    echo("  ggplot2::geom_text(ggplot2::aes(label = " + label_val + "), position = ggplot2::position_" + pos + "(vjust = 0.5), color = \"white\", size = 4)\n");
    
    var labs_list = [];
    if(getValue("b_title")) labs_list.push("title = \"" + getValue("b_title") + "\"");
    if(getValue("b_subtitle")) labs_list.push("subtitle = \"" + getValue("b_subtitle") + "\"");
    if(getValue("b_caption")) labs_list.push("caption = \"" + getValue("b_caption") + "\"");
    if(getValue("b_xlab")) labs_list.push("x = \"" + getValue("b_xlab") + "\"");
    if(getValue("b_ylab")) labs_list.push("y = \"" + getValue("b_ylab") + "\"");
    var leg_t = getValue("b_legend_title"); if(leg_t) labs_list.push("fill = \"" + leg_t + "\"");
    if(labs_list.length > 0) echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\n");

    var y_fmt = (freq == "rel" || pos == "fill") ? "scales::percent_format()" : "ggplot2::waiver()";
    echo("p <- p " + getThemeCode("b") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\"gray40\")) + ggplot2::scale_y_continuous(labels = " + y_fmt + ", expand = c(0,0))\n");
    
    var coord_func = (getValue("b_flip") == "1") ? "lemon::coord_capped_flip" : "lemon::coord_capped_cart";
    echo("p <- p + " + coord_func + "(left = \"top\")\n");
  
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Bar Chart results")).print();	
	}
        if (is_preview) { 
            echo("print(p)\n"); 
        } else {
            var opts = [];
            opts.push("device.type=\"" + getValue("b_dev_type") + "\"");
            opts.push("width=" + getValue("b_dev_w"));
            opts.push("height=" + getValue("b_dev_h"));
            opts.push("res=" + getValue("b_dev_res"));
            opts.push("bg=\"" + getValue("b_dev_bg") + "\"");
            echo("rk.graph.on(" + opts.join(", ") + ")\n");
            echo("print(p)\n");
            echo("rk.graph.off()\n");
            echo("p_svy_bar <- p\n");
        }
      
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var bSave = getValue("b_save");
		var bSaveActive = getValue("b_save.active");
		var bSaveParent = getValue("b_save.parent");
		// assign object to chosen environment
		if(bSaveActive) {
			echo(".GlobalEnv$" + bSave + " <- p_svy_bar\n");
		}	
	}

}

