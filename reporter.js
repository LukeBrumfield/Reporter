var removeTotals = function() {
  removeTotalRow();
  removeTotalColumn();
};

var removeTotalColumn = function() {
  $('th.pvtTotalLabel').remove();
  $('.pvtGrandTotal').remove();
  $('.pvtTotal.rowTotal').remove();
};

var removeTotalRow = function() {
  $('.pvtTotalRow').remove();
};

var insertColumn = function(col1, col2, loc, label, type, data, container) {
  th = document.createElement("th");
  th.className = "pvtColLabel";
  th.innerHTML = label;

  var pos = container.find('.pvtLabelRow');

  if (loc == -1) {
    pos.append(th);
  } else {
    $(th).insertAfter(pos.children()[loc]);
  }

  var rows = container.find('.pvtDataRow');

  $.each(rows, function(i) {

    td = document.createElement("td");
    td.className = "pvtVal";
    var val;

    var x = this.children[col1].getAttribute("data-value");
    var y = this.children[col2].getAttribute("data-value");

    if (x == "null") {
      x = 0;
    }

    if (y == "null") {
      val = 0;
    } else {
      val = x / y;
      val = val.toFixed(2);
    }

    switch (type) {
      case "min":
        if (x < y)
          val = x;
        else {
          val = y;
        }
        break;
      case "max":
        if (x < y)
          val = y;
        else {
          val = x;
        }
        break;
      case "percent":
        val += "%";
        break;
      case "mean":
        break;
      case "label":
        val = data[i];
        break;
      default:
    }

    td.innerHTML = val;

    if (loc == -1) {
      this.appendChild(td);
    } else {
      $(td).insertAfter(this.children[loc]);
    }
  });


  var total = container.find('.pvtTotalRow');

  td = document.createElement("td");
  td.className = "pvtTotal";


  if (loc == -1) {
    total.append(td);
  } else {
    $(td).insertAfter(total.children()[loc]);
  }


};

/*
{
  "data": [
  {
    "Participant Status": "Number",
    "Disabled": "326",
    "Employed": "1188"
  },
  {
    "Highest Degree": "US-Based(NonUS)",
    "No Schooling" : "12(0)",
    "Grades1-5" : "38(12)"
  }
  ]
}

{"data":[{"Participant Status":"Number","Disabled":"326","Employed":"1188"},{"Highest Degree":"US-Based(NonUS)","No Schooling":"12(0)","Grades1-5":"38(12)"}]}

*/

var drawTable = function(data, container) {
  console.log(data.data);
  var header, label;
  header = true;
  $.each(data.data, function(i, obj) {
    label = true;
    Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      tr = document.createElement("tr");
      if (label) {
        tr.className = "label";
        label = false;
      }
      if (header) {
        tr.className = "headerRow";
        header = false;
      }
      td = document.createElement("td");
      td.textContent = key;
      td.className = "leftCol";
      tr.appendChild(td);
      td = document.createElement("td");
      td.textContent = val;
      td.className = "rightCol";
      tr.appendChild(td);
      container.append(tr);
    });
  });
};

var save = function() {
  $("#rowsave").text('');
  $("#colsave").text('');

  console.log("Rows");

  $(".pvtRows li span.pvtAttr").each(function(index) {
    console.log(index + ": " + "'" + $(this).text() + "'");
  });

  console.log("Cols");

  $(".pvtCols li span.pvtAttr").each(function(index) {
    console.log(index + ": " + "'" + $(this).text() + "'");
  });
};

var load = function(rows, cols) {
  var data = {};
  data.rows = rows;
  data.cols = cols;
  console.log(data);
  console.log(JSON.stringify(data));
  build(JSON.stringify(data));
};

var build = function(container) {

  var selected = [];

  var headers = [];
  var rawData = getData();
  var keys = getKeys();
  var defaults = getDefaults();
  var n = 0;

  $.each(defaults,
    function(i, val) {
      selected.push(i);
      headers.push(val);
      ++n;
    });

  $('#controls input:checked').each(function() {
    selected.push($(this).attr('id'));
  });

  console.log(selected);
  var inputFunction = function(callback) {
    rawData.forEach(function(element, index) {
      var sub = {};
      $.each(selected,
        function(i, val) {
          sub[keys[val]] = element[val - 1];
        });
      callback(sub);
    });
  };
  container.pivotUI(inputFunction, {});

  populateHeaders(n, headers);
};

var build3 = function(container) {

  var selected = [];
  var rawData = getData();
  var keys = getKeys();
  var defaults = getDefaults();

  $('#controls input').each(function() {
    selected.push($(this).attr('id'));
  });
  console.log(selected);
  var inputFunction = function(callback) {
    rawData.forEach(function(element, index) {
      var sub = {};
      $.each(selected,
        function(i, val) {
          sub[keys[val]] = element[val - 1];
        });
      callback(sub);
    });
  };
  var output = container.pivot(rawData, {
    rows: ["industry", "union"],
    cols: ["ethn"]
  });
};

var build2 = function(data, rows, cols, container) {

  var selected = [];
  var headers = [];
  var keys = getKeys();
  var defaults = getDefaults();

  //if (data == {}) {
  data = getData();
  //}

  $.each(defaults,
    function(i, val) {
      selected.push(i);
      headers.push(val);
    });

  $('#controls input').each(function() {
    selected.push($(this).attr('id'));
  });


  var inputFunction = function(callback) {
    data.forEach(function(element, index) {
      var sub = {};
      $.each(selected,
        function(i, val) {
          sub[keys[val]] = element[val - 1];
        });
      callback(sub);
    });
  };
  var output = container.pivot(inputFunction, {
    rows: rows,
    cols: cols
  });
};

var updateHeader = function(id) {
  var idval = id + "vals";
  $('#params').append("<tr><td>" + id + "</td><td id='" + idval + "'></td></tr>");
};

var populateHeaders = function(n, headers) {
  $('#params').empty();

  var offset = true;
  var containers = $('.pvtCheckContainer');

  for (var i = 0; i < n; i++) {
    var valList = [];
    var idval = headers[i] + "vals";

    var x = $('.pvtCheckContainer')[i].childElementCount;
    for (j = 0; j < x; j++) {
      if (containers[i].children[j].children[0].children[0].checked) {
        valList.push(containers[i].children[j].children[0].children[1].innerHTML);
      }
    }
    $('#params').append("<tr><td>" + headers[i] + "</td><td id='" + idval + "'>" + valList + "</td></tr>");
  }
};
