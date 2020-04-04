/**
 * Created by shawn on 2017-06-23.
 */

if (!dexit.scm) {
    dexit.scm = {};
}


dexit.scm.integration = {




    prepareComponents: function (editor) {

        var comps = editor.DomComponents;

        // Get the model and the view from the default Component type
        var defaultType = comps.getType('default');
        var defaultModel = defaultType.model;
        var defaultView = defaultType.view;


        comps.addType('ep-element', {
            // Define the Model
            model: defaultModel.extend({
                    // Extend default properties
                    defaults: Object.assign({}, defaultModel.prototype.defaults, {
                        // Can be dropped only inside `form` elements
                        draggable: 'form, form *',
                        // Can't drop other elements inside it
                        droppable: false,
                        // Traits (Settings)
                        traits: ['name', 'placeholder', {
                            // Change the type of the input (text, password, email, etc.)
                            type: 'select',
                            label: 'Type',
                            name: 'type',
                            options: inputTypes,
                        },{
                            // Can make it required for the form
                            type: 'checkbox',
                            label: 'Required',
                            name: 'required',
                        }],
                    }),
                },
                // The second argument of .extend are static methods and we'll put inside our
                // isComponent() method. As you're putting a new Component type on top of the stack,
                // not declaring isComponent() might probably break stuff, especially if you extend
                // the default one.
                {
                    isComponent: function(el) {
                        if(el.tagName == 'EP-ELEMENT'){
                            return {type: 'ep-element'};
                        }
                    },
                }),

            // Define the View, add event for drop
            view: defaultType.view.extend({
                events: {
                    // If you want to bind the event to children elements
                    // 'click .someChildrenClass': 'methodName',
                    click: 'handleClick',
                    dblclick: function(){
                        alert('Hi!');
                    }
                },
            })
        });



    },




};
