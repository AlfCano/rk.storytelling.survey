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
		echo("if(!base::require(tidyr)){stop(" + i18n("Preview not available, because package tidyr is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(tidyr)\n");
	}	if(is_preview) {
		echo("if(!base::require(ggrepel)){stop(" + i18n("Preview not available, because package ggrepel is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(ggrepel)\n");
	}	if(is_preview) {
		echo("if(!base::require(lemon)){stop(" + i18n("Preview not available, because package lemon is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(lemon)\n");
	}	if(is_preview) {
		echo("if(!base::require(scales)){stop(" + i18n("Preview not available, because package scales is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(scales)\n");
	}	if(is_preview) {
		echo("if(!base::require(survey)){stop(" + i18n("Preview not available, because package survey is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(survey)\n");
	}	if(is_preview) {
		echo("if(!base::require(stringr)){stop(" + i18n("Preview not available, because package stringr is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(stringr)\n");
	}
}

function calculate(is_preview){
	// read in variables from dialog


	// the R code to be evaluated

    function getCleanName(id) {
        var raw = getValue(id);
        if (!raw || raw == "") return "NULL";
        var match = raw.match(/\[\[\"(.*?)\"\]\]/);
        if (match) return match[1];
        return raw.split("$").pop();
    }

    function getCleanArray(id) {
        var rawValue = getValue(id);
        if (!rawValue) return [];
        var raw = rawValue.split(/\n/).filter(function(s){return s != ""});
        return raw.map(function(item) {
            var match = item.match(/\[\[\"(.*?)\"\]\]/);
            return match ? match[1] : item.split("$").pop();
        });
    }
    
    function getThemeCode(prefix) {
        var txt_size = getValue(prefix + "_txt_size");
        var leg_pos = getValue(prefix + "_legend_pos");
        var x_ang = getValue(prefix + "_x_angle");
        
        var code = " + ggplot2::theme_minimal(base_size = " + txt_size + ")";
        code += " + ggplot2::theme(plot.title.position = \"plot\", legend.position = \"" + leg_pos + "\", legend.justification = \"left\", panel.grid.minor = ggplot2::element_blank(), panel.grid.major.x = ggplot2::element_blank())";
        code += " + ggplot2::theme(axis.title.y = ggplot2::element_text(angle = 0, vjust = 1.02, hjust = 0, color = \"gray40\"), axis.title.x = ggplot2::element_text(hjust = 0, color = \"gray40\"))";
        code += " + ggplot2::theme(axis.text.x = ggplot2::element_text(angle = " + x_ang + "))";
        return code;
    }

    function getSafeColor(id, defaultVal) {
        var c = getValue(id);
        if (!c || c === "") return defaultVal;
        return c;
    }
   
    var df = getValue("l_svyby"); var x = getCleanName("l_x"); var grp = getCleanName("l_grp");
    var est_cols = getCleanArray("l_est"); var se_cols = getCleanArray("l_se");
    var focus = getValue("l_focus_val"); var conf = getValue("l_conf") / 100;

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\n");
    echo("est_dat <- " + df + " %>% dplyr::mutate(rk_internal_id = dplyr::row_number())\n");
    
    var id_list = [x, grp, "rk_internal_id"].filter(function(v){return v != "NULL"}).map(function(v){return "\"" + v + "\""}).join(", ");
    var est_list = est_cols.map(function(v){return "\"" + v + "\""}).join(", ");
    var se_list = se_cols.map(function(v){return "\"" + v + "\""}).join(", ");

    echo("piv1 <- est_dat %>% dplyr::select(dplyr::all_of(c(" + id_list + ", " + est_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + est_list + ")), names_to = \"respuesta\", values_to = \"recuento\")\n");
    echo("piv2 <- est_dat %>% dplyr::select(dplyr::all_of(c(\"rk_internal_id\", " + se_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + se_list + ")), names_to = \"variable\", values_to = \"se\")\n");
    
    echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = stringr::str_remove(variable, \"^se\\\\.\"))\n");
    echo("piv3 <- dplyr::left_join(piv1, piv2, by = c(\"rk_internal_id\", \"respuesta\"))\n");
    echo("piv3[[\"" + x + "\"]] <- as.factor(piv3[[\"" + x + "\"]])\n");
    
    echo("focus_col <- \"" + getSafeColor("l_col_focus", "#941100") + "\"\n");
    var color_aes = (grp != "NULL") ? grp : "respuesta";

    echo("p <- ggplot2::ggplot(piv3, ggplot2::aes(x = " + x + ", y = recuento, color = " + color_aes + ", group = interaction(" + (grp != "NULL" ? grp + ", " : "") + "respuesta))) +\n");
    echo("  ggplot2::geom_ribbon(ggplot2::aes(ymin = recuento - ci_multiplier*se, ymax = recuento + ci_multiplier*se, fill = " + color_aes + "), color = NA, alpha = 0.2) +\n");
    echo("  ggplot2::geom_line(size = 1, na.rm = TRUE) +\n");
    echo("  ggplot2::geom_point(size = 2, na.rm = TRUE)\n");
    
    echo("lvls <- levels(factor(piv3[[\"" + color_aes + "\"]]))\n");
    echo("p <- p + ggplot2::scale_color_manual(values = setNames(ifelse(lvls == \"" + focus + "\", focus_col, \"gray80\"), lvls))\n");
    echo("p <- p + ggplot2::scale_fill_manual(values = setNames(ifelse(lvls == \"" + focus + "\", focus_col, \"gray90\"), lvls))\n");
    echo("p <- p + ggrepel::geom_text_repel(data = . %>% dplyr::group_by(" + color_aes + ") %>% dplyr::filter(as.numeric(factor(" + x + ")) == max(as.numeric(factor(" + x + ")))), ggplot2::aes(label = " + color_aes + "), nudge_x = 0.3, hjust = 0, fontface = \"bold\")\n");

    var xlab = getValue("l_xlab"); if(xlab) echo("p <- p + ggplot2::xlab(\"" + xlab + "\")\n");
    var ylab = getValue("l_ylab"); if(ylab) echo("p <- p + ggplot2::ylab(\"" + ylab + "\")\n");
    var tit = getValue("l_title"); if(tit) echo("p <- p + ggplot2::labs(title = \"" + tit + "\")\n");
    var sub = getValue("l_subtitle"); if(sub) echo("p <- p + ggplot2::labs(subtitle = \"" + sub + "\")\n");
    var cap = getValue("l_caption"); if(cap) echo("p <- p + ggplot2::labs(caption = \"" + cap + "\")\n");

    echo("p <- p " + getThemeCode("l") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\"gray40\"), legend.position = \"none\")\n");
    
    # SOLUTION: Use coord limits instead of scale limits to prevent data removal
    echo("y_vals <- c(piv3$recuento - ci_multiplier*piv3$se, piv3$recuento + ci_multiplier*piv3$se)\n");
    echo("y_lims <- range(y_vals[is.finite(y_vals)], na.rm=TRUE)\n");
    echo("if(length(y_lims) == 2) {\n");
    echo("  p <- p + lemon::coord_capped_cart(left = \"top\", ylim = y_lims)\n");
    echo("}\n");
  
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Tools (SWD) results")).print();	
	}
        if (is_preview) { 
            echo("print(p)\n"); 
        } else {
            var opts = [];
            opts.push("device.type=\"" + getValue("l_dev_type") + "\"");
            opts.push("width=" + getValue("l_dev_w"));
            opts.push("height=" + getValue("l_dev_h"));
            opts.push("res=" + getValue("l_dev_res"));
            opts.push("bg=\"" + getValue("l_dev_bg") + "\"");
            echo("rk.graph.on(" + opts.join(", ") + ")\n");
            echo("print(p)\n");
            echo("rk.graph.off()\n");
            echo("p_svy_line <- p\n");
        }
      
	if(!is_preview) {
		//// save result object
		// read in saveobject variables
		var lSave = getValue("l_save");
		var lSaveActive = getValue("l_save.active");
		var lSaveParent = getValue("l_save.parent");
		// assign object to chosen environment
		if(lSaveActive) {
			echo(".GlobalEnv$" + lSave + " <- p_svy_line\n");
		}	
	}

}

