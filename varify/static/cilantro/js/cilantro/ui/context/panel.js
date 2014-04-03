define(["underscore","marionette","../base","../core","./tree","./info","./actions"],function(t,e,i,n,o,s,r){var a=e.Layout.extend({id:"context-panel",className:"panel panel-right closed",template:"context/panel",errorView:i.ErrorOverlayView,modelEvents:{sync:"hideLoadView",error:"showErrorView",request:"showLoadView"},regions:{info:".info-region",tree:".tree-region",actions:".actions-region"},regionViews:{info:s.ContextInfo,tree:o.ContextTree,actions:r.ContextActions},showLoadView:function(){this.$el.addClass("loading")},hideLoadView:function(){this.$el.removeClass("loading")},showErrorView:function(){var t=new this.errorView({target:this.$el});t.render()},onRender:function(){this.$el.panel();var t=new this.regionViews.info({model:this.model}),e=new this.regionViews.actions({model:this.model}),i=new this.regionViews.tree({model:this.model,collection:this.model.manager.upstream.children});this.info.show(t),this.actions.show(e),this.tree.show(i)},openPanel:function(t){this.$el.panel("open",t)},closePanel:function(t){this.$el.panel("close",t)},isPanelOpen:function(t){return this.$el.data("panel").isOpen(t)},isPanelClosed:function(t){return this.$el.data("panel").isClosed(t)}});return{ContextPanel:a}});
//@ sourceMappingURL=panel.js.map