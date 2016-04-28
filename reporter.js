var insertColumn = function(container, col1, col2, loc, label, type, data) {

  th = document.createElement("th");
  th.className = "pvtColLabel";
  th.setAttribute("rowspan", container.find('.pvtAxisLabel').attr('rowspan'));
  th.innerHTML = label;

  var pos = container.find('.pvtLabelRow').first();
  if (loc == -1) {
    pos.append(th);
  } else {
    $(th).insertAfter(pos.children()[loc]);
  }

  var rows = container.find('.pvtDataRow');

  $.each(rows, function(i) {
    td = document.createElement("td");
    td.className = "pvtVal";
    var val, cells;

    var row = $(this).children('.pvtVal, .pvtTotal');

    var x = row[col1].getAttribute("data-value");
    var y = row[col2].getAttribute("data-value");

    if (x == "null") {
      x = 0;
    }

    if (y == "null") {
      val = 0;
    } else {
      val = x / y;
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
        val *= 100;
        val = val.toFixed(2);
        val += "%";
        break;
      case "ratio":
        val = val.toFixed(2);
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
  if (data.length > rows.length) {
    td.innerHTML = data.pop();
  }
  if (loc == -1) {
    total.append(td);
  } else {
    $(td).insertAfter(total.children()[loc]);
  }
};

var reporter = function(container, data, keys, rows, cols, instructions) {
  buildTable(data, keys, rows, cols, container);
  $.each(instructions, function(i, val) {
    switch (val[0]) {
      case ("col"):
        {
          insertColumn(container, val[1], val[2], val[3], val[4], val[5], val[6]);
          break;
        }
      case ("rmTotalRows"):
        {
          removeTotalRow(container);
          break;
        }
      case ("rmTotalCols"):
        {
          removeTotalColumn(container);
          break;
        }
      case ("rmTotals"):
        {
          removeTotals(container);
          break;
        }
    }
  });
};

var buildTable = function(data, keys, rows, cols, container) {

  var selected = [];
  var rows2 = [];
  var cols2 = [];

  $.each(rows,
    function(i, val) {
      selected.push(val);
      rows2.push(keys[val]);
    });

  $.each(cols,
    function(i, val) {
      selected.push(val);
      cols2.push(keys[val]);
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
    rows: rows2,
    cols: cols2
  });
};

var buildUI = function(container) {

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

var removeTotals = function(container) {
  removeTotalRow(container);
  removeTotalColumn(container);
};

var removeTotalColumn = function(container) {
  container.children().find('th.pvtTotalLabel').remove();
  container.children().find('.pvtGrandTotal').remove();
  container.children().find('.pvtTotal.rowTotal').remove();
};

var removeTotalRow = function(container) {
  container.children().find('.pvtTotalRow').remove();
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

var build3 = function(container) {

  var selected = [];
  var rawData = getData();
  var keys = getKeys();
  var defaults = getDefaults();

  $('#controls input').each(function() {
    selected.push($(this).attr('id'));
  });

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
