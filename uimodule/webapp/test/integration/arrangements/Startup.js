sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("godrej.liberacion.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "godrej.liberacion",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
