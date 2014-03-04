// Generated by CoffeeScript 1.7.1
var __slice = [].slice,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['underscore', 'marionette', 'cilantro', 'cilantro/ui/numbers', '../tables', '../modals', '../../models', 'tpl!templates/count.html', 'tpl!templates/varify/workflows/results.html', 'tpl!templates/varify/modals/phenotypes.html'], function() {
  var Marionette, ResultCount, ResultsWorkflow, c, modal, models, numbers, tables, templates, _;
  _ = arguments[0], Marionette = arguments[1], c = arguments[2], numbers = arguments[3], tables = arguments[4], modal = arguments[5], models = arguments[6], templates = 8 <= arguments.length ? __slice.call(arguments, 7) : [];
  templates = _.object(['count', 'results', 'phenotypes'], templates);
  ResultCount = (function(_super) {
    __extends(ResultCount, _super);

    function ResultCount() {
      this.onRender = __bind(this.onRender, this);
      return ResultCount.__super__.constructor.apply(this, arguments);
    }

    ResultCount.prototype.tagName = 'span';

    ResultCount.prototype.className = 'result-count';

    ResultCount.prototype.template = templates.count;

    ResultCount.prototype.ui = {
      count: '.count',
      label: '.count-label'
    };

    ResultCount.prototype.modelEvents = {
      'change:objectcount': 'renderCount'
    };

    ResultCount.prototype.initialize = function() {
      this.data = {};
      if (!(this.data.context = this.options.context)) {
        throw new Error('context model required');
      }
    };

    ResultCount.prototype.onRender = function() {
      return this.renderCount(this.model, (this.model.objectCount != null) || '' ? this.model.objectCount : void 0);
    };

    ResultCount.prototype.renderCount = function(model, count, options) {
      var json, sample;
      sample = null;
      if ((this.data.context != null) && ((json = this.data.context.get('json')) != null)) {
        _.each(json.children, function(child) {
          if ((child.concept != null) && child.concept === 2) {
            return sample = child.children[0].value[0].label;
          }
        });
      }
      numbers.renderCount(this.ui.count, count);
      this.ui.label.text("records in " + (sample || "various samples"));
      this.ui.label.attr('title', sample);
      if (sample != null) {
        return this.ui.label.tooltip({
          animation: false,
          html: true,
          placement: 'bottom',
          container: 'body'
        });
      } else {
        return this.ui.label.tooltip('destroy');
      }
    };

    return ResultCount;

  })(Marionette.ItemView);

  /*
  The ResultsWorkflow provides an interface for previewing tabular data,
  mechanisms for customizing the view, and a method for exporting data
  to alternate formats.
  TODO: break out context panel as standalone view
  
  This view requires the following options:
  - concepts: a collection of concepts that are deemed viewable
  - context: the session/active context model
  - view: the session/active view model
  - results: a Results collection that contains the tabular data
  - exporters: a collection of supported exporters
  - queries: a collection of queries
   */
  ResultsWorkflow = (function(_super) {
    __extends(ResultsWorkflow, _super);

    function ResultsWorkflow() {
      this.retrievePhenotypes = __bind(this.retrievePhenotypes, this);
      this.sampleID = __bind(this.sampleID, this);
      this.phenotypesError = __bind(this.phenotypesError, this);
      this.hidePhenotypes = __bind(this.hidePhenotypes, this);
      this.renderPhenotypes = __bind(this.renderPhenotypes, this);
      this.showSaveQuery = __bind(this.showSaveQuery, this);
      this.exportData = __bind(this.exportData, this);
      this.startExport = __bind(this.startExport, this);
      this.checkExportStatus = __bind(this.checkExportStatus, this);
      this.onExportFinished = __bind(this.onExportFinished, this);
      this.onPageScroll = __bind(this.onPageScroll, this);
      this.hideContextPanel = __bind(this.hideContextPanel, this);
      this.showContextPanel = __bind(this.showContextPanel, this);
      this.toggleContextPanelButtonClicked = __bind(this.toggleContextPanelButtonClicked, this);
      this.updateContextPanelOffsets = __bind(this.updateContextPanelOffsets, this);
      this.onWindowResize = __bind(this.onWindowResize, this);
      this.hideLoadingOverlay = __bind(this.hideLoadingOverlay, this);
      this.showLoadingOverlay = __bind(this.showLoadingOverlay, this);
      this.onExportClicked = __bind(this.onExportClicked, this);
      this.onExportCloseClicked = __bind(this.onExportCloseClicked, this);
      this.onRouterLoad = __bind(this.onRouterLoad, this);
      this.onRouterUnload = __bind(this.onRouterUnload, this);
      return ResultsWorkflow.__super__.constructor.apply(this, arguments);
    }

    ResultsWorkflow.prototype.className = 'results-workflow';

    ResultsWorkflow.prototype.template = templates.results;

    ResultsWorkflow.prototype.requestDelay = 2500;

    ResultsWorkflow.prototype.requestTimeout = 60000;

    ResultsWorkflow.prototype.monitorDelay = 500;

    ResultsWorkflow.prototype.monitorTimeout = 600000;

    ResultsWorkflow.prototype.numPendingDownloads = 0;

    ResultsWorkflow.prototype.pageRangePattern = /^[0-9]+(\.\.\.[0-9]+)?$/;

    ResultsWorkflow.prototype.ui = {
      contextContainer: '.context-container',
      saveQuery: '.save-query-modal',
      saveQueryToggle: '[data-toggle=save-query]',
      exportOptions: '.export-options-modal',
      exportProgress: '.export-progress-modal',
      toggleFiltersButton: '[data-toggle=context-panel]',
      toggleFiltersIcon: '[data-toggle=context-panel] i',
      toggleFiltersText: '[data-toggle=context-panel] span',
      navbar: '.results-workflow-navbar',
      resultsContainer: '.results-container',
      navbarButtons: '.results-workflow-navbar button',
      loadingOverlay: '.loading-overlay',
      viewPhenotype: '.phenotype-modal .modal-body .span12'
    };

    ResultsWorkflow.prototype.events = {
      'click .export-options-modal [data-save]': 'onExportClicked',
      'click .export-options-modal [data-dismiss=modal]': 'onExportCloseClicked',
      'click [data-toggle=export-options]': 'showExportOptions',
      'click [data-toggle=export-progress]': 'showExportProgress',
      'click #pages-text-ranges': 'selectPagesOption',
      'click [data-toggle=save-query]': 'showSaveQuery',
      'click [data-toggle=context-panel]': 'toggleContextPanelButtonClicked',
      'show.bs.modal .phenotype-modal': 'retrievePhenotypes',
      'hidden.bs.modal .phenotype-modal': 'hidePhenotypes'
    };

    ResultsWorkflow.prototype.regions = {
      columns: '#export-columns-tab',
      count: '.count-region',
      table: '.table-region',
      paginator: '.paginator-region',
      context: '.context-region',
      exportTypes: '.export-type-region',
      exportProgress: '.export-progress-region',
      saveQueryModal: '.save-query-modal',
      resultDetailsModal: '.result-details-modal'
    };

    ResultsWorkflow.prototype.initialize = function() {
      this.data = {};
      if (!(this.data.context = this.options.context)) {
        throw new Error('context model required');
      }
      if (!(this.data.view = this.options.view)) {
        throw new Error('view model required');
      }
      if (!(this.data.concepts = this.options.concepts)) {
        throw new Error('concepts collection required');
      }
      if (!(this.data.results = this.options.results)) {
        throw new Error('results collection required');
      }
      if (!(this.data.exporters = this.options.exporters)) {
        throw new Error('exporters collection required');
      }
      if (!(this.data.queries = this.options.queries)) {
        throw new Error('queries collection required');
      }
      $(document).on('scroll', this.onPageScroll);
      $(window).resize(this.onWindowResize);
      this.data.results.on('request', this.showLoadingOverlay);
      this.data.results.on('sync', this.hideLoadingOverlay);
      this.monitors = {};
      this.areFiltersManuallyHidden = false;
      this.areFiltersHidden = false;
      this.on('router:load', this.onRouterLoad);
      this.on('router:unload', this.onRouterUnload);
      return c.on('resultRow:click', (function(_this) {
        return function(view, result) {
          return _this.resultDetailsModal.currentView.update(view, result);
        };
      })(this));
    };

    ResultsWorkflow.prototype.onRouterUnload = function() {
      return this.data.results.trigger('workspace:unload');
    };

    ResultsWorkflow.prototype.onRouterLoad = function() {
      this.data.results.trigger('workspace:load');
      return this.showContextPanel();
    };

    ResultsWorkflow.prototype.onExportCloseClicked = function() {
      return _.delay((function(_this) {
        return function() {
          return _this.columns.currentView.resetFacets();
        };
      })(this), 25);
    };

    ResultsWorkflow.prototype.onExportClicked = function() {
      if (_.isEqual(_.pluck(this.data.view.facets.models, 'id'), _.pluck(this.columns.currentView.data.facets.models, 'id'))) {
        return this.exportData();
      } else {
        this.data.view.facets.reset(this.columns.currentView.data.facets.toJSON());
        return this.data.view.save({}, {
          success: this.exportData
        });
      }
    };

    ResultsWorkflow.prototype.showLoadingOverlay = function() {
      if ((this.isClosed != null) && !this.isClosed) {
        return this.ui.loadingOverlay.show();
      }
    };

    ResultsWorkflow.prototype.hideLoadingOverlay = function() {
      if ((this.isClosed != null) && !this.isClosed) {
        return this.ui.loadingOverlay.hide();
      }
    };

    ResultsWorkflow.prototype.onWindowResize = function() {
      return this.updateContextPanelOffsets();
    };

    ResultsWorkflow.prototype.updateContextPanelOffsets = function() {
      if ((this.isClosed == null) || this.isClosed) {
        return;
      }
      this.workflowTopOffset = this.$el.offset().top;
      this.workflowRightOffset = window.innerWidth - (this.$el.offset().left + this.$el.width());
      this.ui.contextContainer.css('top', this.workflowTopOffset);
      return this.ui.contextContainer.css('right', this.workflowRightOffset);
    };

    ResultsWorkflow.prototype.toggleContextPanelButtonClicked = function() {
      if (this.areFiltersHidden) {
        this.areFiltersManuallyHidden = false;
        return this.showContextPanel();
      } else {
        this.areFiltersManuallyHidden = true;
        return this.hideContextPanel();
      }
    };

    ResultsWorkflow.prototype.showContextPanel = function() {
      this.areFiltersHidden = false;
      this.ui.contextContainer.css('display', 'block');
      this.ui.resultsContainer.addClass('span9');
      this.ui.toggleFiltersButton.tooltip('hide').attr('data-original-title', 'Hide Filter Panel').tooltip('fixTitle');
      this.ui.toggleFiltersIcon.removeClass('icon-collapse-alt');
      this.ui.toggleFiltersIcon.addClass('icon-expand-alt');
      this.ui.toggleFiltersText.html('Hide Filters');
      this.updateContextPanelOffsets();
      return this.$('.context').stacked('restack', this.$el.height());
    };

    ResultsWorkflow.prototype.hideContextPanel = function() {
      this.areFiltersHidden = true;
      this.ui.contextContainer.css('display', 'none');
      this.ui.resultsContainer.removeClass('span9');
      this.ui.toggleFiltersButton.tooltip('hide').attr('data-original-title', 'Show Filter Panel').tooltip('fixTitle');
      this.ui.toggleFiltersIcon.addClass('icon-collapse-alt');
      this.ui.toggleFiltersIcon.removeClass('icon-expand-alt');
      return this.ui.toggleFiltersText.html('Show Filters');
    };

    ResultsWorkflow.prototype.onPageScroll = function() {
      var scrollPos;
      if ((this.isClosed == null) || this.isClosed) {
        return;
      }
      scrollPos = $(document).scrollTop();
      if (this.ui.navbar.hasClass('navbar-fixed-top')) {
        if (scrollPos < (this.navbarVerticalOffset - this.topNavbarHeight)) {
          this.ui.navbar.removeClass('navbar-fixed-top');
          this.ui.contextContainer.css('top', this.workflowTopOffset);
          if (!this.areFiltersManuallyHidden) {
            return this.showContextPanel();
          }
        }
      } else {
        if (scrollPos >= (this.navbarVerticalOffset - this.topNavbarHeight)) {
          this.ui.navbar.css('top', this.topNavbarHeight);
          this.ui.navbar.addClass('navbar-fixed-top');
          this.ui.contextContainer.css('top', this.workflowTopOffset + 35);
          if (!this.areFiltersManuallyHidden) {
            return this.hideContextPanel();
          }
        }
      }
    };

    ResultsWorkflow.prototype.selectPagesOption = function() {
      this.$('#pages-radio-all').prop('checked', false);
      this.$('#pages-radio-ranges').prop('checked', true);
      return this.$('#pages-text-ranges').val('');
    };

    ResultsWorkflow.prototype.changeExportStatus = function(title, newState) {
      var statusContainer;
      statusContainer = this.$(".export-status-" + title + " .span10");
      statusContainer.children().hide();
      switch (newState) {
        case "pending":
          return statusContainer.find('.pending-container').show();
        case "downloading":
          return statusContainer.find('.progress').show();
        case "error":
          return statusContainer.find('.label-important').show();
        case "success":
          return statusContainer.find('.label-success').show();
        case "timeout":
          return statusContainer.find('.label-timeout').show();
      }
    };

    ResultsWorkflow.prototype.onExportFinished = function(exportTypeTitle) {
      this.numPendingDownloads = this.numPendingDownloads - 1;
      this.$('.export-progress-container .badge-info').html(this.numPendingDownloads);
      if (this.hasExportErrorOccurred(exportTypeTitle)) {
        this.changeExportStatus(exportTypeTitle, "error");
      } else if (this.monitors[exportTypeTitle]["execution_time"] > this.monitorTimeout) {
        this.changeExportStatus(exportTypeTitle, "timeout");
      } else {
        this.changeExportStatus(exportTypeTitle, "success");
      }
      if (this.numPendingDownloads === 0) {
        this.$('[data-toggle=export-options]').prop('disabled', false);
        return this.$('.export-progress-container').hide();
      }
    };

    ResultsWorkflow.prototype.hasExportErrorOccurred = function(exportTypeTitle) {
      return this.$("#export-download-" + exportTypeTitle).contents()[0].body.children.length !== 0;
    };

    ResultsWorkflow.prototype.checkExportStatus = function(exportTypeTitle) {
      var cookieName;
      this.monitors[exportTypeTitle]["execution_time"] = this.monitors[exportTypeTitle]["execution_time"] + this.monitorDelay;
      cookieName = "export-type-" + (exportTypeTitle.toLowerCase());
      if (this.getCookie(cookieName) === "complete") {
        clearInterval(this.monitors[exportTypeTitle]["interval"]);
        this.setCookie(cookieName, null);
        return this.onExportFinished(exportTypeTitle);
      } else if (this.monitors[exportTypeTitle]["execution_time"] > this.monitorTimeout || this.hasExportErrorOccurred(exportTypeTitle)) {
        clearInterval(this.monitors[exportTypeTitle]["interval"]);
        return this.onExportFinished(exportTypeTitle);
      }
    };

    ResultsWorkflow.prototype.setCookie = function(name, value) {
      return document.cookie = "" + name + "=" + (escape(value)) + "; path=/";
    };

    ResultsWorkflow.prototype.getCookie = function(name) {
      var endIndex, startIndex, value;
      value = document.cookie;
      startIndex = value.indexOf(" " + name + "=");
      if (startIndex === -1) {
        startIndex = value.indexOf("" + name + "=");
      }
      if (startIndex === -1) {
        value = null;
      } else {
        startIndex = value.indexOf("=", startIndex) + 1;
        endIndex = value.indexOf(";", startIndex);
        if (endIndex === -1) {
          endIndex = value.length;
        }
        value = unescape(value.substring(startIndex, endIndex));
      }
      return value;
    };

    ResultsWorkflow.prototype.startExport = function(exportType, pages) {
      var cookieName, iframe, title, url;
      title = this.$(exportType).attr('title');
      this.changeExportStatus(title, "downloading");
      cookieName = "export-type-" + (title.toLowerCase());
      this.setCookie(cookieName, null);
      url = this.$(exportType).attr('href');
      if (url[url.length - 1] !== "/") {
        url = "" + url + "/";
      }
      url = "" + url + pages;
      iframe = "<iframe id=export-download-" + title + " src=" + url + " style='display: none'></iframe>";
      this.$('.export-iframe-container').append(iframe);
      if (this.data.exporters.notifiesOnComplete()) {
        this.monitors[title] = {};
        this.monitors[title]["execution_time"] = 0;
        return this.monitors[title]["interval"] = setInterval(this.checkExportStatus, this.monitorDelay, title);
      } else {
        return setTimeout(this.onExportFinished, this.requestTimeout, title);
      }
    };

    ResultsWorkflow.prototype.initializeExportStatusIndicators = function(selectedTypes) {
      var st, _i, _len, _results;
      this.$('.export-status-container').children().hide();
      _results = [];
      for (_i = 0, _len = selectedTypes.length; _i < _len; _i++) {
        st = selectedTypes[_i];
        _results.push(this.$(".export-status-" + st.title).show());
      }
      return _results;
    };

    ResultsWorkflow.prototype.isPageRangeValid = function() {
      var pageRange;
      if (this.$('input[name=pages-radio]:checked').val() === "all") {
        return true;
      } else {
        pageRange = this.$('#pages-text-ranges').val();
        return this.pageRangePattern.test(pageRange);
      }
    };

    ResultsWorkflow.prototype.exportData = function(event) {
      var delay, i, pagesSuffix, selectedTypes, _i, _ref, _results;
      this.$('.export-iframe-container').empty();
      selectedTypes = this.$('input[name=export-type-checkbox]:checked');
      if (selectedTypes.length === 0) {
        this.$('#export-error-message').html('An export type must be selected.');
        return this.$('.export-options-modal .alert-block').show();
      } else if (!this.isPageRangeValid()) {
        this.$('#export-error-message').html('Please enter a valid page range. The page range must be a single page(example: 1) or a range of pages(example: 2...5).');
        return this.$('.export-options-modal .alert-block').show();
      } else {
        this.numPendingDownloads = selectedTypes.length;
        pagesSuffix = "";
        if (this.$('input[name=pages-radio]:checked').val() !== "all") {
          pagesSuffix = this.$('#pages-text-ranges').val() + "/";
        }
        this.$("[data-toggle=export-options]").prop('disabled', true);
        this.$('.export-progress-container').show();
        this.$('.export-progress-container .badge-info').html(this.numPendingDownloads);
        this.ui.exportOptions.modal('hide');
        this.initializeExportStatusIndicators(selectedTypes);
        this.ui.exportProgress.modal('show');
        delay = this.requestDelay;
        if (!this.data.exporters.notifiesOnComplete()) {
          delay = this.requestTimeout;
        }
        _results = [];
        for (i = _i = 0, _ref = selectedTypes.length - 1; _i <= _ref; i = _i += 1) {
          this.changeExportStatus(this.$(selectedTypes[i]).attr('title'), "pending");
          _results.push(setTimeout(this.startExport, i * delay, selectedTypes[i], pagesSuffix));
        }
        return _results;
      }
    };

    ResultsWorkflow.prototype.onRender = function() {
      var topElement;
      if (!c.isSupported('2.1.0')) {
        this.ui.saveQueryToggle.remove();
        this.ui.saveQuery.remove();
      }
      this.paginator.show(new c.ui.Paginator({
        model: this.data.results
      }));
      this.count.show(new ResultCount({
        model: this.data.results,
        context: this.data.context
      }));
      this.exportTypes.show(new c.ui.ExportTypeCollection({
        collection: this.data.exporters
      }));
      this.exportProgress.show(new c.ui.ExportProgressCollection({
        collection: this.data.exporters
      }));
      this.resultDetailsModal.show(new modal.ResultDetails);
      this.saveQueryModal.show(new c.ui.EditQueryDialog({
        header: 'Save Query',
        view: this.data.view,
        context: this.data.context,
        collection: this.data.queries
      }));
      this.context.show(new c.ui.ContextPanel({
        model: this.data.context
      }));
      this.context.currentView.$el.stacked({
        fluid: '.tree-region'
      });
      this.table.show(new tables.ResultTable({
        collection: this.data.results,
        view: this.data.view
      }));
      this.table.currentView.on('render', (function(_this) {
        return function() {
          return _this.$('.context').stacked('restack', _this.$el.height());
        };
      })(this));
      this.columns.show(new c.ui.ConceptColumns({
        view: this.data.view,
        concepts: this.data.concepts
      }));
      this.ui.navbarButtons.tooltip({
        animation: false,
        placement: 'bottom'
      });
      if (this.navbarVerticalOffset == null) {
        this.navbarVerticalOffset = this.ui.navbar.offset().top;
      }
      if (this.topNavbarHeight == null) {
        topElement = $('.navbar-fixed-top');
        if (topElement.length) {
          this.topNavbarHeight = topElement.height();
        } else {
          this.topNavbarHeight = 0;
        }
      }
      if (this.workflowTopOffset == null) {
        return this.updateContextPanelOffsets();
      }
    };

    ResultsWorkflow.prototype.showExportOptions = function() {
      this.$('.export-options-modal .alert-block').hide();
      this.ui.exportOptions.modal('show');
      if (this.data.exporters.length === 0) {
        return this.$('.export-options-modal .btn-primary').prop('disabled', true);
      }
    };

    ResultsWorkflow.prototype.showExportProgress = function() {
      return this.ui.exportProgress.modal('show');
    };

    ResultsWorkflow.prototype.showSaveQuery = function() {
      return this.saveQueryModal.currentView.open();
    };

    ResultsWorkflow.prototype.renderPhenotypes = function(model, response) {
      var attr;
      if (!this.ui.viewPhenotype.is(":visible")) {
        return;
      }
      this.ui.viewPhenotype.find(".loading").hide();
      attr = model.attributes;
      if (attr.hpoAnnotations && attr.hpoAnnotations.length) {
        attr.hpoAnnotations = _.sortBy(attr.hpoAnnotations, function(value) {
          return parseInt(value.priority) || model.lowestPriority + 1;
        });
      }
      if (attr.confirmedDiagnoses && attr.confirmedDiagnoses.length) {
        attr.confirmedDiagnoses = _.sortBy(attr.confirmedDiagnoses, function(value) {
          return parseInt(value.priority) || model.lowestPriority + 1;
        });
      }
      if (attr.suspectedDiagnoses && attr.suspectedDiagnoses.length) {
        attr.suspectedDiagnoses = _.sortBy(attr.suspectedDiagnoses, function(value) {
          return parseInt(value.priority) || model.lowestPriority + 1;
        });
      }
      if (attr.ruledOutDiagnoses && attr.ruledOutDiagnoses.length) {
        attr.ruledOutDiagnoses = _.sortBy(attr.ruledOutDiagnoses, function(value) {
          return parseInt(value.priority) || model.lowestPriority + 1;
        });
      }
      this.ui.viewPhenotype.find(".content").html(templates.phenotypes(model.attributes));
      return this.phenotypeXhr = void 0;
    };

    ResultsWorkflow.prototype.hidePhenotypes = function() {
      if (this.phenotypeXhr) {
        this.phenotypeXhr.abort();
      }
      this.phenotypeXhr = void 0;
      this.ui.viewPhenotype.find(".content").empty();
      return this.ui.viewPhenotype.find(".loading").show();
    };

    ResultsWorkflow.prototype.phenotypesError = function(model, response) {
      var _ref;
      if (response.statusText === "abort") {
        return;
      }
      this.ui.viewPhenotype.find(".loading").hide();
      if ((model != null ? (_ref = model.attributes) != null ? _ref.sample_id : void 0 : void 0) != null) {
        this.ui.viewPhenotype.find(".content").html("<p>An error was encountered. " + ("Unable to retrieve phenotypes for sample '" + model.attributes.sample_id + "'.</p>"));
      } else {
        this.ui.viewPhenotype.find(".content").html("<p>An error was encountered. No sample is selected.</p>");
      }
      return this.phenotypeXhr = void 0;
    };

    ResultsWorkflow.prototype.sampleID = function() {
      var json, sample;
      sample = "various samples";
      if ((this.data.context != null) && ((json = this.data.context.get('json')) != null)) {
        _.each(json.children, function(child) {
          if ((child.concept != null) && child.concept === 2) {
            return sample = child.children[0].value[0].label;
          }
        });
      }
      return sample;
    };

    ResultsWorkflow.prototype.retrievePhenotypes = function() {
      var phenotypes, sampleID;
      sampleID = this.sampleID();
      if (sampleID) {
        $('.phenotype-sample-label').html("(" + sampleID + ")");
        phenotypes = new models.Phenotype({
          sample_id: sampleID
        });
        return this.phenotypeXhr = phenotypes.fetch({
          success: this.renderPhenotypes,
          error: this.phenotypesError
        });
      } else {
        $('.phenotype-sample-label').html("");
        return this.phenotypesError(phenotypes, {});
      }
    };

    return ResultsWorkflow;

  })(Marionette.Layout);
  return {
    ResultsWorkflow: ResultsWorkflow
  };
});
