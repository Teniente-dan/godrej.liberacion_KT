sap.ui.define(
  ["godrej/liberacion/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/core/Fragment",
  ],
  function (BaseController,
    JSONModel,
    MessageBox,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Text,
    Fragment) {
    "use strict";

    return BaseController.extend("godrej.liberacion.controller.MainView", {
      /**
       * @override
       */
      onInit: function () {
        console.log("")
        this.mainModel = this.getModel();
        // CONFIG
        var oFilter = this.getView().byId("filterbar"),
          that = this;
        oFilter.addEventDelegate({
          onAfterRendering: function (oEvent) {
            var oButton = oEvent.srcControl._oSearchButton;
            oButton.setIcon(that.get18().getText("filtroBuscarIcono"));
            oButton.setText(that.get18().getText("filtroBuscarTexto"));
            var oFilterButton = oEvent.srcControl._oFiltersButton;
            oFilterButton.setText(that.get18().getText("filtroFilterTexto"));
            var oRestoreButton = oEvent.srcControl._oRestoreButtonOnFB;
            oRestoreButton.setIcon(that.get18().getText("filtroRestoreIcono"));
            oRestoreButton.setText(that.get18().getText("filtroRestoreTexto"));
          },
        });
        var oViewModel = this._createViewModel();
        this.getView().setModel(oViewModel, "view");

        this.mainTab = this.byId("mainTable");
        this.headApprove = false;
        this.setModel(new JSONModel({
          approved: "E0002"
        }), "estatus");
      },
      _createViewModel: function () {
        return new JSONModel({
          title: this.get18().getText("headerPedidos", [0]),
        });
      },
      onHandleBuscar: function (oEvent) {
        console.log("onHandelBuscar");
        var that = this;
        if (this.valInputs()) {
          this.getPedidos().then((resJSONModel) => {
            resJSONModel.setSizeLimit(10000);
            that.getView().setModel(resJSONModel, "pedidos");
            this.mainTab.setBusy(false);
          }).catch((error) => {
            MessageBox.error(error.responseText || error.message);
            this.mainTab.setBusy(false);
          });
        } else {
          MessageBox.error(this.get18().getText("inputSearchVal"));
        }
      },

      valInputs: function () {
        var inputOk = true;
        $(".filterInputs").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          if (oControl.getValue() === "") {
            oControl.setValueState("Error");
            inputOk = false;
          };
        });
        return inputOk;
      },
      getFilterValues: function () {
        var filtros = [];
        filtros.push({
          Campo: "Vbeln",
          Sign: "",
          Option: "",
          Low: this.byId("filterPedidoInput1").getValue(),
          High: this.byId("filterPedidoInput2").getValue(),
          Group: ""
        });
        filtros.push({
          Campo: "Erdat",
          Sign: "",
          Option: "",
          Low: this.formatDate(this.byId("filterFechaDatePicker").getDateValue()),
          High: this.formatDate(this.byId("filterFechaDatePicker").getSecondDateValue()),
          Group: ""
        });
        return filtros;
      },
      formatDate: function (oDate) {
        if (oDate) {
          function parse(t, a) {
            function format(m) {
              let f = new Intl.DateTimeFormat("en", m);
              return f.format(t).padStart(2, "0");
            }
            return a.map(format);
          }
          var a = [{
              year: "numeric"
            },
            {
              month: "numeric"
            },
            {
              day: "numeric"
            },
          ];
          let s = parse(oDate, a);
          return s[0] + s[1] + s[2];
        }
      },
      getPedidos: function () {
        var valuesToBack = this.getFilterValues();
        var oPayload = {
          "Cadena": "VUELTA",
          "to_filtros": valuesToBack,
          "to_vuelta": [{
            Vbeln: "Req"
          }]
        };
        this.mainTab.setBusy(true);
        return new Promise((resolve, reject) => {
          this.mainModel.create("/BaseSet", oPayload, {
            success: function (req, res) {
              res.data.to_vuelta.results.forEach((element) => {
                element.resEnabled = false;
              })
              resolve(new JSONModel(res.data.to_vuelta.results));
            },
            error: function (error) {
              reject(error);
            },
          });
        });
      },
      onRefresh: function (oEvent) {
        console.log("onRefresh");
        this.clearInputs();
        this.clearTab();
      },
      clearInputs: function () {
        $(".filterInputs").each((i, e) => {
          var domRef = document.getElementById(e.id);
          var oControl = $(domRef).control()[0];
          oControl.setValue("");
        });
      },
      clearTab: function () {
        this.getModel("pedidos").setProperty("/");
        this.getModel("pedidos").refresh();
      },
      onTableUpdateFinished: function (oEvent) {
        console.log("onTableUpadteFinished");
        this.getModel("view").setProperty("/title", this.get18().getText("headerPedidos", [this.mainTab.getItems().length]));
      },

      onSubmitSel: function (oEvent, param) {
        console.log("onFreeOrders");
        this.headApprove = param === "Approve" ? true : false;
        this.onApproveDialogPress();
      },
      onApproveDialogPress: function () {
        if (!this.oApproveDialog) {
          this.oApproveDialog = new Dialog({
            type: DialogType.Message,
            icon: this.get18().getText("submitIcon"),
            title: this.get18().getText("submitConfirmation"),
            state: "Warning",
            content: new Text({
              text: this.get18().getText("submitConfirmationQuestion")
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: this.get18().getText("submitSend"),
              press: function () {
                this.releaseOrders();
                this.oApproveDialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              text: this.get18().getText("submitCancel"),
              press: function () {
                this.oApproveDialog.close();
              }.bind(this)
            })
          });
        }
        this.oApproveDialog.open();
      },
      releaseOrders: function () {
        var oTable = this.mainTab;
        var approveStatus = this.getModel("estatus").getData().approved;
        var aData = (oTable.getSelectedItems() || []).map(function (oItem) {
          var itemData = oItem.getBindingContext("pedidos").getObject();
          itemData.lineobject = oItem;
          return itemData;
        }, this).filter(element => element.StComercialCode !== approveStatus);
        console.log("releasedOrders");
        this.mainModel.setUseBatch(false);
        this.errorTab = [];
        this.resultTab = [];
        aData.forEach((element, idx, arr) => {
          element.lineobject.getAggregation("cells").find(x => x.sId.includes("resButton")).setBusy(true);
          this.submitToBack(element, true).then(res => {
            this.addResults(res, element.lineobject);
            this.resultTab.push({
              Vbeln: element.Vbeln,
              res: res
            });
          }).catch((error) => {
            element.lineobject.getAggregation("cells").find(x => x.sId.includes("resButton")).setBusy(false);
            element.lineobject.setHighlight("Error");
            this.errorTab.push({
              Vbeln: element.Vbeln,
              error: error
            });
          });
        });
        oTable.removeSelections(true);
      },
      submitToBack: function (data, approve) {
        var oPayload = {
          "Cadena": "CAMBIO",
          "to_cambio": [{}],
          "to_vuelta": [{
            Vbeln: data.Vbeln,
            Status: (approve ? "APPROVE" : "REJECT")
          }]
        };
        return new Promise((resolve, reject) => {
          console.log("submitToBack: " + data.Vbeln);
          this.mainModel.create("/BaseSet", oPayload, {
            success: function (req, res) {
              resolve(res.data.to_cambio.results);
            },
            error: function (error) {
              reject(error);
            },
          });
        });
      },
      handleTableSelectionChange: function (oEvent) {
        console.log("handleTableSelectionChange");
        if (oEvent.getSource().getSelectedItems().length > 0) {
          this.byId("headerButApprove").setEnabled(true);
          this.byId("headerButReject").setEnabled(true);
        } else {
          this.byId("headerButApprove").setEnabled(false);
          this.byId("headerButReject").setEnabled(false);
        };
      },
      inputChange: function (oEvent) {
        console.log("inputChange");
        var srcControl = oEvent.getSource();
        if (srcControl.getValue() === "") {
          srcControl.setValueState("Error");
        } else {
          srcControl.setValueState("None");
        }
      },
      onSubmitLine: function (oEvent, param) {
        console.log("onSumbitline:" + param);
        var oLine = oEvent.getSource();
        var oLineItem = oLine.getParent().getParent();
        this.manageLineBut(oLine, param === "Approve" ? true : false, param === "Approve" ? "Reject" : "Approve");
        if (oEvent.getParameter("pressed")) {
          oLineItem.getAggregation("cells").find(x => x.sId.includes("resButton")).setBusy(true);
          this.submitToBack(oLine.getBindingContext("pedidos").getObject(), (param === "Approve" ? true : false)).then((res) => {
            this.addResults(res, oLineItem, true);
          }).catch((error) => {
            oLineItem.getAggregation("cells").find(x => x.sId.includes("resButton")).setBusy(false);
            oLineItem.setHighlight("Error");
            MessageBox.error(error.responseText || error.message);
          });
        }
      },
      addResults: function (res, oLineItem, col) {
        var statusOutput = this.parseSubmitResult(res);
        var lineData = this.getModel("pedidos").getProperty(oLineItem.getBindingContext("pedidos").sPath);
        lineData.resIcon = statusOutput !== "Success" ? "sap-icon://warning" : "";
        lineData.resEnabled = true;
        lineData.resData = res;
        lineData.resState = statusOutput;
        try {
          lineData.StLibcomercial = res[0].MessageV1;
        } catch (error) {}
        lineData.StComercialCode = this.getModel("estatus").getData().approved;
        this.getModel("pedidos").setProperty(oLineItem.getBindingContext("pedidos").sPath, lineData);
        oLineItem.getAggregation("cells").find(x => x.sId.includes("resButton")).setBusy(false);
        oLineItem.setHighlight(statusOutput);
      },
      parseSubmitResult: function (data) {
        var ret = data.reduce((results, element) => {
          if (element.Type === "S") results.succ++;
          if (element.Type === "E") results.error++;
          return results;
        }, {
          succ: 0,
          error: 0
        });
        return (ret.error === 0 ? "Success" : ret.succ === 0 ? "Error" : "Warning");
      },
      manageLineBut: function (oControl, Approve, sFind) {
        if (Approve) {
          oControl.getParent().getAggregation("items").find(x => x.sId.includes(sFind)).setPressed(false);
        } else {
          oControl.getParent().getAggregation("items").find(x => x.sId.includes(sFind)).setPressed(false);
        }
      },
      onShowResults: function (oEvent) {
        console.log("onShowResults");
        var results = oEvent.getSource().getBindingContext("pedidos").getObject();
        if (!this.resultModel) {
          this.resultModel = new JSONModel(results.resData);
          this.setModel(this.resultModel, "resData");
        } else {
          this.resultModel.setData(results.resData);
        }
        this.createResFrag(results);
      },
      createResFrag: function (pedidoData) {
        const afterOpen = () => {
          this.byId("resDialog").setTitle(pedidoData.Vbeln);
          this.byId("resDialog").setState(pedidoData.resState);
        };
        if (!this.byId("resDialog")) {
          console.log("Frag Loading...");
          Fragment.load({
            id: this.getView().getId(),
            name: "godrej.liberacion.view.LineRes",
            controller: this,
          }).then(
            function (oDialog) {
              // connect dialog to the root view of this component (models, lifecycle)
              this.getView().addDependent(oDialog);
              console.log("Frag Loaded");
              oDialog.open();
              afterOpen();
            }.bind(this)
          );
        } else {
          this.byId("resDialog").open();
          afterOpen();
        }
      },
      testo: function (oEvent) {
        console.log("qwe");
      }
    });
  });