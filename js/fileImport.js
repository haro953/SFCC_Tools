// Format XML with proper indentation
function formatXml(xml) {
  var formatted = '';
  var indent = '';
  var indentSize = 2;
  
  xml.split(/(<[^>]+>)/g).forEach(function(node) {
    if (node.match(/^<\/\w/)) {
      indent = indent.substring(0, Math.max(0, indent.length - indentSize));
    }
    if (node.trim()) {
      formatted += indent + node + '\n';
    }
    if (node.match(/^<\w[^>]*[^\/]>$/) && !node.match(/^<\w[^>]*\/>$/)) {
      indent += ' '.repeat(indentSize);
    }
  });
  
  return formatted.trim();
}

// Check if content is XML
function isXml(filename) {
  return filename.toLowerCase().endsWith('.xml');
}

$("#fileimport").on('change', function(event) {
  $('.numberTimes').html('# Of');
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var fileContent = reader.result;
    var fileLength = fileContent.length;
    var formattedContent = isXml(input.files[0].name) ? formatXml(fileContent) : fileContent;
    fileimport.files[0].name ? $('.fileNameToMerge').text(fileimport.files[0].name) : $('.fileNameToMerge').text('No File Currently Selected');
    $('.fileToMerge').text(formattedContent);
  }
  reader.readAsText(input.files[0]);
});

$("#fileimportMainFile").on('change', function(event) {
  $('.numberTimes').html('# Of');
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var fileContent = reader.result;
    var fileLength = fileContent.length;
    var formattedContent = isXml(input.files[0].name) ? formatXml(fileContent) : fileContent;
    fileimportMainFile.files[0].name ? $('.fileNameToMergeMain').text(fileimportMainFile.files[0].name) : $('.fileNameToMergeMain').text('No File Currently Selected');
    $('.fileRecieveingMerge').text(formattedContent);
  }
  reader.readAsText(input.files[0]);
});

$('.searchbox').on('keyup', function(){
  var locate = $('.searchbox').val();
  var text = $('.fileToMerge').text().toLowerCase();
  var wordToMatch = new RegExp(locate,'g');
  var count = (text.match(wordToMatch)).length;
  var highlighted = text.replace(wordToMatch,'<span class="marked">' + locate + '</span>');
  $('.fileToMerge').html(highlighted);
  $('.numberTimes').html(count);
});

// Clear handlers use textarea .val()
$('.clearAllTop').on('click', function(){
  $('.fileToMerge').val('');
  $('.fileSearch').val('');
  $('.fileNameToMerge').text('No File Currently Selected');
});

$('.clearAllBottom').on('click', function(){
  $('.fileRecieveingMerge').val('');
  $('.fileSearch').val('');
  $('.fileNameToMergeMain').text('No File Currently Selected');
});

$('.clearAllMerge').on('click', function(){
  $('.mergedTextForDownload').val('');
});

$('#downloadMergedButton').on('click', function(){
  var content = $('.mergedTextForDownload').val();
  var blob = new Blob([content], { type: "application/xml;charset=utf-8" });
  var url = window.URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  var now = new Date();
  var timestamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '_' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
  link.download = "merged_" + timestamp + ".xml";
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
});

// Helper: extract root name
function getRootName(xml) {
  var tagMatch = xml.match(/<\s*([\w:-]+)/);
  return tagMatch ? tagMatch[1] : null;
}

// Helper: get inner content of root element
function getRootInner(xml) {
  var root = getRootName(xml);
  if (!root) return xml;
  var open = new RegExp('<\\s*' + root + '[^>]*>','i');
  var close = new RegExp('<\\/\\s*' + root + '\\s*>','i');
  var openMatch = xml.match(open);
  var closeMatch = xml.match(close);
  if (!openMatch || !closeMatch) return xml;
  var start = xml.indexOf(openMatch[0]) + openMatch[0].length;
  var end = xml.lastIndexOf(closeMatch[0]);
  return xml.substring(start, end);
}

// Parse immediate child elements under root, preserving full text (including nested children)
function getTopLevelElements(xml) {
  var inner = getRootInner(xml);
  var elements = [];
  var i = 0;
  while (i < inner.length) {
    var lt = inner.indexOf('<', i);
    if (lt === -1) break;
    // skip comments or declarations
    if (inner.substr(lt,4) === '<!--') {
      var endc = inner.indexOf('-->', lt+4);
      if (endc === -1) break;
      elements.push(inner.substring(lt, endc+3).trim());
      i = endc + 3;
      continue;
    }
    if (inner.substr(lt,2) === '<?') {
      var endp = inner.indexOf('?>', lt+2);
      if (endp === -1) break;
      elements.push(inner.substring(lt, endp+2).trim());
      i = endp + 2;
      continue;
    }

    // if it's a closing tag, skip
    if (inner.substr(lt,2) === '</') { i = lt + 2; continue; }

    // get tag name
    var tagMatch = inner.substring(lt).match(/^<\s*([\w:-]+)/);
    if (!tagMatch) { i = lt + 1; continue; }
    var tag = tagMatch[1];

    // self-closing?
    var selfClose = inner.indexOf('/>', lt) !== -1 && inner.indexOf('/>', lt) < inner.indexOf('>', lt+1);
    if (selfClose) {
      var endIdx = inner.indexOf('/>', lt) + 2;
      elements.push(inner.substring(lt, endIdx).trim());
      i = endIdx;
      continue;
    }

    // otherwise find matching closing tag using a stack for same tag name
    var pos = lt;
    var depth = 0;
    while (pos < inner.length) {
      var nextOpen = inner.indexOf('<', pos);
      if (nextOpen === -1) break;
      var nextClose = inner.indexOf('>', nextOpen+1);
      if (nextClose === -1) break;
      var tagText = inner.substring(nextOpen, nextClose+1);
      if (tagText.match(new RegExp('^<\\s*' + tag + '(\\s|>)','i'))) {
        depth++;
      } else if (tagText.match(new RegExp('^<\\/\\s*' + tag + '\\s*>','i'))) {
        depth--;
        if (depth === 0) {
          // include up to nextClose
          elements.push(inner.substring(lt, nextClose+1).trim());
          pos = nextClose+1;
          break;
        }
      }
      pos = nextClose+1;
    }
    i = pos;
  }
  return elements;
}

// Merge button: compare elements and add missing ones into mainFile before root closing tag
$('.mergeAll, #mergeBtn').on('click', function(){
  var mainFile = $('.fileRecieveingMerge').val ? $('.fileRecieveingMerge').val() : $('.fileRecieveingMerge').text();
  var fileToMerge = $('.fileToMerge').val ? $('.fileToMerge').val() : $('.fileToMerge').text();

  if (!fileToMerge) {
    $('.mergedTextForDownload').val(mainFile || '');
    return;
  }
  if (!mainFile) {
    $('.mergedTextForDownload').val(fileToMerge);
    return;
  }

  var mainRoot = getRootName(mainFile);
  var mergeRoot = getRootName(fileToMerge);
  // If roots differ, fallback to line-based append
  if (!mainRoot || !mergeRoot || mainRoot !== mergeRoot) {
    var merged = mainFile + '\n' + fileToMerge;
    $('.mergedTextForDownload').val(formatXml(merged));
    return;
  }

  var mainElements = getTopLevelElements(mainFile);
  var mergeElements = getTopLevelElements(fileToMerge);

  // compare by trimmed string equality
  var existing = {};
  mainElements.forEach(function(e){ existing[e.trim()] = true; });

  var toAdd = [];
  mergeElements.forEach(function(e){
    var t = e.trim();
    if (!existing[t]) {
      toAdd.push(e);
      existing[t] = true;
    }
  });

  if (toAdd.length === 0) {
    $('.mergedTextForDownload').val(formatXml(mainFile));
    return;
  }

  // insert before closing root tag
  var closingTag = new RegExp('(<\\/\\s*' + mainRoot + '\\s*>)','i');
  var match = mainFile.match(closingTag);
  var insertPos = -1;
  if (match) insertPos = mainFile.toLowerCase().lastIndexOf(match[1].toLowerCase());
  if (insertPos === -1) insertPos = mainFile.length;

  var insertion = '\n' + toAdd.join('\n') + '\n';
  var mergedContent = mainFile.slice(0, insertPos) + insertion + mainFile.slice(insertPos);
  $('.mergedTextForDownload').val(formatXml(mergedContent));
});