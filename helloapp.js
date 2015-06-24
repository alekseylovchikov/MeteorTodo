Tasks = new Mongo.Collection('tasks');

if(Meteor.isClient) {
    Meteor.subscribe('tasks');

    Template.body.helpers({
        hideCompleted: function () {
            return Session.get("hideCompleted");
        },
        incompleteCount: function() {
            return Tasks.find({owner: Meteor.userId()}, {checked: {$ne: true}}).count();
        }
    });

    Template.body.events({
        "change .hide-completed input": function (event) {
            Session.set("hideCompleted", event.target.checked);
        },
        "submit .add-new-user": function(event) {
            var task = event.target.task.value;
            var category = event.target.category.value;

            Meteor.call('addNewTask', task.toUpperCase(), category);
            event.target.task.value = "";

            return false;
        },
        "change #choiceCategory": function() {
            getC = $("choiceCategory").val();
            Session.set('showCategory', getC);
        }
    });

    Template.tasks.helpers({
        users: function () {
            if(Session.get("hideCompleted")) {
                return Tasks.find({owner: Meteor.userId(), checked: {$ne: true}}, {sort: {udate: -1}});
            } else {
                return Tasks.find({owner: Meteor.userId()}, {sort: {udate: -1}});
            }
        },
        isEmpty: function() {
            if(Tasks.find({owner: Meteor.userId()}).count() === 0 || Tasks.find({checked: true}).count() === 0) {
                return false;
            } else {
                return true;
            }
        }
    });

    Template.tasks.events({
        "click .toggle-checked": function() {
            Meteor.call('updateTask', this._id, this.checked);
        },
        "click .delete": function() {
            Meteor.call('deleteTask', this._id);
        },
        "click .delall": function() {
            Meteor.call('deleteCheckedTask');
        },
        "click #doing": function() {
            Meteor.call('updateTask', this._id, this.checked);
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

Meteor.methods({
    addNewTask: function(taskText, categoryText) {
        if(!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.insert({
            task: taskText,
            category: categoryText,
            udate: new Date(),
            checked: false,
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    },
    updateTask: function(taskId, taskChecked) {
        Tasks.update(taskId, {$set: {checked: ! taskChecked}});
    },
    deleteTask: function(taskId) {
        Tasks.remove(taskId);
    },
    deleteCheckedTask: function() {
        Tasks.remove({owner: Meteor.userId(), checked: true});
    }
});

if(Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.publish('tasks', function() {
            return Tasks.find({});
        });
    });
}
