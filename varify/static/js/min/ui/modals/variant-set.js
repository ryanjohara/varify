define(["jquery","underscore","cilantro","marionette"],function(e,t,n,r){var i=r.ItemView.extend({id:"variant-set-dialog",className:"modal hide",template:"varify/modals/variant-set",ui:{close:"[data-target=close]",createdName:"[data-target=created-name]",description:"[data-target=description]",error:"[data-target=error-message]",fileChooser:"[data-target=file]",fileChooserContainer:"[data-target=file-container]",form:"form",invalidContainer:"[data-target=invalid-container]",invalidCount:"[data-target=invalid-count]",invalidTable:"[data-target=invalid-table]",loading:"[data-target=loading-message]",name:"[data-target=name]",save:"[data-target=save]",sourceRadios:"input[name=source]",successMessage:"[data-target=success-message]",validCount:"[data-target=valid-count]"},events:{"change @ui.sourceRadios":"onSourceChange","change input":"onInputChange","keyup input":"onInputChange","click @ui.close":"close","click @ui.save":"save"},initialize:function(){t.bindAll(this,"onSuccess","onError","close")},_reset:function(){this.$("input:not([type=radio])").val(""),this.ui.sourceRadios.prop("checked",!1),this.ui.sourceRadios.filter("[value=file]").prop("checked",!0),this.ui.fileChooserContainer.show(),this.ui.loading.hide(),this.ui.error.hide(),this.ui.successMessage.hide(),this.ui.form.show()},close:function(){this._reset(),this.$el.modal("hide")},open:function(e){this.sample=e,this.$el.modal("show")},onInputChange:function(){var e=!1;this.ui.name.val()||(e=!0),this.ui.sourceRadios.filter(":checked").val()==="file"&&!this.ui.fileChooser.val()&&(e=!0),this.ui.save.prop("disabled",e)},onSourceChange:function(e){e.target.value==="file"?this.ui.fileChooserContainer.show():this.ui.fileChooserContainer.hide()},onRender:function(){this.$el.modal({backdrop:"static",keyboard:!1,show:!1})},onSuccess:function(e){this.ui.createdName.text(e.get("name")),this.ui.validCount.text(e.get("count"));var t=e.get("invalid_records");if(t&&t.length){this.ui.invalidCount.text(t.length);var r=[],i;for(var s=0;s<t.length;s++)i=t[s],r.push("<tr>"),r.push("<td>"+i.chr+"</td>"),r.push("<td>"+i.start+"</td>"),r.push("<td>"+i.ref+"</td>"),r.push("<td>"+i.allele1+"</td>"),r.push("<td>"+i.allele2+"</td>"),r.push("<td>"+i.dbsnp+"</td>"),r.push("</tr>");this.ui.invalidTable.html(r.join("")),this.ui.invalidContainer.show()}else this.ui.invalidContainer.hide();this.$el.hasClass("in")?(this.ui.loading.hide(),this.ui.successMessage.show()):n.notify({header:"Variant Set Created",level:"info",timeout:5e3,message:this.ui.successMessage.html()})},onError:function(){this.$el.hasClass("in")?(this.ui.loading.hide(),this.ui.error.show()):n.notify({header:"Error Creating Variant Set",level:"error",timeout:!1,message:this.ui.error.text()})},save:function(e){e.preventDefault(),this.ui.save.prop("disabled",!0),this.ui.form.hide(),this.ui.loading.show();var n={name:this.ui.name.val(),description:this.ui.description.val()},r={wait:!0,success:this.onSuccess,error:this.onError};if(this.ui.sourceRadios.filter(":checked").val()==="file"){var i=new FormData,s=this.ui.fileChooser.prop("files")[0];i.append("source",s,s.name),i.append("name",this.ui.name.val()),i.append("description",this.ui.description.val()),r=t.extend(r,{data:i,processData:!1,contentType:!1})}this.sample.variantSets.create(n,r)}});return{VariantSetDialog:i}})