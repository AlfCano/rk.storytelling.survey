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
	}	if(is_preview) {
		echo("if(!base::require(forcats)){stop(" + i18n("Preview not available, because package forcats is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(forcats)\n");
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
   
    var df = getValue("l_svyby_object");
    if(!df) return;
    var x = getColumnName(getValue("l_xaxis_var"));
    var grp = getColumnName(getValue("l_group_var"));
    var est_cols = getCleanArray("l_estimate_vars");
    var se_cols = getCleanArray("l_se_vars");
    var focus = getValue("l_focus_val");
    var conf = getValue("l_conf_level") / 100;
    var nudge = getValue("l_nudge_x");

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\n");
    echo("est_dat <- " + df + " %>% dplyr::mutate(rk_internal_id = dplyr::row_number())\n");

    // SAFE ID LIST CONSTRUCTION
    var id_vars = [];
    id_vars.push("\"" + x + "\"");
    if(grp && grp !== "") { id_vars.push("\"" + grp + "\""); }
    id_vars.push("\"rk_internal_id\"");
    var id_list = id_vars.join(", ");

    var est_list = est_cols.map(function(v){return "\"" + v + "\""}).join(", ");
    var se_list = se_cols.map(function(v){return "\"" + v + "\""}).join(", ");

    echo("piv1 <- est_dat %>% dplyr::select(dplyr::all_of(c(" + id_list + ", " + est_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + est_list + ")), names_to = \"respuesta\", values_to = \"recuento\")\n");
    echo("piv2 <- est_dat %>% dplyr::select(dplyr::all_of(c(\"rk_internal_id\", " + se_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + se_list + ")), names_to = \"variable\", values_to = \"se\")\n");

    if (est_cols.length == 1) { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = \"" + est_cols[0] + "\")\n"); }
    else { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = stringr::str_remove(variable, \"^se\\\\.\"))\n"); }

    echo("piv3 <- dplyr::left_join(piv1, piv2, by = c(\"rk_internal_id\", \"respuesta\"))\n");

    var clean_prefix = getValue("l_clean_legend_prefix");
    if (clean_prefix) { echo("piv3[[\"respuesta\"]] <- stringr::str_remove(piv3[[\"respuesta\"]], \"" + clean_prefix + "\")\n"); }

    echo("piv3[[\"" + x + "\"]] <- as.factor(piv3[[\"" + x + "\"]])\n");
    echo("focus_col <- \"" + getSafeColor("l_col_focus", "#941100") + "\"\n");

    var color_aes = (grp !== "") ? grp : "respuesta";
    var interaction_arg = (grp !== "") ? grp + ", respuesta" : "respuesta";

    echo("p <- ggplot2::ggplot(piv3, ggplot2::aes(x = " + x + ", y = recuento, color = " + color_aes + ", group = interaction(" + interaction_arg + "))) +\n");
    echo("  ggplot2::geom_ribbon(ggplot2::aes(ymin = recuento - ci_multiplier*se, ymax = recuento + ci_multiplier*se, fill = " + color_aes + "), color = NA, alpha = 0.2) +\n");
    echo("  ggplot2::geom_line(linewidth = 1, na.rm = TRUE) + ggplot2::geom_point(size = 2, na.rm = TRUE)\n");

    echo("lvls <- levels(factor(piv3[[\"" + color_aes + "\"]]))\n");
    echo("p <- p + ggplot2::scale_color_manual(values = setNames(ifelse(lvls == \"" + focus + "\", focus_col, \"gray80\"), lvls))\n");
    echo("p <- p + ggplot2::scale_fill_manual(values = setNames(ifelse(lvls == \"" + focus + "\", focus_col, \"gray90\"), lvls))\n");
    echo("p <- p + ggrepel::geom_text_repel(data = . %>% dplyr::group_by(" + color_aes + ") %>% dplyr::filter(as.numeric(factor(" + x + ")) == max(as.numeric(factor(" + x + ")))), ggplot2::aes(label = " + color_aes + "), nudge_x = " + nudge + ", hjust = 0, direction = \"y\", fontface = \"bold\")\n");
    echo("p <- p + ggplot2::scale_x_discrete(expand = ggplot2::expansion(mult = c(0.05, 0.25)))\n");

    echo("y_vals <- c(piv3$recuento - ci_multiplier*piv3$se, piv3$recuento + ci_multiplier*piv3$se)\n");
    echo("y_lims <- range(y_vals[is.finite(y_vals)], na.rm=TRUE)\n");
    echo("if(length(y_lims) == 2) { p <- p + lemon::coord_capped_cart(left = \"top\", ylim = c(y_lims[1]*0.95, y_lims[2]*1.05)) } else { p <- p + lemon::coord_capped_cart(left = \"top\") }\n");
   
      var labs_list = [];
      var custom_xlab = getValue("l_plot_xlab");
      var xlab_wrap = getValue("l_plot_xlab_wrap");
      var xlab_call;
      if (custom_xlab) { xlab_call = "\"" + custom_xlab + "\""; }
      else { xlab_call = "rk.get.label(" + getValue("l_xaxis_var") + ")"; }
      if (xlab_wrap && parseInt(xlab_wrap) > 0) {
          xlab_call = "scales::label_wrap(" + xlab_wrap + ")(" + xlab_call + ")";
      }
      labs_list.push("x = " + xlab_call);

      var custom_ylab = getValue("l_plot_ylab");
      var ylab_wrap = getValue("l_plot_ylab_wrap");
      if (custom_ylab) {
          var ylab_call = "\"" + custom_ylab + "\"";
          if (ylab_wrap && parseInt(ylab_wrap) > 0) {
              ylab_call = "scales::label_wrap(" + ylab_wrap + ")(" + ylab_call + ")";
          }
          labs_list.push("y = " + ylab_call);
      }

      var custom_legend_title = getValue("l_plot_legend_title");
      var legend_title_wrap_width = getValue("l_legend_title_wrap_width");
      var legend_title_call;
      if (custom_legend_title) { legend_title_call = "\"" + custom_legend_title + "\""; }
      else { legend_title_call = "\"" + "\""; }
      if (legend_title_wrap_width && parseInt(legend_title_wrap_width) > 0) {
          legend_title_call = "scales::label_wrap(" + legend_title_wrap_width + ")(" + legend_title_call + ")";
      }
      labs_list.push("color = " + legend_title_call);
      labs_list.push("fill = " + legend_title_call);

      if (getValue("l_plot_title")) { labs_list.push("title = \"" + getValue("l_plot_title") + "\""); }
      if (getValue("l_plot_subtitle")) { labs_list.push("subtitle = \"" + getValue("l_plot_subtitle") + "\""); }
      if (getValue("l_plot_caption")) { labs_list.push("caption = \"" + getValue("l_plot_caption") + "\""); }

      if (labs_list.length > 0) {
        echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\n");
      }

      echo("p <- p + ggplot2::theme_minimal(base_size = " + getValue("l_theme_base_size") + ")\n");

      var theme_list = [];
      theme_list.push("plot.title.position = \"plot\"");
      theme_list.push("panel.grid.minor = ggplot2::element_blank()");
      theme_list.push("panel.grid.major.x = ggplot2::element_blank()");
      theme_list.push("axis.line = ggplot2::element_line(color=\"gray40\")");
      theme_list.push("legend.position = \"" + getValue("l_theme_legend_pos") + "\"");

      var x_angle = getValue("l_theme_x_angle");
      var x_hjust = getValue("l_theme_x_hjust");
      var x_vjust = getValue("l_theme_x_vjust");
      if(x_angle != 0 || x_hjust != 0.5 || x_vjust != 0.5) {
          theme_list.push("axis.text.x = ggplot2::element_text(angle=" + x_angle + ", hjust=" + x_hjust + ", vjust=" + x_vjust + ")");
      }
      if(theme_list.length > 0) {
        echo("p <- p + ggplot2::theme(" + theme_list.join(", ") + ")\n");
      }

      var x_val_wrap = getValue("l_theme_x_val_wrap");
      if (x_val_wrap && parseInt(x_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_x_discrete(labels = scales::label_wrap(" + x_val_wrap + "))\n");
      }
      var y_val_wrap = getValue("l_theme_y_val_wrap");
      if (y_val_wrap && parseInt(y_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_y_continuous(labels = scales::label_wrap(" + y_val_wrap + "))\n");
      }
    
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Line Graph results")).print();	
	}
      if(!is_preview){
        var graph_options = [];
        graph_options.push("device.type=\"" + getValue("l_device_type") + "\"");
        graph_options.push("width=" + getValue("l_dev_width"));
        graph_options.push("height=" + getValue("l_dev_height"));
        graph_options.push("pointsize=10.0");
        graph_options.push("res=" + getValue("l_dev_res"));
        graph_options.push("bg=\"" + getValue("l_dev_bg") + "\"");
        echo("try(rk.graph.on(" + graph_options.join(", ") + "))\n");
      }
      echo("try(print(p))\n");
      if(!is_preview){
        echo("try(rk.graph.off())\n");
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

