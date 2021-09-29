sap.ui.define(["godrej/liberacion/controller/BaseController"], function (BaseController) {
  "use strict";
  return {
    setSelectedKey: function (val) {
      var key = this.stepsDic.filter((element) => {
        return element.text === val
      });
      return (key.length>0 ? key[0].key : val);;
    },
    setIcon: function (val) {
      var icon = this.stepsDic.filter((element) => {
        return element.text === val
      })
      return (icon.length>0 ? icon[0].icon : val);
    },
    date: function (dat) {
      if (dat) {
        return new Date( dat.substr(0, 4), dat.substr(4, 2), dat.substr(6, 2)).toLocaleDateString('es-US', {
          weekday: "short", // long, short, narrow
          day: "numeric", // numeric, 2-digit
          year: "numeric", // numeric, 2-digit
          month: "long"
        });
      }
    },
    fooErdat1:function(e){if(e){var r=e.split("");var t=r[6]+r[7]+" "+"/"+" "+r[4]+r[5]+" "+"/"+" "+r[0]+r[1]+r[2]+r[3];return t}},
    formatDate: function (dat) {
      if (dat) {
        if (dat === "00000000") {
          dat = "";
        } else {
          var y = dat.substr(0, 4);
          var m = dat.substr(4, 2);
          var d = dat.substr(6, 2);
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var i = 1,
            month = "";
          for (i; i <= months.length; i++) {
            if (i == m) {
              month = months[i - 1];
            }
          }
          if (m === "00") {
            month = "000";
          }
          var modDate = d + "-" + month + "-" + y;
          return modDate;
        }
      }
      return dat;
    },
  };
});