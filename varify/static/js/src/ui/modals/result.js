/* global define */

define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    '../../utils',
    '../variant'
], function($, _, Backbone, Marionette, utils, variant) {

    var ResultDetails = Marionette.Layout.extend({
        id: 'result-details-modal',

        className: 'modal hide',

        // Fairly arbitray, mostly chosen because it was close to normal height
        // of the sample summary item(1st item in upper left).
        maxExpandableHeight: 300,
        showLessText: 'Show Less...',
        showMoreText: 'Show More...',

        template: 'varify/modals/result',

        ui: {
            expandableRows: '[data-target=expandable-row]',
            expandableItems: '.expandable-item',
            expandCollapseLinks: '[data-target=expand-collapse-link]',
            linkContainers: '.expand-collapse-container'
        },

        regions: {
            summary: '[data-target=summary]',
            effects: '[data-target=effects]',
            phenotypes: '[data-target=phenotypes]',
            scores: '[data-target=prediction-scores]',
            cohorts: '[data-target=cohorts]',
            frequencies: '[data-target=frequencies]',
            articles: '[data-target=articles]',
            clinvar: '[data-target=clinvar]',
            assessmentMetrics: '[data-target=assessment-metrics]'
        },

        events: {
            'click [data-action=close-result-modal]': 'close',
            'click @ui.expandCollapseLinks': 'toggleExpandedState'
        },

        close: function() {
            this.$el.modal('hide');
        },

        onRender: function() {
            this.$el.modal({
                show: false,
                keyboard: false,
                backdrop: 'static'
            });
        },

        /* jshint ignore:start */

        /*
         *
         * Reset state of all the expand/collapse links based on whether their
         * item is overflowing. Overflow detection code adapted from Mohsen's
         * answer here:
         *      http://stackoverflow.com/questions/7668636/check-with-jquery-if-div-has-overflowing-elements
         *
         */

        /* jshint ignore:end */
        _checkForOverflow: function() {
            _.each(this.ui.expandableItems, function(element) {
                var child, hasOverflow = false;

                /*
                 * Note, we purposefully ignore horizontal overflow as it just
                 * isn't relevent here. Note, we use the maxExpandableHeight
                 * here rather than the properties of element to compute
                 * overflow because it is more consistent. element.offsetTop
                 * is measured from the 'content' div while individual children
                 * have their top offset calculated relative to the element
                 * itself so we use maxExpandableHeight to avoid doing any
                 * translations.
                 */
                for (var i = 0; i < element.children.length; i++) {
                    child = element.children[i];

                    if ((child.offsetTop + child.offsetHeight) >
                            this.maxExpandableHeight) {
                        hasOverflow = true;
                        break;
                    }
                }

                // We handle both cases because an item previously might have
                // have been bounded and is now overflown or vice-versa and we
                // want to match the current regardless of previous states.
                if (hasOverflow) {
                    $(element).find(this.ui.linkContainers).show();
                }
                else {
                    $(element).find(this.ui.linkContainers).hide();
                }

            }, this);
        },

        // Toggles the expanded/collapsed state of the row containing the item
        // containing the clicked link.
        toggleExpandedState: function(event) {
            var element, parent;

            element = $(event.target);
            parent = element.closest(this.ui.expandableRows);

            // We essentially link all the expand/collapse links in a single
            // row to take the same action. So, when one is used to expand, all
            // other links in the row get updated in the same fasion to keep
            // them all in sync.
            if (element.text() === this.showMoreText) {
                parent.find(this.ui.expandCollapseLinks)
                      .text(this.showLessText);
                parent.css('height', 'auto')
                      .css('overflow', 'visible');
            }
            else {
                parent.find(this.ui.expandCollapseLinks)
                      .text(this.showMoreText);
                parent.css('height', this.maxExpandableHeight)
                      .css('overflow', 'hidden');
            }
        },

        open: function(result) {
            this.model = result;

            this.summary.show(new variant.Summary({
                model: this.model
            }));

            // We exclude effects that don't have a transcript because the
            // minimum required data we need to display an effect is held
            // within the transcript object.
            this.effects.show(new variant.Effects({
                collection: new Backbone.Collection(utils.groupEffectsByType(
                    _.filter(this.model.get('variant').effects, function(effect) {
                        return effect.transcript !== null;
                    })
                ))
            }));

            this.phenotypes.show(new variant.Phenotypes({
                collection: new Backbone.Collection(
                    utils.groupPhenotypesByType(this.model.get('variant'))
                )
            }));

            this.scores.show(new variant.PredictionScores({
                model: new Backbone.Model(this.model.get('variant'))
            }));

            this.cohorts.show(new variant.Cohorts({
                collection: new Backbone.Collection(
                    this.model.get('variant').cohorts
                )
            }));

            this.frequencies.show(new variant.Frequencies({
                model: new Backbone.Model(this.model.get('variant'))
            }));

            this.articles.show(new variant.Articles({
                collection: new Backbone.Collection(
                    utils.groupArticlesByType(this.model.get('variant'))
                )
            }));

            var clinvarResults;
            if (this.model.get('solvebio') &&
                    this.model.get('solvebio').clinvar) {
                clinvarResults = this.model.get('solvebio').clinvar.results;
            }
            clinvarResults = clinvarResults || [];
            this.clinvar.show(new variant.Clinvar({
                collection: new Backbone.Collection(clinvarResults)
            }));

            this.assessmentMetrics.show(new variant.AssessmentMetrics({
                variantId: this.model.get('variant').id,
            }));

            this.$el.modal('show');

            // Since the UI elements are bound before rendering, many of the
            // UI elements we need access to to will not be found at this point
            // as they did not exist in the templates and therefore would not
            // be found during the normal UI binding call. We rebind here so
            // since all the elements should now be available as all the
            // regions have been populated and their views shown.
            this.bindUIElements();

            // Reset the row and item heights and overflow styles as they may
            // have been toggled previously.
            this.ui.expandableRows
                .css('height', '' + this.maxExpandableHeight + 'px')
                .css('overflow', 'hidden');
            this.ui.expandCollapseLinks.text(this.showMoreText);

            this._checkForOverflow();
        }

    });

    return {
        ResultDetails: ResultDetails
    };

});
