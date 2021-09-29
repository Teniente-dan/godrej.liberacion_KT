sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "godrej/liberacion/model/formatter",
  ],
  function (Controller, History, UIComponent, formatter) {
    "use strict";

    return Controller.extend("godrej.liberacion.controller.BaseController", {
      formatter: formatter,
      stepsDic: [{
          key: "1",
          text: "paso1",
          icon: "sap-icon://basket",
          en: true
        },
        {
          key: "2",
          text: "paso2",
          icon: "sap-icon://bar-code",
          en: true
        },
        {
          key: "3",
          text: "paso3",
          icon: "sap-icon://bbyd-dashboard",
          en: true
        },
        {
          key: "4",
          text: "paso4",
          icon: "sap-icon://bell",
          en: true
        },
        {
          key: "5",
          text: "paso5",
          icon: "sap-icon://burglary",
          en: true
        },
        {
          key: "",
          text: "",
          icon: "",
          en: true
        },
      ],
      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @public
       * @param {string} sName the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },
      /**
       * Convenience method for setting the view model in every controller of the application.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
       * Convenience method for getting the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      get18: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      /**
       * Method for navigation to specific view
       * @public
       * @param {string} psTarget Parameter containing the string for the target navigation
       * @param {Object.<string, string>} pmParameters? Parameters for navigation
       * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
       */
      navTo: function (psTarget, pmParameters, pbReplace) {
        this.getRouter().navTo(psTarget, pmParameters, pbReplace);
      },

      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.back();
        } else {
          this.getRouter().navTo("appHome", {}, true /*no history*/ );
        }
      },

      //   Utilidades
      setSelectedText: function (val) {
        var text = this.stepsDic.filter((element) => {
          return element.key === val
        });
        return (text.length>0 ? text[0].text : val);;
      },
    });
  }
);