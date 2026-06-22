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
	}	if(is_preview) {
		echo("if(!base::require(forcats)){stop(" + i18n("Preview not available, because package forcats is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(forcats)\n");
	}	if(is_preview) {
		echo("if(!base::require(stringr)){stop(" + i18n("Preview not available, because package stringr is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(stringr)\n");
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
  
    var svy = getValue("b_svy_object");
    if(!svy) return;
    var x = getColumnName(getValue("b_xaxis_var")); 
    var fill = getColumnName(getValue("b_fill_var")); 
    var focus = getValue("b_focus_val");
    var freq = getValue("b_freq_type"); 
    var pos = getValue("b_bar_pos");

    echo("tab <- as.data.frame(survey::svytable(~" + x + "+" + fill + ", design = " + svy + "))\n");
    echo("tab <- tab %>% dplyr::group_by(" + x + ") %>% dplyr::mutate(Prop = Freq / sum(Freq)) %>% dplyr::ungroup()\n");

    if (getValue("b_order_x_est") == "1") { 
        echo("tab[[\"" + x + "\"]] <- forcats::fct_reorder(as.factor(tab[[\"" + x + "\"]]), tab$Freq, .fun = sum)\n"); 
    } else {
        echo("tab[[\"" + x + "\"]] <- as.factor(tab[[\"" + x + "\"]])\n");
    }
    if (getValue("b_invert_order") == "1") { 
        echo("tab[[\"" + x + "\"]] <- forcats::fct_rev(tab[[\"" + x + "\"]])\n"); 
    }

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

    var y_fmt = (freq == "rel" || pos == "fill") ? "scales::percent_format()" : "ggplot2::waiver()";
    echo("p <- p + ggplot2::scale_y_continuous(labels = " + y_fmt + ", expand = c(0,0))\n");

    if(getValue("b_cbox_flip") == "1") { echo("p <- p + lemon::coord_capped_flip(left = \"top\")\n"); }
    else { echo("p <- p + lemon::coord_capped_cart(left = \"top\")\n"); }
  
      var labs_list = [];
      var custom_xlab = getValue("b_plot_xlab");
      var xlab_wrap = getValue("b_plot_xlab_wrap");
      var xlab_call;
      if (custom_xlab) { xlab_call = "\"" + custom_xlab + "\""; }
      else { xlab_call = "rk.get.label(" + getValue("b_xaxis_var") + ")"; }
      if (xlab_wrap && parseInt(xlab_wrap) > 0) {
          xlab_call = "scales::label_wrap(" + xlab_wrap + ")(" + xlab_call + ")";
      }
      labs_list.push("x = " + xlab_call);

      var custom_ylab = getValue("b_plot_ylab");
      var ylab_wrap = getValue("b_plot_ylab_wrap");
      if (custom_ylab) {
          var ylab_call = "\"" + custom_ylab + "\"";
          if (ylab_wrap && parseInt(ylab_wrap) > 0) {
              ylab_call = "scales::label_wrap(" + ylab_wrap + ")(" + ylab_call + ")";
          }
          labs_list.push("y = " + ylab_call);
      }

      var custom_legend_title = getValue("b_plot_legend_title");
      var legend_title_wrap_width = getValue("b_legend_title_wrap_width");
      var legend_title_call;
      if (custom_legend_title) { legend_title_call = "\"" + custom_legend_title + "\""; }
      else { legend_title_call = "\"" + "\""; }
      if (legend_title_wrap_width && parseInt(legend_title_wrap_width) > 0) {
          legend_title_call = "scales::label_wrap(" + legend_title_wrap_width + ")(" + legend_title_call + ")";
      }
      labs_list.push("color = " + legend_title_call);
      labs_list.push("fill = " + legend_title_call);

      if (getValue("b_plot_title")) { labs_list.push("title = \"" + getValue("b_plot_title") + "\""); }
      if (getValue("b_plot_subtitle")) { labs_list.push("subtitle = \"" + getValue("b_plot_subtitle") + "\""); }
      if (getValue("b_plot_caption")) { labs_list.push("caption = \"" + getValue("b_plot_caption") + "\""); }

      if (labs_list.length > 0) {
        echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\n");
      }

      echo("p <- p + ggplot2::theme_minimal(base_size = " + getValue("b_theme_base_size") + ")\n");
      
      var theme_list = [];
      theme_list.push("plot.title.position = \"plot\"");
      theme_list.push("panel.grid.minor = ggplot2::element_blank()");
      theme_list.push("panel.grid.major.x = ggplot2::element_blank()");
      theme_list.push("axis.line = ggplot2::element_line(color=\"gray40\")");
      theme_list.push("legend.position = \"" + getValue("b_theme_legend_pos") + "\"");
      
      var x_angle = getValue("b_theme_x_angle");
      var x_hjust = getValue("b_theme_x_hjust");
      var x_vjust = getValue("b_theme_x_vjust");
      if(x_angle != 0 || x_hjust != 0.5 || x_vjust != 0.5) {
          theme_list.push("axis.text.x = ggplot2::element_text(angle=" + x_angle + ", hjust=" + x_hjust + ", vjust=" + x_vjust + ")");
      }
      if(theme_list.length > 0) {
        echo("p <- p + ggplot2::theme(" + theme_list.join(", ") + ")\n");
      }

      var x_val_wrap = getValue("b_theme_x_val_wrap");
      if (x_val_wrap && parseInt(x_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_x_discrete(labels = scales::label_wrap(" + x_val_wrap + "))\n");
      }
      var y_val_wrap = getValue("b_theme_y_val_wrap");
      if (y_val_wrap && parseInt(y_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_y_continuous(labels = scales::label_wrap(" + y_val_wrap + "))\n");
      }
    
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Bar Chart results")).print();	
	}
      if(!is_preview){
        var graph_options = [];
        graph_options.push("device.type=\"" + getValue("b_device_type") + "\"");
        graph_options.push("width=" + getValue("b_dev_width"));
        graph_options.push("height=" + getValue("b_dev_height"));
        graph_options.push("pointsize=10.0");
        graph_options.push("res=" + getValue("b_dev_res"));
        graph_options.push("bg=\"" + getValue("b_dev_bg") + "\"");
        echo("try(rk.graph.on(" + graph_options.join(", ") + "))\n");
      }
      echo("try(print(p))\n");
      if(!is_preview){
        echo("try(rk.graph.off())\n");
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

