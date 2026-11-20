local({
  # =========================================================================================
  # 1. Package Definition and Metadata
  # =========================================================================================
  require(rkwarddev)
  rkwarddev.required("0.10-3")

  package_about <- rk.XML.about(
    name = "rk.storytelling.survey",
    author = person(
      given = "Alfonso", family = "Cano",
      email = "alfonso.cano@correo.buap.mx",
      role = c("aut", "cre")
    ),
    about = list(
      desc = "SWD principles applied to svyby objects with robust coordinate scaling and big numbers.",
      version = "0.1.2",
      url = "https://github.com/AlfCano/rk.storytelling.survey",
      license = "GPL (>= 3)"
    )
  )

  h_list <- list("Survey", "Graphs", "Storytelling with Data")

  # =========================================================================================
  # 2. Reusable UI Components (Generators) & JS Helpers
  # =========================================================================================

  js_helpers <- '
    function getColumnName(fullName) {
        if (!fullName) return "";
        var lastBracketPos = fullName.lastIndexOf("[[");
        if (lastBracketPos > -1) {
            var lastPart = fullName.substring(lastBracketPos);
            var match = lastPart.match(/\\[\\[\\"(.*?)\\"\\]\\]/);
            if (match) return match[1];
        }
        if (fullName.indexOf("$") > -1) return fullName.substring(fullName.lastIndexOf("$") + 1);
        return fullName;
    }

    function getCleanArray(id) {
        var rawValue = getValue(id);
        if (!rawValue) return [];
        var raw = rawValue.split(/\\n/).filter(function(s){return s != ""});
        return raw.map(function(item) {
            return getColumnName(item);
        });
    }

    function getSafeColor(id, defaultVal) {
        var c = getValue(id);
        if (!c || c === "") return defaultVal;
        return c;
    }
  '

  # --- UI Generators (Avoid duplicate IDs and length > 1 errors) ---

  make_labels_tab <- function(prefix) {
    rk.XML.col(
      rk.XML.input(label = "Plot Title", id.name = paste0(prefix, "_plot_title")),
      rk.XML.input(label = "Plot Subtitle", id.name = paste0(prefix, "_plot_subtitle")),
      rk.XML.input(label = "X-axis Label (blank for auto)", id.name = paste0(prefix, "_plot_xlab")),
      rk.XML.spinbox(label = "Wrap X-axis Label at (chars, 0 to disable)", id.name = paste0(prefix, "_plot_xlab_wrap"), min = 0, max = 100, initial = 0),
      rk.XML.input(label = "Y-axis Label", id.name = paste0(prefix, "_plot_ylab")),
      rk.XML.spinbox(label = "Wrap Y-axis Label at (chars, 0 to disable)", id.name = paste0(prefix, "_plot_ylab_wrap"), min = 0, max = 100, initial = 0),
      rk.XML.input(label = "Legend Title (blank for auto)", id.name = paste0(prefix, "_plot_legend_title")),
      rk.XML.input(label = "Remove text from Legend Labels (e.g. 'VarName')", id.name = paste0(prefix, "_clean_legend_prefix")),
      rk.XML.spinbox(label = "Wrap Legend Title at (chars, 0 to disable)", id.name = paste0(prefix, "_legend_title_wrap_width"), min = 0, max = 100, initial = 20),
      rk.XML.spinbox(label = "Wrap Legend Labels at (chars, 0 to disable)", id.name = paste0(prefix, "_legend_wrap_width"), min = 0, max = 100, initial = 20),
      rk.XML.input(label = "Plot Caption", id.name = paste0(prefix, "_plot_caption"))
    )
  }

  make_theme_tab <- function(prefix) {
    rk.XML.col(
      rk.XML.spinbox(label="Base text size", id.name=paste0(prefix, "_theme_base_size"), min=8, max=30, initial=12),
      rk.XML.dropdown(label="Legend Position", id.name=paste0(prefix, "_theme_legend_pos"), options=list(
          "Top"=list(val="top", chk=TRUE), "Bottom"=list(val="bottom"), "Left"=list(val="left"), "Right"=list(val="right"), "None"=list(val="none")
      )),
      rk.XML.frame(
        rk.XML.row(
          rk.XML.spinbox(label="Angle", id.name=paste0(prefix, "_theme_x_angle"), min=-90, max=90, initial=0),
          rk.XML.spinbox(label="H-Just", id.name=paste0(prefix, "_theme_x_hjust"), min=0, max=1, initial=0.5, real=TRUE),
          rk.XML.spinbox(label="V-Just", id.name=paste0(prefix, "_theme_x_vjust"), min=0, max=1, initial=0.5, real=TRUE)
        ),
        label="X-Axis Text"
      ),
      rk.XML.frame(
        rk.XML.spinbox(label="Wrap at (chars)", id.name=paste0(prefix, "_theme_x_val_wrap"), min=0, max=100, initial=0),
        label="X-Axis Value Labels"
      ),
      rk.XML.frame(
        rk.XML.spinbox(label="Wrap at (chars)", id.name=paste0(prefix, "_theme_y_val_wrap"), min=0, max=100, initial=0),
        label="Y-Axis Value Labels"
      )
    )
  }

  make_device_tab <- function(prefix, initial_save_name) {
    rk.XML.col(
      rk.XML.dropdown(label = "Device type", id.name = paste0(prefix, "_device_type"), options = list("PNG" = list(val = "PNG", chk = TRUE), "SVG" = list(val = "SVG"))),
      rk.XML.spinbox(label = "Width (px)", id.name = paste0(prefix, "_dev_width"), min = 100, max = 4000, initial = 1024),
      rk.XML.spinbox(label = "Height (px)", id.name = paste0(prefix, "_dev_height"), min = 100, max = 4000, initial = 724),
      rk.XML.spinbox(label = "Resolution (ppi)", id.name = paste0(prefix, "_dev_res"), min = 50, max = 600, initial = 150),
      rk.XML.dropdown(label = "Background", id.name = paste0(prefix, "_dev_bg"), options = list("Transparent" = list(val = "transparent", chk = TRUE), "White" = list(val = "white"))),
      rk.XML.stretch(),
      rk.XML.saveobj(
        label = "Save Plot Object to Workspace",
        initial = initial_save_name,
        chk = TRUE,
        id.name = paste0(prefix, "_save")
      )
    )
  }

  make_color_dropdown <- function(prefix, default_col="#941100") {
    rk.XML.dropdown(label = "Focus Color", id.name = paste0(prefix, "_col_focus"), options = list(
      "SWD Red (#941100)" = list(val="#941100", chk=(default_col=="#941100")),
      "SWD Blue (#1F77B4)" = list(val="#1F77B4", chk=(default_col=="#1F77B4")),
      "SWD Orange (#FF7F0E)" = list(val="#FF7F0E", chk=(default_col=="#FF7F0E")),
      "SWD Green (#2CA02C)" = list(val="#2CA02C", chk=(default_col=="#2CA02C")),
      "SWD Purple (#9467BD)" = list(val="#9467BD", chk=(default_col=="#9467BD")),
      "SWD Teal (#17BECF)" = list(val="#17BECF", chk=(default_col=="#17BECF"))
    ))
  }

  make_ordering_frame <- function(prefix) {
    rk.XML.frame(
      rk.XML.col(
        rk.XML.cbox(label = "Order X-axis by estimate value", id.name = paste0(prefix, "_order_x_est"), value = "1"),
        rk.XML.cbox(label = "Invert final order", id.name = paste0(prefix, "_invert_order"), value = "1")
      ),
      label = "X-axis Ordering"
    )
  }

  # --- Common Print JS (Export Integration) ---
  make_js_print <- function(prefix, initial_save) {
    paste0('
      if(!is_preview){
        var graph_options = [];
        graph_options.push("device.type=\\"" + getValue("', prefix, '_device_type") + "\\"");
        graph_options.push("width=" + getValue("', prefix, '_dev_width"));
        graph_options.push("height=" + getValue("', prefix, '_dev_height"));
        graph_options.push("pointsize=10.0");
        graph_options.push("res=" + getValue("', prefix, '_dev_res"));
        graph_options.push("bg=\\"" + getValue("', prefix, '_dev_bg") + "\\"");
        echo("try(rk.graph.on(" + graph_options.join(", ") + "))\\n");
      }
      echo("try(print(p))\\n");
      if(!is_preview){
        echo("try(rk.graph.off())\\n");
        echo("', initial_save, ' <- p\\n");
      }
    ')
  }

  make_js_labels_theme <- function(prefix) {
    paste0('
      var labs_list = [];
      var custom_xlab = getValue("', prefix, '_plot_xlab");
      var xlab_wrap = getValue("', prefix, '_plot_xlab_wrap");
      var xlab_call;
      if (custom_xlab) { xlab_call = "\\"" + custom_xlab + "\\""; }
      else { xlab_call = "rk.get.label(" + getValue("', prefix, '_xaxis_var") + ")"; }
      if (xlab_wrap && parseInt(xlab_wrap) > 0) {
          xlab_call = "scales::label_wrap(" + xlab_wrap + ")(" + xlab_call + ")";
      }
      labs_list.push("x = " + xlab_call);

      var custom_ylab = getValue("', prefix, '_plot_ylab");
      var ylab_wrap = getValue("', prefix, '_plot_ylab_wrap");
      if (custom_ylab) {
          var ylab_call = "\\"" + custom_ylab + "\\"";
          if (ylab_wrap && parseInt(ylab_wrap) > 0) {
              ylab_call = "scales::label_wrap(" + ylab_wrap + ")(" + ylab_call + ")";
          }
          labs_list.push("y = " + ylab_call);
      }

      var custom_legend_title = getValue("', prefix, '_plot_legend_title");
      var legend_title_wrap_width = getValue("', prefix, '_legend_title_wrap_width");
      var legend_title_call;
      if (custom_legend_title) { legend_title_call = "\\"" + custom_legend_title + "\\""; }
      else { legend_title_call = "\\"" + "\\""; }
      if (legend_title_wrap_width && parseInt(legend_title_wrap_width) > 0) {
          legend_title_call = "scales::label_wrap(" + legend_title_wrap_width + ")(" + legend_title_call + ")";
      }
      labs_list.push("color = " + legend_title_call);
      labs_list.push("fill = " + legend_title_call);

      if (getValue("', prefix, '_plot_title")) { labs_list.push("title = \\"" + getValue("', prefix, '_plot_title") + "\\""); }
      if (getValue("', prefix, '_plot_subtitle")) { labs_list.push("subtitle = \\"" + getValue("', prefix, '_plot_subtitle") + "\\""); }
      if (getValue("', prefix, '_plot_caption")) { labs_list.push("caption = \\"" + getValue("', prefix, '_plot_caption") + "\\""); }

      if (labs_list.length > 0) {
        echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\\n");
      }

      echo("p <- p + ggplot2::theme_minimal(base_size = " + getValue("', prefix, '_theme_base_size") + ")\\n");

      var theme_list = [];
      theme_list.push("plot.title.position = \\"plot\\"");
      theme_list.push("panel.grid.minor = ggplot2::element_blank()");
      theme_list.push("panel.grid.major.x = ggplot2::element_blank()");
      theme_list.push("axis.line = ggplot2::element_line(color=\\"gray40\\")");
      theme_list.push("legend.position = \\"" + getValue("', prefix, '_theme_legend_pos") + "\\"");

      var x_angle = getValue("', prefix, '_theme_x_angle");
      var x_hjust = getValue("', prefix, '_theme_x_hjust");
      var x_vjust = getValue("', prefix, '_theme_x_vjust");
      if(x_angle != 0 || x_hjust != 0.5 || x_vjust != 0.5) {
          theme_list.push("axis.text.x = ggplot2::element_text(angle=" + x_angle + ", hjust=" + x_hjust + ", vjust=" + x_vjust + ")");
      }
      if(theme_list.length > 0) {
        echo("p <- p + ggplot2::theme(" + theme_list.join(", ") + ")\\n");
      }

      var x_val_wrap = getValue("', prefix, '_theme_x_val_wrap");
      if (x_val_wrap && parseInt(x_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_x_discrete(labels = scales::label_wrap(" + x_val_wrap + "))\\n");
      }
      var y_val_wrap = getValue("', prefix, '_theme_y_val_wrap");
      if (y_val_wrap && parseInt(y_val_wrap) > 0) {
          echo("p <- p + ggplot2::scale_y_continuous(labels = scales::label_wrap(" + y_val_wrap + "))\\n");
      }
    ')
  }

  # =========================================================================================
  # 3. COMPONENT: Survey Line Graph
  # =========================================================================================
  vs_line <- rk.XML.varselector(id.name = "vs_line")
  l_svyby <- rk.XML.varslot(label = "svyby Object (Data Frame)", source = "vs_line", classes = "data.frame", required = TRUE, id.name = "l_svyby_object")
  l_x <- rk.XML.varslot(label = "X Axis", source = "vs_line", required = TRUE, id.name = "l_xaxis_var")
  l_grp <- rk.XML.varslot(label = "Grouping variable", source = "vs_line", id.name = "l_group_var")
  l_est <- rk.XML.varslot(label = "Estimate column(s)", source = "vs_line", multi = TRUE, required = TRUE, id.name = "l_estimate_vars")
  l_se <- rk.XML.varslot(label = "SE column(s)", source = "vs_line", multi = TRUE, required = TRUE, id.name = "l_se_vars")
  l_focus <- rk.XML.input(label = "Highlight Name (Focus)", id.name = "l_focus_val")
  l_nudge <- rk.XML.spinbox(label = "Label Nudge X", id.name = "l_nudge_x", min = 0, max = 5, initial = 0.5, real = TRUE)

  dialog_line <- rk.XML.dialog(
    rk.XML.row(
      vs_line,
      rk.XML.col(
        rk.XML.tabbook(tabs = list(
          "Data" = rk.XML.col(l_svyby, l_x, l_grp, l_est, l_se, l_focus),
          "Options" = rk.XML.col(make_color_dropdown("l"), rk.XML.spinbox(label="CI level (%)", id.name="l_conf_level", min=1, max=99, initial=95), l_nudge),
          "Labels" = make_labels_tab("l"),
          "Theme" = make_theme_tab("l"),
          "Output Device" = make_device_tab("l", "p_svy_line")
        )),
        rk.XML.preview(id.name="preview_line")
      )
    ),
    label = "SWD Survey: Line Graph"
  )

  js_calc_line <- paste(js_helpers, '
    var df = getValue("l_svyby_object");
    if(!df) return;
    var x = getColumnName(getValue("l_xaxis_var"));
    var grp = getColumnName(getValue("l_group_var"));
    var est_cols = getCleanArray("l_estimate_vars");
    var se_cols = getCleanArray("l_se_vars");
    var focus = getValue("l_focus_val");
    var conf = getValue("l_conf_level") / 100;
    var nudge = getValue("l_nudge_x");

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\\n");
    echo("est_dat <- " + df + " %>% dplyr::mutate(rk_internal_id = dplyr::row_number())\\n");

    // SAFE ID LIST CONSTRUCTION
    var id_vars = [];
    id_vars.push("\\"" + x + "\\"");
    if(grp && grp !== "") { id_vars.push("\\"" + grp + "\\""); }
    id_vars.push("\\"rk_internal_id\\"");
    var id_list = id_vars.join(", ");

    var est_list = est_cols.map(function(v){return "\\"" + v + "\\""}).join(", ");
    var se_list = se_cols.map(function(v){return "\\"" + v + "\\""}).join(", ");

    echo("piv1 <- est_dat %>% dplyr::select(dplyr::all_of(c(" + id_list + ", " + est_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + est_list + ")), names_to = \\"respuesta\\", values_to = \\"recuento\\")\\n");
    echo("piv2 <- est_dat %>% dplyr::select(dplyr::all_of(c(\\"rk_internal_id\\", " + se_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + se_list + ")), names_to = \\"variable\\", values_to = \\"se\\")\\n");

    if (est_cols.length == 1) { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = \\"" + est_cols[0] + "\\")\\n"); }
    else { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = stringr::str_remove(variable, \\"^se\\\\\\\\.\\"))\\n"); }

    echo("piv3 <- dplyr::left_join(piv1, piv2, by = c(\\"rk_internal_id\\", \\"respuesta\\"))\\n");

    var clean_prefix = getValue("l_clean_legend_prefix");
    if (clean_prefix) { echo("piv3[[\\"respuesta\\"]] <- stringr::str_remove(piv3[[\\"respuesta\\"]], \\"" + clean_prefix + "\\")\\n"); }

    echo("piv3[[\\"" + x + "\\"]] <- as.factor(piv3[[\\"" + x + "\\"]])\\n");
    echo("focus_col <- \\"" + getSafeColor("l_col_focus", "#941100") + "\\"\\n");

    var color_aes = (grp !== "") ? grp : "respuesta";
    var interaction_arg = (grp !== "") ? grp + ", respuesta" : "respuesta";

    echo("p <- ggplot2::ggplot(piv3, ggplot2::aes(x = " + x + ", y = recuento, color = " + color_aes + ", group = interaction(" + interaction_arg + "))) +\\n");
    echo("  ggplot2::geom_ribbon(ggplot2::aes(ymin = recuento - ci_multiplier*se, ymax = recuento + ci_multiplier*se, fill = " + color_aes + "), color = NA, alpha = 0.2) +\\n");
    echo("  ggplot2::geom_line(linewidth = 1, na.rm = TRUE) + ggplot2::geom_point(size = 2, na.rm = TRUE)\\n");

    echo("lvls <- levels(factor(piv3[[\\"" + color_aes + "\\"]]))\\n");
    echo("p <- p + ggplot2::scale_color_manual(values = setNames(ifelse(lvls == \\"" + focus + "\\", focus_col, \\"gray80\\"), lvls))\\n");
    echo("p <- p + ggplot2::scale_fill_manual(values = setNames(ifelse(lvls == \\"" + focus + "\\", focus_col, \\"gray90\\"), lvls))\\n");
    echo("p <- p + ggrepel::geom_text_repel(data = . %>% dplyr::group_by(" + color_aes + ") %>% dplyr::filter(as.numeric(factor(" + x + ")) == max(as.numeric(factor(" + x + ")))), ggplot2::aes(label = " + color_aes + "), nudge_x = " + nudge + ", hjust = 0, direction = \\"y\\", fontface = \\"bold\\")\\n");
    echo("p <- p + ggplot2::scale_x_discrete(expand = ggplot2::expansion(mult = c(0.05, 0.25)))\\n");

    echo("y_vals <- c(piv3$recuento - ci_multiplier*piv3$se, piv3$recuento + ci_multiplier*piv3$se)\\n");
    echo("y_lims <- range(y_vals[is.finite(y_vals)], na.rm=TRUE)\\n");
    echo("if(length(y_lims) == 2) { p <- p + lemon::coord_capped_cart(left = \\"top\\", ylim = c(y_lims[1]*0.95, y_lims[2]*1.05)) } else { p <- p + lemon::coord_capped_cart(left = \\"top\\") }\\n");
  ', make_js_labels_theme("l"))


  # =========================================================================================
  # 4. COMPONENT: Survey Means Graph
  # =========================================================================================
  vs_means <- rk.XML.varselector(id.name = "vs_means")
  m_svyby <- rk.XML.varslot(label = "svyby Object", source = "vs_means", classes = "data.frame", required = TRUE, id.name = "m_svyby_object")
  m_x <- rk.XML.varslot(label = "Category variable", source = "vs_means", required = TRUE, id.name = "m_xaxis_var")
  m_est <- rk.XML.varslot(label = "Estimate column", source = "vs_means", required = TRUE, id.name = "m_estimate_vars")
  m_se <- rk.XML.varslot(label = "SE column", source = "vs_means", required = TRUE, id.name = "m_se_vars")
  m_focus <- rk.XML.input(label = "Highlight Category Name", id.name = "m_focus_val")

  dialog_means <- rk.XML.dialog(
    rk.XML.row(
      vs_means,
      rk.XML.col(
        rk.XML.tabbook(tabs = list(
          "Data" = rk.XML.col(m_svyby, m_x, m_est, m_se, m_focus),
          "Options" = rk.XML.col(
               make_color_dropdown("m"),
               rk.XML.spinbox(label="Confidence level for error bars (%)", id.name="m_conf_level", min=1, max=99, initial=95),
               make_ordering_frame("m"),
               rk.XML.cbox(label="Flip coordinates", value="1", id.name="m_cbox_flip")
          ),
          "Labels" = make_labels_tab("m"),
          "Theme" = make_theme_tab("m"),
          "Output Device" = make_device_tab("m", "p_svy_means")
        )),
        rk.XML.preview(id.name="preview_means")
      )
    ),
    label = "SWD Survey: Means Graph"
  )

  js_calc_means <- paste(js_helpers, '
    var df = getValue("m_svyby_object");
    if(!df) return;
    var x = getColumnName(getValue("m_xaxis_var"));
    var est = getColumnName(getValue("m_estimate_vars"));
    var se = getColumnName(getValue("m_se_vars"));
    var focus = getValue("m_focus_val");
    var conf = getValue("m_conf_level") / 100;

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\\n");
    echo("plot_data <- " + df + "\\n");

    if (getValue("m_order_x_est") == "1") {
       echo("plot_data[[\\"" + x + "\\"]] <- suppressWarnings(forcats::fct_reorder(factor(as.character(plot_data[[\\"" + x + "\\"]]), ordered = FALSE), as.numeric(plot_data[[\\"" + est + "\\"]]), .fun = function(v) mean(v, na.rm = TRUE)))\\n");
    } else {
       echo("plot_data[[\\"" + x + "\\"]] <- factor(as.character(plot_data[[\\"" + x + "\\"]]), ordered = FALSE)\\n");
    }

    if (getValue("m_invert_order") == "1") {
       echo("plot_data[[\\"" + x + "\\"]] <- forcats::fct_rev(plot_data[[\\"" + x + "\\"]])\\n");
    }

    echo("focus_col <- \\"" + getSafeColor("m_col_focus", "#941100") + "\\"\\n");
    echo("p <- ggplot2::ggplot(plot_data, ggplot2::aes(x = " + x + ", y = " + est + ")) +\\n");
    echo("  ggplot2::geom_point(ggplot2::aes(color = (" + x + " == \\"" + focus + "\\")), size = 5) +\\n");
    echo("  ggplot2::geom_errorbar(ggplot2::aes(ymin = " + est + " - ci_multiplier*" + se + ", ymax = " + est + " + ci_multiplier*" + se + "), width = 0.2, color = \\"black\\") +\\n");
    echo("  ggplot2::scale_color_manual(values = c(\\"FALSE\\" = \\"gray80\\", \\"TRUE\\" = focus_col)) +\\n");
    echo("  ggplot2::geom_text(ggplot2::aes(label = round(" + est + ", 1)), vjust = -1.5, fontface = \\"bold\\")\\n");

    if(getValue("m_cbox_flip") == "1") { echo("p <- p + ggplot2::coord_flip()\\n"); }
    else { echo("p <- p + lemon::coord_capped_cart(left = \\"top\\")\\n"); }
  ', make_js_labels_theme("m"))


  # =========================================================================================
  # 5. COMPONENT: Survey Bar Chart
  # =========================================================================================
  vs_bar <- rk.XML.varselector(id.name = "vs_bar")
  b_svy <- rk.XML.varslot(label = "Survey Design Object", source = "vs_bar", classes = "survey.design", required = TRUE, id.name = "b_svy_object")
  b_x <- rk.XML.varslot(label = "X Axis (Groups)", source = "vs_bar", required = TRUE, id.name = "b_xaxis_var")
  b_fill <- rk.XML.varslot(label = "Fill (Stack)", source = "vs_bar", required = TRUE, id.name = "b_fill_var")
  b_focus <- rk.XML.input(label = "Highlight Stack Name", id.name = "b_focus_val")

  b_freq_type <- rk.XML.dropdown(label = "Frequency type", id.name = "b_freq_type", options = list(
      "Absolute (Counts)" = list(val = "abs", chk = TRUE), "Relative (%)" = list(val = "rel")
  ))
  b_bar_pos <- rk.XML.dropdown(label = "Bar position", id.name = "b_bar_pos", options = list(
      "Stack" = list(val = "stack", chk = TRUE), "Dodge" = list(val = "dodge"), "Fill (100% Stacked)" = list(val = "fill")
  ))

  dialog_bar <- rk.XML.dialog(
    rk.XML.row(
      vs_bar,
      rk.XML.col(
        rk.XML.tabbook(tabs = list(
          "Data" = rk.XML.col(b_svy, b_x, b_fill, b_focus),
          "Options" = rk.XML.col(
               make_color_dropdown("b"), b_freq_type, b_bar_pos, make_ordering_frame("b"),
               rk.XML.cbox(label="Flip coordinates", value="1", id.name="b_cbox_flip")
          ),
          "Labels" = make_labels_tab("b"),
          "Theme" = make_theme_tab("b"),
          "Output Device" = make_device_tab("b", "p_svy_bar")
        )),
        rk.XML.preview(id.name="preview_bar")
      )
    ),
    label = "SWD Survey: Bar Chart"
  )

  js_calc_bar <- paste0(js_helpers, '
    var svy = getValue("b_svy_object");
    if(!svy) return;
    var x = getColumnName(getValue("b_xaxis_var"));
    var fill = getColumnName(getValue("b_fill_var"));
    var focus = getValue("b_focus_val");
    var freq = getValue("b_freq_type");
    var pos = getValue("b_bar_pos");

    echo("tab <- as.data.frame(survey::svytable(~" + x + "+" + fill + ", design = " + svy + "))\\n");
    echo("tab <- tab %>% dplyr::group_by(" + x + ") %>% dplyr::mutate(Prop = Freq / sum(Freq)) %>% dplyr::ungroup()\\n");

    if (getValue("b_order_x_est") == "1") {
        echo("tab[[\\"" + x + "\\"]] <- forcats::fct_reorder(as.factor(tab[[\\"" + x + "\\"]]), tab$Freq, .fun = sum)\\n");
    } else {
        echo("tab[[\\"" + x + "\\"]] <- as.factor(tab[[\\"" + x + "\\"]])\\n");
    }
    if (getValue("b_invert_order") == "1") {
        echo("tab[[\\"" + x + "\\"]] <- forcats::fct_rev(tab[[\\"" + x + "\\"]])\\n");
    }

    echo("focus_col <- \\"" + getSafeColor("b_col_focus", "#941100") + "\\"\\n");
    echo("lvls <- unique(as.character(tab[[\\"" + fill + "\\"]]))\\n");
    echo("fill_cols <- setNames(rep(\\"gray85\\", length(lvls)), lvls)\\n");
    echo("if(\\"" + focus + "\\" %in% lvls) fill_cols[\\"" + focus + "\\"] <- focus_col\\n");

    var y_aes = (freq == "abs") ? "Freq" : "Prop";
    echo("p <- ggplot2::ggplot(tab, ggplot2::aes(x = " + x + ", y = " + y_aes + ", fill = " + fill + ")) +\\n");
    echo("  ggplot2::geom_col(position = \\"" + pos + "\\", width = 0.7, color = \\"white\\") +\\n");
    echo("  ggplot2::scale_fill_manual(values = fill_cols) +\\n");

    var label_val = (freq == "abs") ? "round(Freq, 1)" : "scales::percent(Prop, accuracy = 1)";
    echo("  ggplot2::geom_text(ggplot2::aes(label = " + label_val + "), position = ggplot2::position_" + pos + "(vjust = 0.5), color = \\"white\\", size = 4)\\n");

    var y_fmt = (freq == "rel" || pos == "fill") ? "scales::percent_format()" : "ggplot2::waiver()";
    echo("p <- p + ggplot2::scale_y_continuous(labels = " + y_fmt + ", expand = c(0,0))\\n");

    if(getValue("b_cbox_flip") == "1") { echo("p <- p + lemon::coord_capped_flip(left = \\"top\\")\\n"); }
    else { echo("p <- p + lemon::coord_capped_cart(left = \\"top\\")\\n"); }
  ', make_js_labels_theme("b"))


  # =========================================================================================
  # 6. COMPONENT: Big Number Summary
  # =========================================================================================
  bn_val <- rk.XML.input(label = "Large Value", initial = "91%", id.name = "bn_val")
  bn_text <- rk.XML.input(label = "Context Text", initial = "summary text here", id.name = "bn_text")
  bn_title <- rk.XML.input(label = "Main Title", id.name = "bn_title")
  bn_subtitle <- rk.XML.input(label = "Subtitle", id.name = "bn_subtitle")

  dialog_bn <- rk.XML.dialog(
    rk.XML.col(
      rk.XML.tabbook(tabs = list(
        "Content" = rk.XML.col(bn_val, bn_text, bn_title, bn_subtitle),
        "Options" = rk.XML.col(make_color_dropdown("bn", "#FF7F0E"), rk.XML.spinbox(label="Base text size", id.name="bn_txt_size", min=8, max=30, initial=12)),
        "Output Device" = make_device_tab("bn", "p_big_number")
      )),
      rk.XML.preview(id.name="preview_bn")
    ),
    label = "SWD: Big Number Summary"
  )

  js_calc_bn <- paste0(js_helpers, '
    var val = getValue("bn_val"); var txt = getValue("bn_text");
    echo("focus_col <- \\"" + getSafeColor("bn_col_focus", "#FF7F0E") + "\\"\\n");
    echo("p <- ggplot2::ggplot() + ggplot2::annotate(\\"text\\", x = 0, y = 0.2, label = \\"" + val + "\\", size = 40, fontface = \\"bold\\", color = focus_col) + ggplot2::annotate(\\"text\\", x = 0, y = -0.1, label = \\"" + txt + "\\", size = 8, color = \\"gray40\\") + ggplot2::xlim(-1, 1) + ggplot2::ylim(-0.5, 0.5)\\n");
    var tit = getValue("bn_title"); if(tit) echo("p <- p + ggplot2::labs(title = \\"" + tit + "\\")\\n");
    var sub = getValue("bn_subtitle"); if(sub) echo("p <- p + ggplot2::labs(subtitle = \\"" + sub + "\\")\\n");
    echo("p <- p + ggplot2::theme_void(base_size = " + getValue("bn_txt_size") + ") + ggplot2::theme(plot.title.position = \\"plot\\", plot.title = ggplot2::element_text(hjust = 0, color = \\"gray40\\", face = \\"bold\\"), plot.subtitle = ggplot2::element_text(hjust = 0, color = \\"gray40\\"))\\n");
  ')

  # =========================================================================================
  # 7. Assembly
  # =========================================================================================
  comp_means <- rk.plugin.component("Survey Means Graph", xml=list(dialog=dialog_means), js=list(require=c("ggplot2","dplyr","lemon","scales","forcats"), calculate=js_calc_means, printout=make_js_print("m", "p_svy_means")), hierarchy=h_list)
  comp_bar <- rk.plugin.component("Survey Bar Chart", xml=list(dialog=dialog_bar), js=list(require=c("ggplot2","dplyr","survey","lemon","scales","forcats","stringr"), calculate=js_calc_bar, printout=make_js_print("b", "p_svy_bar")), hierarchy=h_list)
  comp_bn <- rk.plugin.component("Big Number Summary", xml=list(dialog=dialog_bn), js=list(require=c("ggplot2"), calculate=js_calc_bn, printout=make_js_print("bn", "p_big_number")), hierarchy=h_list)

  rk.plugin.skeleton(
    about = package_about,
    path = ".",
    xml = list(dialog = dialog_line),
    js = list(
        require = c("ggplot2", "dplyr", "tidyr", "ggrepel", "lemon", "scales", "survey", "stringr", "forcats"),
        calculate = js_calc_line,
        printout = make_js_print("l", "p_svy_line")
    ),
    components = list(comp_means, comp_bar, comp_bn),
    pluginmap = list(
        name = "Survey Line Graph",
        hierarchy = h_list
    ),
    create = c("pmap", "xml", "js", "desc"),
    load = TRUE, overwrite = TRUE, show = FALSE
  )

  cat("\nPlugin 'rk.storytelling.survey' (v0.1.2) updated successfully without XML child > 1 errors.\n")
})
