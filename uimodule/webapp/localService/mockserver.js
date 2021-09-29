sap.ui.define(
  [
    "sap/ui/core/util/MockServer",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/base/util/UriParameters",
  ],
  function (MockServer, JSONModel, Log, UriParameters) {
    "use strict";

    var oMockServer,
      _sAppPath = "godrej/liberacion/",
      _sJsonFilesPath = _sAppPath + "localService/mockdata";

    var oMockServerInterface = {
      /**
       * Initializes the mock server asynchronously.
       * You can configure the delay with the URL parameter "serverDelay".
       * The local mock data in this folder is returned instead of the real data for testing.
       * @protected
       * @param {object} [oOptionsParameter] init parameters for the mockserver
       * @returns{Promise} a promise that is resolved when the mock server has been started
       */
      init: function (oOptionsParameter) {
        var oOptions = oOptionsParameter || {};

        return new Promise(function (fnResolve, fnReject) {
          var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
            oManifestModel = new JSONModel(sManifestUrl);

          oManifestModel.attachRequestCompleted(function () {
            var oUriParameters = new UriParameters(window.location.href),
              // parse manifest for local metadata URI
              sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath),
              oMainDataSource = oManifestModel.getProperty(
                "/sap.app/dataSources/mainService"
              ),
              sMetadataUrl = sap.ui.require.toUrl(
                _sAppPath + oMainDataSource.settings.localUri
              ),
              // ensure there is a trailing slash
              sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ?
              oMainDataSource.uri :
              oMainDataSource.uri + "/";
            // ensure the URL to be relative to the application
            // sMockServerUrl = sMockServerUrl && new URI(sMockServerUrl).absoluteTo(sap.ui.require.toUrl(_sAppPath)).toString();

            // create a mock server instance or stop the existing one to reinitialize
            if (!oMockServer) {
              oMockServer = new MockServer({
                rootUri: sMockServerUrl,
              });
            } else {
              oMockServer.stop();
            }

            // configure mock server with the given options or a default delay of 0.5s
            MockServer.config({
              autoRespond: true,
              autoRespondAfter: oOptions.delay || oUriParameters.get("serverDelay") || 500,
            });

            // simulate all requests using mock data
            oMockServer.simulate(sMetadataUrl, {
              sMockdataBaseUrl: sJsonFilesUrl,
              bGenerateMissingMockData: true,
            });

            var aRequests = oMockServer.getRequests();

            // compose an error response for each request
            var fnResponse = function (iErrCode, sMessage, aRequest) {
              aRequest.response = function (oXhr) {
                oXhr.respond(
                  iErrCode, {
                    "Content-Type": "text/plain;charset=utf-8",
                  },
                  sMessage
                );
              };
            };

            // simulate metadata errors
            if (oOptions.metadataError || oUriParameters.get("metadataError")) {
              aRequests.forEach(function (aEntry) {
                if (aEntry.path.toString().indexOf("$metadata") > -1) {
                  fnResponse(500, "metadata Error", aEntry);
                }
              });
            }

            // simulate request errors
            var sErrorParam =
              oOptions.errorType || oUriParameters.get("errorType"),
              iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
            if (sErrorParam) {
              aRequests.forEach(function (aEntry) {
                fnResponse(iErrorCode, sErrorParam, aEntry);
              });
            }

            // custom mock behaviour may be added here

            // set requests and start the server
            oMockServer.setRequests(aRequests);
            oMockServer.start();

            Log.info("Running the app with mock data");
            oMockServer.attachAfter(
              sap.ui.core.util.MockServer.HTTPMETHOD.POST,
              function (oCall) {
                switch (oCall.mParameters.oEntity.Cadena) {
                  case "VUELTA":
                    var pedidos = [{
                      Status: "paso1",
                      Vbeln: "123",
                      Erdat: "20210830",
                      DateActual: "20211230",
                    }, {
                      Status: "paso3",
                      Vbeln: "456",
                      Erdat: "20210904",
                      DateActual: "20211231",
                    }];
                    oCall.mParameters.oEntity.to_vuelta.results = pedidos;

                    break;
                  case "CAMBIO":
                    var pedidos = [{
                      Field: "",
                      Id: "V4",
                      LogMsgNo: "000000",
                      LogNo: "",
                      Message: "ORDER_HEADER_IN has been processed successfully",
                      MessageV1: "VBAKKOM",
                      MessageV2: "10317202",
                      MessageV3: "",
                      MessageV4: "",
                      Number: "233",
                      Parameter: "ORDER_HEADER_IN",
                      Row: "0 ",
                      System: "CETCLNT300",
                      Type: "W"
                    }, {
                      Field: "",
                      Id: "V4",
                      LogMsgNo: "000000",
                      LogNo: "",
                      Message: "SCHEDULE_IN has been processed successfully",
                      MessageV1: "VBEPKOM",
                      MessageV2: "",
                      MessageV3: "",
                      MessageV4: "",
                      Number: "233",
                      Parameter: "SCHEDULE_IN",
                      Row: "1 ",
                      System: "CETCLNT300",
                      Type: "W"
                    }, {
                      Field: "",
                      Id: "V4",
                      LogMsgNo: "000000",
                      LogNo: "",
                      Message: "SCHEDULE_IN has been processed successfully",
                      MessageV1: "VBEPKOM",
                      MessageV2: "",
                      MessageV3: "",
                      MessageV4: "",
                      Number: "233",
                      Parameter: "SCHEDULE_IN",
                      Row: "2 ",
                      System: "CETCLNT300",
                      Type: "W"
                    }, {
                      Field: "",
                      Id: "V1",
                      LogMsgNo: "000000",
                      LogNo: "",
                      Message: "AR : Free Sales 10317202 has been saved",
                      MessageV1: "AR : Free Sales",
                      MessageV2: "10317202",
                      MessageV3: "",
                      MessageV4: "",
                      Number: "311",
                      Parameter: "ORDER_HEADER_IN",
                      Row: "0 ",
                      System: "CETCLNT300",
                      Type: "E"
                    }];
                    oCall.mParameters.oEntity.to_cambio = pedidos;

                  default:
                    break;
                }
                console.log("Get pedidos");
              },
              "BaseSet"
            );
            oMockServer.attachBefore(
              sap.ui.core.util.MockServer.HTTPMETHOD.GET,
              function (oCall) {
                console.log("mockcall3");
              },
              "Orders"
            );

            fnResolve();
          });

          oManifestModel.attachRequestFailed(function () {
            var sError = "Failed to load application manifest";

            Log.error(sError);
            fnReject(new Error(sError));
          });
        });
      },

      /**
       * @public returns the mockserver of the app, should be used in integration tests
       * @returns {sap.ui.core.util.MockServer} the mockserver instance
       */
      getMockServer: function () {
        return oMockServer;
      },
    };

    return oMockServerInterface;
  }
);