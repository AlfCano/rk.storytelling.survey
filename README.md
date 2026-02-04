# rk.storytelling.survey: High-Impact Visualization for Complex Survey Designs

![Version](https://img.shields.io/badge/Version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![RKWard](https://img.shields.io/badge/Platform-RKWard-green)
[![R Linter](https://github.com/AlfCano/rk.storytelling.survey/actions/workflows/lintr.yml/badge.svg)](https://github.com/AlfCano/rk.storytelling.survey)

**rk.storytelling.survey** applies the principles of Cole Nussbaumer Knaflic's *"Storytelling with Data" (SWD)* to complex survey data. By integrating the power of the `survey` and `lemon` packages, it provides a specialized collection of RKWard plugins designed to communicate weighted results (Means and Totals) with clarity, precision, and professional aesthetics.

## 🚀 What's New in Version 0.1.0

This initial release brings high-fidelity SWD storytelling to survey analysts:

*   **Weighted SWD Formatting:** All plots automatically implement professional standards for survey data: horizontal Y-axis titles positioned at the top-left, clean minimal grids, and weighted estimation.
*   **Robust Coordinate Scaling:** Solves common `ggplot2` clipping issues. Confidence ribbons and error bars are rendered using coordinate-level scaling, ensuring that uncertainty intervals are never "cut off" or removed from the plot.
*   **Survey Design Integration:** Built-in variable extraction logic allows users to select variables directly from `survey.design` objects, maintaining full compatibility with weighted workflows.

## ✨ Features

### 1. Survey Line Graph (svyby)
*   **Uncertainty Ribbons:** Visualizes confidence intervals using clean SWD ribbons instead of cluttered error bars.
*   **Multi-Column Support:** Capability to plot multiple estimate and standard error (SE) columns simultaneously.
*   **Focus Highlighting:** Highlight a specific demographic series or metric in color while relegating others to context gray.
*   **Right-Justified Labels:** Automatically places series labels at the end of lines with adjustable nudging to eliminate the need for legends.

### 2. Survey Means Graph (Dots)
*   **Point Estimates:** Renders weighted means or totals as large, clear focal points.
*   **Weighted Error Bars:** Includes 95% confidence intervals calculated directly from the survey design.
*   **Automatic Ordering:** Categories are sorted by their estimate values to make comparisons instant.

### 3. Survey Bar Chart
*   **Weighted Proportions:** Creates 100% stacked, dodged, or stacked bars based on survey weights using `svytable`.
*   **Focus Highlighting:** Target a specific segment (e.g., "Dissatisfied") with a focus color across all bars.
*   **Capped Axes:** Implements the clean SWD look where vertical axis lines are clipped to the data range.

### 4. Big Number Summary
*   **Executive Dashboards:** Create text-based "Big Number" impact cards to highlight a single weighted percentage or total from your survey.

### 🛡️ Universal Features
*   **Advanced Rotation:** Precision control over X/Y Axis Titles and Axis Value labels to handle long survey category names.
*   **Professional Palette:** Full access to the SWD palette (Red, Blue, Orange, Green, Purple, Teal).
*   **Internationalization:** Fully localized interface available in:
    *   🇺🇸 English (Default)
    *   🇪🇸 Spanish (`es`)
    *   🇫🇷 French (`fr`)
    *   🇩🇪 German (`de`)
    *   🇧🇷 Portuguese (Brazil) (`pt_BR`)

## 📦 Installation

This plugin is not yet on CRAN. To install it, use the `remotes` or `devtools` package in RKWard.

1.  **Open RKWard**.
2.  **Run the following command** in the R Console:

    ```R
    # If you don't have devtools installed:
    # install.packages("devtools")
    
    local({
      require(devtools)
      install_github("AlfCano/rk.storytelling.survey", force = TRUE)
    })
    ```
3.  **Restart RKWard** to load the new menu entries.

## 💻 Usage

Once installed, the tools are organized under:

**`Survey` -> `Graphs` -> `Storytelling with Data`**

## 🎓 Learning Exercises

### 1. Survey Line Graph: Performance over Time
**Scenario:** Highlighting the trend of a specific subgroup in the California Academic Performance Index (API) survey.

**A. Data Preparation (Run in Console):**
```R
library(survey)
library(dplyr)
data(api)

# Create a stratified survey design
dstrat <- svydesign(id=~1, strata=~stype, weights=~pw, data=apistrat, fpc=~fpc)

# Calculate means by year (simulated here with stype)
line_data <- svyby(~api00, by=~stype, design=dstrat, FUN=svymean)
```

**B. Plugin Settings:**
*   **Data Frame:** `line_data`
*   **X Axis:** `stype`
*   **Estimate column:** `api00`
*   **SE column:** `se`
*   **Highlight Name:** `E` (Highlighting Elementary schools)
*   **Theme Tab:**
    *   *Focus Color:* "SWD Red"
    *   *Y-Axis Title:* "Mean API Score"

---

### 2. Survey Bar Chart: Highlighting Dissatisfaction
**Scenario:** Creating a 100% stacked bar chart of school types and highlighting a specific award status.

**A. Data Preparation (Run in Console):**
```R
library(survey)
data(api)
dstrat <- svydesign(id=~1, strata=~stype, weights=~pw, data=apistrat, fpc=~fpc)
```

**B. Plugin Settings:**
*   **Survey Design Object:** `dstrat`
*   **X Axis (Groups):** `stype`
*   **Fill (Stack):** `awards`
*   **Highlight Stack Name:** `Yes`
*   **Frequency Type:** `Relative (%)`
*   **Bar position:** `Fill (100% Stacked)`
*   **Theme Tab:**
    *   *Focus Color:* "SWD Blue"

## 🛠️ Dependencies

This plugin relies on the following R packages:
*   `ggplot2`, `dplyr`, `tidyr`, `scales`, `survey`, `lemon`, `ggrepel`, `stringr`

#### Troubleshooting: Errors installing `devtools` or missing binary dependencies (Windows)

If you encounter errors mentioning "non-zero exit status", "namespace is already loaded", or requirements for compilation (compiling from source) when installing packages, it is likely because the R version bundled with RKWard is older than the current CRAN standard.

**Workaround:**
Until a new, more recent version of R (current bundled version is 4.3.3) is packaged into the RKWard executable, these issues will persist. To fix this:

1.  Download and install the latest version of R (e.g., 4.5.2 or newer) from [CRAN](https://cloud.r-project.org/).
2.  Open RKWard and go to the **Settings** menu.
3.  Run the **"Installation Checker"**.
4.  Point RKWard to the newly installed R version.

## ✍️ Author & License

*   **Author:** Alfonso Cano (<alfonso.cano@correo.buap.mx>)
*   **Assisted by:** Gemini, a large language model from Google.
*   **License:** GPL (>= 3)
