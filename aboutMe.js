$(function () {
    var aboutMe = Backbone.Model.extend({

        defaults: function () {
            return {
                title: "empty...",
                order: aboutMes.nextOrder(),
                done: false
            };
        },

        toggle: function () {
            this.save({done: !this.get("done")});
        }

    });

    var aboutMeList = Backbone.Collection.extend({
        model: aboutMe,
//        localStorage: new Backbone.LocalStorage("aboutMe-backbone"),
        
        done: function () {
            return this.where({done: true});
        },

        remaining: function () {
            return this.where({done: false});
        },

        nextOrder: function () {
            if (!this.length) {
                return 1;
            }
            return this.last().get('order') + 1;
        },
        comparator: 'order'
    });
    var aboutMes = new aboutMeList;
    var AboutMeView = Backbone.View.extend({
        tagName: "li",
		
        template: _.template($('#item-template').html()),	
	
        events: {
            "click .toggle"   : "toggleDone",
            "dblclick .view"  : "edit",
            "click a.destroy" : "clear",
            "keypress .edit"  : "updateOnEnter",
            "blur .edit"      : "close"
        },

        initialize: function () {
            this.listenTo(this.model,  'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('done', this.model.get('done'));
            this.input = this.$('.edit');
            return this;
        },

        toggleDone: function () {
            this.model.toggle();
        },

        edit: function () {
            this.$el.addClass("editing");
            this.input.focus();
        },

        close: function () {
            var value = this.input.val();
            if (!value) {
                this.clear();
            } else {
                this.model.save({title: value});
                this.$el.removeClass("editing");
            }
        },
		
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                this.close();
            }
        },

        clear: function () {
            this.model.destroy();
        }
    });

	//the application
    var AppView = Backbone.View.extend({

         el: $("#aboutmeapp"),

         statsTemplate: _.template($('#stats-template').html()),

         events: {
             "keypress #new-aboutme": "createOnEnter",
             "click #clear-completed": "clearCompleted",
             "click #toggle-all": "toggleAllComplete"
         },

         initialize: function () {
             this.input = this.$("#new-aboutme");
             this.allCheckbox = this.$("#toggle-all")[0];

             this.listenTo(aboutMes, 'add', this.addOne);
             this.listenTo(aboutMes, 'reset', this.addAll);
             this.listenTo(aboutMes, 'all', this.render);
			
             this.footer = this.$('footer');
             this.main = $('#main');
			
             aboutMes.fetch();
         },

         render: function () {
             var done = aboutMes.done().length;
             var remaining = aboutMes.remaining().length;
			
             if(aboutMes.length){
                 this.main.show();
                 this.footer.show();
                 this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
             } else {
                 this.main.hide();
                 this.footer.hide();
             }
		
             this.allCheckbox.checked = !remaining;

         },

         addOne: function (aboutMe) {
             var view = new AboutMeView({model : aboutMe});
             this.$("#aboutme-list").append(view.render().el);
         },

         addAll: function () {
             aboutMes.each(this.addOne, this);
         },

         createOnEnter: function (e) {
             if (e.keyCode != 13){
                 return;
             }
	     if (!this.input.val()){
                 return;
             }
             aboutMes.create({title: this.input.val()});
             this.input.val('');
         },

         clearCompleted: function () {
             _.invoke(aboutMes.done(), 'destroy');
             return false;
         },

         toggleAllComplete: function () {
             var done = this.allCheckbox.checked;
             aboutMes.each(function (aboutMe) { aboutMe.save({'done' : done}); });
         }
    });
    var App = new AppView;
});
