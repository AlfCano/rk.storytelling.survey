local({
  # =========================================================================================
  # 1. Package Definition and Metadata
  # =========================================================================================
  require(rkwarddev)
  rkwarddev.required("0.08-1")

  plugin_name <- "rk.storytelling.survey"
  plugin_ver <- "0.1.0"

  package_about <- rk.XML.about(
    name = plugin_name,
    author = person(
      given = "Alfonso", family = "Cano",
      email = "alfonso.cano@correo.buap.mx",
      role = c("aut", "cre")
    ),
    about = list(
      desc = "SWD principles applied to svyby objects with robust coordinate scaling and big numbers.",
      version = plugin_ver,
      date = format(Sys.Date(), "%Y-%m-%d"),
      url = "https://github.com/AlfCano/rk.storytelling.survey",
      license = "GPL (>= 3)"
    )
  )

  # =========================================================================================
  # 2. Shared Helpers (Strictly NO comments inside JS strings)
  # =========================================================================================

  js_common_helper <- '
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
            var lastBracketPos = item.lastIndexOf("[[");
            if (lastBracketPos > -1) {
                var lastPart = item.substring(lastBracketPos);
                var match = lastPart.match(/\\[\\[\\"(.*?)\\"\\]\\]/);
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
        code += " + ggplot2::theme(plot.title.position = \\"plot\\", legend.justification = \\"left\\", panel.grid.minor = ggplot2::element_blank(), panel.grid.major.x = ggplot2::element_blank())";

        if (show_leg == "1") {
            code += " + ggplot2::theme(legend.position = \\"" + leg_pos + "\\")";
        } else {
            code += " + ggplot2::theme(legend.position = \\"none\\")";
        }

        code += " + ggplot2::theme(axis.title.y = ggplot2::element_text(angle = " + y_t_ang + ", vjust = " + y_vjust + ", hjust = " + y_hjust + ", color = \\"gray40\\"), axis.title.x = ggplot2::element_text(angle = " + x_t_ang + ", hjust = 0, color = \\"gray40\\"))";
        code += " + ggplot2::theme(axis.text.x = ggplot2::element_text(angle = " + x_ang + "), axis.text.y = ggplot2::element_text(angle = " + y_ang + "))";
        return code;
    }

    function getSafeColor(id, defaultVal) {
        var c = getValue(id);
        if (!c || c === "") return defaultVal;
        return c;
    }
  '

  make_options_tab <- function(prefix, include_nudge = FALSE) {
    rk.XML.col(
        rk.XML.frame(label = "Legend",
            rk.XML.cbox(label = "Show Legend", value = "1", chk = FALSE, id.name = paste0(prefix, "_show_legend")),
            rk.XML.input(label = "Custom Legend Title", id.name = paste0(prefix, "_legend_title")),
            rk.XML.dropdown(label = "Position", id.name = paste0(prefix, "_legend_pos"), options = list(
                "Top" = list(val="top", chk=TRUE), "Bottom" = list(val="bottom"), "Left" = list(val="left"), "Right" = list(val="right")
            ))
        ),
        if (include_nudge) {
            rk.XML.frame(label = "Label Justification (End of Line)",
                rk.XML.row(
                    rk.XML.spinbox(label = "Right Margin expansion", id.name = paste0(prefix, "_expand_r"), min = 0, max = 1, initial = 0.25, real = TRUE),
                    rk.XML.spinbox(label = "Label Nudge X", id.name = paste0(prefix, "_nudge_x"), min = 0, max = 5, initial = 0.5, real = TRUE)
                )
            )
        } else { rk.XML.stretch() },
        rk.XML.frame(label = "Rotation Adjustment",
            rk.XML.row(
                rk.XML.spinbox(label = "X-Title Angle", id.name = paste0(prefix, "_x_title_angle"), min = -90, max = 90, initial = 0),
                rk.XML.spinbox(label = "Y-Title Angle", id.name = paste0(prefix, "_y_title_angle"), min = -90, max = 90, initial = 0)
            ),
            rk.XML.row(
                rk.XML.spinbox(label = "X-Value Angle", id.name = paste0(prefix, "_x_angle"), min = -90, max = 90, initial = 0),
                rk.XML.spinbox(label = "Y-Value Angle", id.name = paste0(prefix, "_y_angle"), min = -90, max = 90, initial = 0)
            )
        )
    )
  }

  make_theme_tab <- function(prefix) {
    rk.XML.col(
      rk.XML.frame(label = "Text Labels",
        rk.XML.input(label = "Main Title", id.name = paste0(prefix, "_title")),
        rk.XML.input(label = "Subtitle", id.name = paste0(prefix, "_subtitle")),
        rk.XML.row(
          rk.XML.input(label = "X-Axis Label", id.name = paste0(prefix, "_xlab")),
          rk.XML.input(label = "Y-Axis Label", id.name = paste0(prefix, "_ylab"))
        ),
        rk.XML.input(label = "Caption", id.name = paste0(prefix, "_caption"))
      ),
      rk.XML.frame(label = "Focus Color",
          rk.XML.dropdown(label = "Color", id.name = paste0(prefix, "_col_focus"), options = list(
              "SWD Red (#941100)" = list(val="#941100", chk=TRUE), "SWD Blue (#1F77B4)" = list(val="#1F77B4"),
              "SWD Orange (#FF7F0E)" = list(val="#FF7F0E"), "SWD Green (#2CA02C)" = list(val="#2CA02C"),
              "SWD Purple (#9467BD)" = list(val="#9467BD"), "SWD Teal (#17BECF)" = list(val="#17BECF"), "Black" = list(val="black")
          )),
          rk.XML.spinbox(label = "Base Text Size", id.name = paste0(prefix, "_txt_size"), min = 8, max = 30, initial = 12)
      )
    )
  }

  make_device_tab <- function(prefix, initial_save) {
    rk.XML.col(
      rk.XML.frame(label = "Graphics Device",
          rk.XML.dropdown(label = "Device type", id.name = paste0(prefix, "_dev_type"), options = list("PNG" = list(val = "PNG", chk = TRUE), "SVG" = list(val = "SVG"))),
          rk.XML.row(
              rk.XML.spinbox(label = "Width (px)", id.name = paste0(prefix, "_dev_w"), min = 100, max = 4000, initial = 1024),
              rk.XML.spinbox(label = "Height (px)", id.name = paste0(prefix, "_dev_h"), min = 100, max = 4000, initial = 1024)
          ),
          rk.XML.col( # Vertically aligned Resolution and BG
             rk.XML.spinbox(label = "Resolution (ppi)", id.name = paste0(prefix, "_dev_res"), min = 50, max = 600, initial = 150),
             rk.XML.dropdown(label = "Background", id.name = paste0(prefix, "_dev_bg"), options = list("Transparent" = list(val = "transparent", chk = TRUE), "White" = list(val = "white")))
          )
      ),
      rk.XML.saveobj(label = "Save Plot Object", initial = initial_save, id.name = paste0(prefix, "_save"), chk = TRUE),
      rk.XML.preview(id.name = paste0(prefix, "_preview"))
    )
  }

  make_js_print <- function(prefix, initial_save) {
      paste0('
        if (is_preview) {
            echo("print(p)\\n");
        } else {
            var opts = [];
            opts.push("device.type=\\"" + getValue("', prefix, '_dev_type") + "\\"");
            opts.push("width=" + getValue("', prefix, '_dev_w"));
            opts.push("height=" + getValue("', prefix, '_dev_h"));
            opts.push("res=" + getValue("', prefix, '_dev_res"));
            opts.push("bg=\\"" + getValue("', prefix, '_dev_bg") + "\\"");
            echo("rk.graph.on(" + opts.join(", ") + ")\\n");
            echo("print(p)\\n");
            echo("rk.graph.off()\\n");
            echo("', initial_save, ' <- p\\n");
        }
      ')
  }

  # =========================================================================================
  # 3. Component: Survey Line Graph
  # =========================================================================================
  l_vs <- rk.XML.varselector(id.name = "l_vs")
  l_df <- rk.XML.varslot(label = "svyby Object (Data Frame)", source = "l_vs", classes = "data.frame", required = TRUE, id.name = "l_svyby")
  l_x <- rk.XML.varslot(label = "X Axis", source = "l_vs", required = TRUE, id.name = "l_x")
  l_grp <- rk.XML.varslot(label = "Grouping variable", source = "l_vs", id.name = "l_grp")
  l_est <- rk.XML.varslot(label = "Estimate column(s)", source = "l_vs", multi = TRUE, required = TRUE, id.name = "l_est")
  l_se <- rk.XML.varslot(label = "SE column(s)", source = "l_vs", multi = TRUE, required = TRUE, id.name = "l_se")
  l_focus <- rk.XML.input(label = "Highlight Name", id.name = "l_focus_val")
  l_flip <- rk.XML.cbox(label = "Flip Coordinates", value = "1", chk = FALSE, id.name = "l_flip")

  dialog_line <- rk.XML.dialog(label = "SWD Survey: Line Graph", child = rk.XML.row(l_vs, rk.XML.col(rk.XML.tabbook(tabs = list(
        "Data" = rk.XML.col(l_df, l_x, l_grp, l_est, l_se, l_focus, l_flip, rk.XML.spinbox(label="CI level (%)", id.name="l_conf", min=1, max=99, initial=95)),
        "Options" = make_options_tab("l", include_nudge = TRUE),
        "Theme" = make_theme_tab("l"),
        "Output & Export" = make_device_tab("l", "p_svy_line")
    )))))

  js_calc_line <- paste(js_common_helper, '
    var df = getValue("l_svyby"); var x = getColumnName(getValue("l_x")); var grp = getColumnName(getValue("l_grp"));
    var est_cols = getCleanArray("l_est"); var se_cols = getCleanArray("l_se");
    var focus = getValue("l_focus_val"); var conf = getValue("l_conf") / 100;
    var nudge = getValue("l_nudge_x"); var expand_r = getValue("l_expand_r");

    echo("ci_multiplier <- qnorm(1 - (1 - " + conf + ") / 2)\\n");
    echo("est_dat <- " + df + " %>% dplyr::mutate(rk_internal_id = dplyr::row_number())\\n");
    var id_list = [x, grp, "rk_internal_id"].filter(function(v){return v != "NULL"}).map(function(v){return "\\"" + v + "\\""}).join(", ");
    var est_list = est_cols.map(function(v){return "\\"" + v + "\\""}).join(", ");
    var se_list = se_cols.map(function(v){return "\\"" + v + "\\""}).join(", ");
    echo("piv1 <- est_dat %>% dplyr::select(dplyr::all_of(c(" + id_list + ", " + est_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + est_list + ")), names_to = \\"respuesta\\", values_to = \\"recuento\\")\\n");
    echo("piv2 <- est_dat %>% dplyr::select(dplyr::all_of(c(\\"rk_internal_id\\", " + se_list + "))) %>% tidyr::pivot_longer(cols=dplyr::all_of(c(" + se_list + ")), names_to = \\"variable\\", values_to = \\"se\\")\\n");
    if (est_cols.length == 1) { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = \\"" + est_cols[0] + "\\")\\n"); }
    else { echo("piv2 <- piv2 %>% dplyr::mutate(respuesta = stringr::str_remove(variable, \\"^se\\\\\\\\.\\"))\\n"); }
    echo("piv3 <- dplyr::left_join(piv1, piv2, by = c(\\"rk_internal_id\\", \\"respuesta\\"))\\n");
    echo("piv3[[\\"" + x + "\\"]] <- as.factor(piv3[[\\"" + x + "\\"]])\\n");
    echo("focus_col <- \\"" + getSafeColor("l_col_focus", "#941100") + "\\"\\n");
    var color_aes = (grp != "NULL") ? grp : "respuesta";
    echo("p <- ggplot2::ggplot(piv3, ggplot2::aes(x = " + x + ", y = recuento, color = " + color_aes + ", group = interaction(" + (grp != "NULL" ? grp + ", " : "") + "respuesta))) +\\n");
    echo("  ggplot2::geom_ribbon(ggplot2::aes(ymin = recuento - ci_multiplier*se, ymax = recuento + ci_multiplier*se, fill = " + color_aes + "), color = NA, alpha = 0.2) +\\n");
    echo("  ggplot2::geom_line(size = 1, na.rm = TRUE) + ggplot2::geom_point(size = 2, na.rm = TRUE)\\n");
    echo("lvls <- levels(factor(piv3[[\\"" + color_aes + "\\"]]))\\n");
    echo("p <- p + ggplot2::scale_color_manual(values = setNames(ifelse(lvls == \\"" + focus + "\\", focus_col, \\"gray80\\"), lvls))\\n");
    echo("p <- p + ggplot2::scale_fill_manual(values = setNames(ifelse(lvls == \\"" + focus + "\\", focus_col, \\"gray90\\"), lvls))\\n");
    echo("p <- p + ggrepel::geom_text_repel(data = . %>% dplyr::group_by(" + color_aes + ") %>% dplyr::filter(as.numeric(factor(" + x + ")) == max(as.numeric(factor(" + x + ")))), ggplot2::aes(label = " + color_aes + "), nudge_x = " + nudge + ", hjust = 0, direction = \\"y\\", fontface = \\"bold\\")\\n");

    var labs_list = [];
    if(getValue("l_title")) labs_list.push("title = \\"" + getValue("l_title") + "\\"");
    if(getValue("l_subtitle")) labs_list.push("subtitle = \\"" + getValue("l_subtitle") + "\\"");
    if(getValue("l_caption")) labs_list.push("caption = \\"" + getValue("l_caption") + "\\"");
    if(getValue("l_xlab")) labs_list.push("x = \\"" + getValue("l_xlab") + "\\"");
    if(getValue("l_ylab")) labs_list.push("y = \\"" + getValue("l_ylab") + "\\"");
    var leg_t = getValue("l_legend_title");
    if(leg_t) { labs_list.push("color = \\"" + leg_t + "\\""); labs_list.push("fill = \\"" + leg_t + "\\""); }
    if(labs_list.length > 0) echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\\n");

    echo("p <- p " + getThemeCode("l") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\\"gray40\\")) + ggplot2::scale_x_discrete(expand = ggplot2::expansion(mult = c(0.05, " + expand_r + ")))\\n");

    echo("y_vals <- c(piv3$recuento - ci_multiplier*piv3$se, piv3$recuento + ci_multiplier*piv3$se)\\n");
    echo("y_lims <- range(y_vals[is.finite(y_vals)], na.rm=TRUE)\\n");
    var coord_func = (getValue("l_flip") == "1") ? "lemon::coord_capped_flip" : "lemon::coord_capped_cart";
    echo("if(length(y_lims) == 2) { p <- p + " + coord_func + "(left = \\"top\\", ylim = c(y_lims[1]*0.95, y_lims[2]*1.05)) } else { p <- p + " + coord_func + "(left = \\"top\\") }\\n");
  ')

  # =========================================================================================
  # 4. Component: Survey Means Graph
  # =========================================================================================
  m_vs <- rk.XML.varselector(id.name = "m_vs")
  m_df <- rk.XML.varslot(label = "svyby Object", source = "m_vs", classes = "data.frame", required = TRUE, id.name = "m_svyby")
  m_x <- rk.XML.varslot(label = "Category variable", source = "m_vs", required = TRUE, id.name = "m_x")
  m_est <- rk.XML.varslot(label = "Estimate column", source = "m_vs", required = TRUE, id.name = "m_est")
  m_se <- rk.XML.varslot(label = "SE column", source = "m_vs", required = TRUE, id.name = "m_se")
  m_focus <- rk.XML.input(label = "Highlight Category Name", id.name = "m_focus_val")

  dialog_means <- rk.XML.dialog(label = "SWD Survey: Means Graph", child = rk.XML.row(m_vs, rk.XML.col(rk.XML.tabbook(tabs = list(
        "Data" = rk.XML.col(m_df, m_x, m_est, m_se, m_focus),
        "Options" = make_options_tab("m"),
        "Theme" = make_theme_tab("m"),
        "Output & Export" = make_device_tab("m", "p_svy_means")
    )))))

  js_calc_means <- paste(js_common_helper, '
    var df = getValue("m_svyby"); var x = getColumnName(getValue("m_x")); var est = getColumnName(getValue("m_est")); var se = getColumnName(getValue("m_se"));
    var focus = getValue("m_focus_val");
    echo("plot_data <- " + df + "\\n");
    echo("focus_col <- \\"" + getSafeColor("m_col_focus", "#941100") + "\\"\\n");
    echo("p <- ggplot2::ggplot(plot_data, ggplot2::aes(x = reorder(" + x + ", " + est + "), y = " + est + ")) +\\n");
    echo("  ggplot2::geom_point(ggplot2::aes(color = (" + x + " == \\"" + focus + "\\")), size = 5) +\\n");
    echo("  ggplot2::geom_errorbar(ggplot2::aes(ymin = " + est + " - 1.96*" + se + ", ymax = " + est + " + 1.96*" + se + "), width = 0.2, color = \\"black\\") +\\n");
    echo("  ggplot2::scale_color_manual(values = c(\\"FALSE\\" = \\"gray80\\", \\"TRUE\\" = focus_col)) +\\n");
    echo("  ggplot2::geom_text(ggplot2::aes(label = round(" + est + ", 1)), vjust = -1.5, fontface = \\"bold\\")\\n");

    var labs_list = [];
    if(getValue("m_title")) labs_list.push("title = \\"" + getValue("m_title") + "\\"");
    if(getValue("m_subtitle")) labs_list.push("subtitle = \\"" + getValue("m_subtitle") + "\\"");
    if(getValue("m_caption")) labs_list.push("caption = \\"" + getValue("m_caption") + "\\"");
    if(getValue("m_xlab")) labs_list.push("x = \\"" + getValue("m_xlab") + "\\"");
    if(getValue("m_ylab")) labs_list.push("y = \\"" + getValue("m_ylab") + "\\"");
    var leg_t = getValue("m_legend_title"); if(leg_t) labs_list.push("color = \\"" + leg_t + "\\"");
    if(labs_list.length > 0) echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\\n");

    echo("p <- p " + getThemeCode("m") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\\"gray40\\")) + lemon::coord_capped_cart(left = \\"top\\")\\n");
  ')

  # =========================================================================================
  # 5. Component: Survey Bar Chart
  # =========================================================================================
  b_vs <- rk.XML.varselector(id.name = "b_vs")
  b_svy <- rk.XML.varslot(label = "Survey Design Object", source = "b_vs", classes = "survey.design", required = TRUE, id.name = "b_svy")
  b_x <- rk.XML.varslot(label = "X Axis (Groups)", source = "b_vs", required = TRUE, id.name = "b_x")
  b_fill <- rk.XML.varslot(label = "Fill (Stack)", source = "b_vs", required = TRUE, id.name = "b_fill")
  b_focus <- rk.XML.input(label = "Highlight Stack Name", id.name = "b_focus_val")
  b_flip <- rk.XML.cbox(label = "Flip Coordinates", value = "1", chk = FALSE, id.name = "b_flip")

  b_freq_type <- rk.XML.dropdown(label = "Frequency type", id.name = "b_freq_type", options = list(
      "Absolute (Counts)" = list(val = "abs", chk = TRUE), "Relative (%)" = list(val = "rel")
  ))
  b_bar_pos <- rk.XML.dropdown(label = "Bar position", id.name = "b_bar_pos", options = list(
      "Stack" = list(val = "stack", chk = TRUE), "Dodge" = list(val = "dodge"), "Fill (100% Stacked)" = list(val = "fill")
  ))
  b_ord_frame <- rk.XML.frame(label = "X-axis Ordering", child = rk.XML.col(
      rk.XML.cbox(label = "Order X-axis by frequency", id.name = "b_order_freq", value = "1"),
      rk.XML.cbox(label = "Invert final order", id.name = "b_invert", value = "1")
  ))

  dialog_bar <- rk.XML.dialog(label = "SWD Survey: Bar Chart", child = rk.XML.row(b_vs, rk.XML.col(rk.XML.tabbook(tabs = list(
        "Data" = rk.XML.col(b_svy, b_x, b_fill, b_focus, rk.XML.row(b_freq_type, b_bar_pos), b_flip, b_ord_frame),
        "Options" = make_options_tab("b"),
        "Theme" = make_theme_tab("b"),
        "Output & Export" = make_device_tab("b", "p_svy_bar")
    )))))

  js_calc_bar <- paste0(js_common_helper, '
    var svy = getValue("b_svy"); var x = getColumnName(getValue("b_x")); var fill = getColumnName(getValue("b_fill")); var focus = getValue("b_focus_val");
    var freq = getValue("b_freq_type"); var pos = getValue("b_bar_pos");
    var ord = getValue("b_order_freq"); var inv = getValue("b_invert");

    echo("tab <- as.data.frame(survey::svytable(~" + x + "+" + fill + ", design = " + svy + "))\\n");
    echo("tab <- tab %>% dplyr::group_by(" + x + ") %>% dplyr::mutate(Prop = Freq / sum(Freq)) %>% dplyr::ungroup()\\n");

    if(ord == "1") { echo("tab[[\\"" + x + "\\"]] <- forcats::fct_reorder(factor(tab[[\\"" + x + "\\"]]), tab$Freq, .fun = sum)\\n"); }
    if(inv == "1") { echo("tab[[\\"" + x + "\\"]] <- forcats::fct_rev(factor(tab[[\\"" + x + "\\"]]))\\n"); }

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

    var labs_list = [];
    if(getValue("b_title")) labs_list.push("title = \\"" + getValue("b_title") + "\\"");
    if(getValue("b_subtitle")) labs_list.push("subtitle = \\"" + getValue("b_subtitle") + "\\"");
    if(getValue("b_caption")) labs_list.push("caption = \\"" + getValue("b_caption") + "\\"");
    if(getValue("b_xlab")) labs_list.push("x = \\"" + getValue("b_xlab") + "\\"");
    if(getValue("b_ylab")) labs_list.push("y = \\"" + getValue("b_ylab") + "\\"");
    var leg_t = getValue("b_legend_title"); if(leg_t) labs_list.push("fill = \\"" + leg_t + "\\"");
    if(labs_list.length > 0) echo("p <- p + ggplot2::labs(" + labs_list.join(", ") + ")\\n");

    var y_fmt = (freq == "rel" || pos == "fill") ? "scales::percent_format()" : "ggplot2::waiver()";
    echo("p <- p " + getThemeCode("b") + " + ggplot2::theme(axis.line = ggplot2::element_line(color=\\"gray40\\")) + ggplot2::scale_y_continuous(labels = " + y_fmt + ", expand = c(0,0))\\n");

    var coord_func = (getValue("b_flip") == "1") ? "lemon::coord_capped_flip" : "lemon::coord_capped_cart";
    echo("p <- p + " + coord_func + "(left = \\"top\\")\\n");
  ')

  # =========================================================================================
  # 6. Component: Big Number Summary (frozen)
  # =========================================================================================
  bn_val <- rk.XML.input(label = "Large Value", initial = "91%", id.name = "bn_val")
  bn_text <- rk.XML.input(label = "Context Text", initial = "summary text here", id.name = "bn_text")

  bn_theme_tab <- rk.XML.col(
      rk.XML.frame(label = "Text Labels",
        rk.XML.input(label = "Main Title", id.name = "bn_title"),
        rk.XML.input(label = "Subtitle", id.name = "bn_subtitle")
      ),
      rk.XML.frame(label = "Colors",
          rk.XML.dropdown(label = "Focus Color", id.name = "bn_col_focus", options = list(
              "SWD Orange (#FF7F0E)" = list(val="#FF7F0E", chk=TRUE), "SWD Red (#941100)" = list(val="#941100"),
              "SWD Blue (#1F77B4)" = list(val="#1F77B4"), "Black" = list(val="black")
          ))
      ),
      rk.XML.spinbox(label = "Base Text Size", id.name = "bn_txt_size", min = 8, max = 30, initial = 12)
  )

  dialog_bn <- rk.XML.dialog(label = "SWD: Big Number Summary", child = rk.XML.row(rk.XML.col(rk.XML.tabbook(tabs = list(
        "Content" = rk.XML.col(bn_val, bn_text),
        "Theme" = bn_theme_tab,
        "Output & Export" = make_device_tab("bn", "p_big_number")
    )))))

  js_calc_bn <- paste0(js_common_helper, '
    var val = getValue("bn_val"); var txt = getValue("bn_text");
    echo("focus_col <- \\"" + getSafeColor("bn_col_focus", "#FF7F0E") + "\\"\\n");
    echo("p <- ggplot2::ggplot() + ggplot2::annotate(\\"text\\", x = 0, y = 0.2, label = \\"" + val + "\\", size = 40, fontface = \\"bold\\", color = focus_col) + ggplot2::annotate(\\"text\\", x = 0, y = -0.1, label = \\"" + txt + "\\", size = 8, color = \\"gray40\\") + ggplot2::xlim(-1, 1) + ggplot2::ylim(-0.5, 0.5)\\n");
    var tit = getValue("bn_title"); if(tit) echo("p <- p + ggplot2::labs(title = \\"" + tit + "\\")\\n");
    var sub = getValue("bn_subtitle"); if(sub) echo("p <- p + ggplot2::labs(subtitle = \\"" + sub + "\\")\\n");
    echo("p <- p + ggplot2::theme_void(base_size = " + getValue("bn_txt_size") + ") + ggplot2::theme(plot.title.position = \\"plot\\", plot.title = ggplot2::element_text(hjust = 0, color = \\"gray40\\", face = \\"bold\\"), plot.subtitle = ggplot2::element_text(hjust = 0, color = \\"gray40\\"))\\n");
  ')

  # =========================================================================================
  # 7. Help Definitions
  # =========================================================================================
  h_list <- list("Survey", "Graphs", "Storytelling with Data")
  help_line <- list(summary=rk.rkh.summary("Survey weighted lines from svyby results."), usage=rk.rkh.usage("Map Estimate and SE columns."))
  help_means <- list(summary=rk.rkh.summary("Weighted point estimates with error bars."), usage=rk.rkh.usage("Ideal for cross-sectional comparisons."))
  help_bar <- list(summary=rk.rkh.summary("100% stacked weighted bars."), usage=rk.rkh.usage("Highlights a specific category in the stack."))

  # =========================================================================================
  # 8. Assembly
  # =========================================================================================
  comp_means <- rk.plugin.component("Survey Means Graph", xml=list(dialog=dialog_means), js=list(require=c("ggplot2","dplyr","lemon"), calculate=js_calc_means, printout=make_js_print("m", "p_svy_means")), hierarchy=h_list, rkh=help_means)
  comp_bar <- rk.plugin.component("Survey Bar Chart", xml=list(dialog=dialog_bar), js=list(require=c("ggplot2","dplyr","survey","lemon","scales"), calculate=js_calc_bar, printout=make_js_print("b", "p_svy_bar")), hierarchy=h_list, rkh=help_bar)
  comp_bn <- rk.plugin.component("Big Number Summary", xml=list(dialog=dialog_bn), js=list(require=c("ggplot2"), calculate=js_calc_bn, printout=make_js_print("bn", "p_big_number")), hierarchy=h_list)

  rk.plugin.skeleton(
    about = package_about,
    path = ".",
    xml = list(dialog = dialog_line),
    js = list(
        require = c("ggplot2", "dplyr", "tidyr", "ggrepel", "lemon", "scales", "survey", "stringr"),
        calculate = js_calc_line,
        printout = make_js_print("l", "p_svy_line")
    ),
    components = list(comp_means, comp_bar, comp_bn),
    pluginmap = list(
        name = "Survey Line Graph",
        hierarchy = h_list
    ),
    create = c("pmap", "xml", "js", "desc", "rkh"),
    load = TRUE, overwrite = TRUE, show = FALSE
  )

  cat("\nPlugin 'rk.storytelling.survey' updated successfully (v0.1.0).\n")
})
