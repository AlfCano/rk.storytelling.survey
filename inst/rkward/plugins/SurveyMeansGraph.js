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
	}	if(is_preview) {
		echo("if(!base::require(scales)){stop(" + i18n("Preview not available, because package scales is not installed or cannot be loaded.") + ")}\n");
	} else {
		echo("require(scales)\n");
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
   
    var df = getValue("m_svyby_object");
    if(!df) return;
    var x = getColumnName(getValue("m_xaxis_var"));
    var est = getColumnName(getValue("m_estimate_vars"));
    var se = getColumnName(getValue("m_se_vars"));
    var focus = getValue("m_focus_val");
    var conf = getValue("m_conf_level") / 100;

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\n");
    echo("plot_data <- " + df + "\n");

    if (getValue("m_order_x_est") == "1") {
       echo("plot_data[[\"" + x + "\"]] <- suppressWarnings(forcats::fct_reorder(factor(as.character(plot_data[[\"" + x + "\"]]), ordered = FALSE), as.numeric(plot_data[[\"" + est + "\"]]), .fun = function(v) mean(v, na.rm = TRUE)))\n");
    } else {
       echo("plot_data[[\"" + x + "\"]] <- factor(as.character(plot_data[[\"" + x + "\"]]), ordered = FALSE)\n");
    }

    if (getValue("m_invert_order") == "1") {
       echo("plot_data[[\"" + x + "\"]] <- forcats::fct_rev(plot_data[[\"" + x + "\"]])\n");
    }

    echo("focus_col <- \"" + getSafeColor("m_col_focus", "#941100") + "\"\n");
    echo("p <- ggplot2::ggplot(plot_data, ggplot2::aes(x = " + x + ", y = " + est + ")) +\n");
    echo("  ggplot2::geom_point(ggplot2::aes(color = (" + x + " == \"" + focus + "\")), size = 5) +\n");
    echo("  ggplot2::geom_errorbar(ggplot2::aes(ymin = " + est + " - ci_multiplier*" + se + ", ymax = " + est + " + ci_multiplier*" + se + "), width = 0.2, color = \"black\") +\n");
    echo("  ggplot2::scale_color_manual(values = c(\"FALSE\" = \"gray80\", \"TRUE\" = focus_col)) +\n");
    echo("  ggplot2::geom_text(ggplot2::aes(label = round(" + est + ", 1)), vjust = -1.5, fontface = \"bold\")\n");

    if(getValue("m_cbox_flip") == "1") { echo("p <- p + ggplot2::coord_flip()\n"); }
    else { echo("p <- p + lemon::coord_capped_cart(left = \"top\")\n"); }
   
      var labs_list = [];
      var custom_xlab = getValue("m_plot_xlab");
      var xlab_wrap = getValue("m_plot_xlab_wrap");
      var xlab_call;
      if (custom_xlab) { xlab_call = "\"" + custom_xlab + "\""; }
      else { xlab_call = "rk.get.label(" + getValue("m_xaxis_var") + ")"; }
      if (xlab_wrap && parseInt(xlab_wrap) > 0) {
          xlab_call = "scales::label_wrap(" + xlab_wrap + ")(" + xlab_call + ")";
      }
      labs_list.push("x = " + xlab_call);

      var custom_ylab = getValue("m_plot_ylab");
      var ylab_wrap = getValue("m_plot_ylab_wrap");
      if (custom_ylab) {
          var ylab_call = "\"" + custom_ylab + "\"";
          if (ylab_wrap && parseInt(ylab_wrap) > 0) {
              ylab_call = "scales::label_wrap(" + ylab_wrap + ")(" + ylab_call + ")";
          }
          labs_list.push("y = " + ylab_call);
      }

      var custom_legend_title = getValue("m_plot_legend_title");
      var legend_title_wrap_width = getValue("m_legend_title_wrap_width");
      var legend_title_call;
      if (custom_legend_title) { legend_title_call = "\"" + custom_legend_title + "\""; }
      else { legend_title_call = "\"" + "\""; }
      if (legend_title_wrap_width && parseInt(legend_title_wrap_width) > 0) {
          legend_title_call = "scales::label_wrap(" + legend_title_wrap_width + ")(" + legend_title_call + ")";
      }
      labs_list.push("color = " + legend_title_call);
      labs_list.push("fill = " + legend_title_call);

      if (getValue("m_plot_title")) { labs_list.push("title = \"" + getValue("m_plot_title") + "\""); }
      if (getValue("m_plot_subtitle")) { labs_list.push("subtitle = \"" + getValue("m_plot_subtitle") + "\""); }
      if (getValue("m_plot_caption")) { labs_list.push("caption = \"" + getValue("m_plot_caption") + "\""); }

      if (labs_list.length > 0) {
        echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\n");
      }

      echo("p <- p + ggplot2::theme_minimal(base_size = " + getValue("m_theme_base_size") + ")\n");

      var theme_list = [];
      theme_list.push("plot.title.position = \"plot\"");
      theme_list.push("panel.grid.minor = ggplot2::element_blank()");
      theme_list.push("panel.grid.major.x = ggplot2::element_blank()");
      theme_list.push("axis.line = ggplot2::element_line(color=\"gray40\")");
      theme_list.push("legend.position = \"" + getValue("m_theme_legend_pos") + "\"");

      var x_angle = getValue("m_theme_x_angle");
      var x_hjust = getValue("m_theme_x_hjust");
      var x_vjust = getValue("m_theme_x_vjust");
      if(x_angle != 0 || x_hjust != 0.5 || x_vjust != 0.5) {
          theme_list.push("axis.text.x = ggplot2::element_text(angle=" + x_angle + ", hjust=" + x_hjust + ", vjust=" + x_vjust + ")");
      }
      if(theme_list.length > 0) {
        echo("p <- p + ggplot2::theme(" + theme_list.join(", ") + ")\n");
      }

      var x_val_wrap = getValue("m_theme_x_val_wrap");
      if (x_val_wrap && parseInt(x_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_x_discrete(labels = scales::label_wrap(" + x_val_wrap + "))\n");
      }
      var y_val_wrap = getValue("m_theme_y_val_wrap");
      if (y_val_wrap && parseInt(y_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_y_continuous(labels = scales::label_wrap(" + y_val_wrap + "))\n");
      }
    
}

function printout(is_preview){
	// read in variables from dialog


	// printout the results
	if(!is_preview) {
		new Header(i18n("Survey Means Graph results")).print();	
	}
      if(!is_preview){
        var graph_options = [];
        graph_options.push("device.type=\"" + getValue("m_device_type") + "\"");
        graph_options.push("width=" + getValue("m_dev_width"));
        graph_options.push("height=" + getValue("m_dev_height"));
        graph_options.push("pointsize=10.0");
        graph_options.push("res=" + getValue("m_dev_res"));
        graph_options.push("bg=\"" + getValue("m_dev_bg") + "\"");
        echo("try(rk.graph.on(" + graph_options.join(", ") + "))\n");
      }
      echo("try(print(p))\n");
      if(!is_preview){
        echo("try(rk.graph.off())\n");
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

