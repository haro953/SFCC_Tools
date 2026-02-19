function formatXml(xml) {
  var formatted = '';
  var indent = '';
  var indentSize = 4;
  
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
  
  var result = formatted;
  var lines = result.split('\n');
  var numbered = lines.map(function(line, index) {
    return (index + 1) + ': ' + line;
  });
  return numbered.join('\n');
}

function formatJson(json) {
  var formatted = '';
  var indent = '';
  var indentSize = 4;
  
  for (var i = 0; i < json.length; i++) {
    var char = json[i];
    
    if (char === '{' || char === '[') {
      formatted += char + '\n';
      indent += ' '.repeat(indentSize);
      formatted += indent;
    } else if (char === '}' || char === ']') {
      indent = indent.substring(0, Math.max(0, indent.length - indentSize));
      formatted += '\n' + indent + char;
    } else if (char === ',') {
      formatted += char + '\n' + indent;
    } else if (char === ':') {
      formatted += char + ' ';
    } else if (char !== ' ' && char !== '\n' && char !== '\r' && char !== '\t') {
      formatted += char;
    }
  }
  
  var result = formatted;
  var lines = result.split('\n');
  var numbered = lines.map(function(line, index) {
    return (index + 1) + ': ' + line;
  });
  return numbered.join('\n');
}

function formatJavaScript(js) {
  var formatted = '';
  var indent = '';
  var indentSize = 4;
  
  for (var i = 0; i < js.length; i++) {
    var char = js[i];
    var prevChar = i > 0 ? js[i - 1] : '';
    var nextChar = i < js.length - 1 ? js[i + 1] : '';
    
    if (char === '{') {
      formatted += char + '\n';
      indent += ' '.repeat(indentSize);
      formatted += indent;
    } else if (char === '}') {
      indent = indent.substring(0, Math.max(0, indent.length - indentSize));
      formatted += '\n' + indent + char;
      if (nextChar === ';' || nextChar === ',') {
        formatted += nextChar;
        i++;
      }
      if (js[i + 1] !== '}') {
        formatted += '\n' + indent;
      }
    } else if (char === ';') {
      formatted += char;
      if (nextChar !== '\n' && nextChar !== '') {
        formatted += '\n' + indent;
      }
    } else if (char === ',') {
      formatted += char + ' ';
    } else if (char !== ' ' && char !== '\n' && char !== '\r' && char !== '\t') {
      formatted += char;
    }
  }
  
  var result = formatted;
  var lines = result.split('\n');
  var numbered = lines.map(function(line, index) {
    return (index + 1) + ': ' + line;
  });
  return numbered.join('\n');
}

// update logic here in the future to allow xml files to retain all charecters
// update to fix edge cases with some js files where formatting is not correct and causes issues with the compare function
// update formatting functions to keep closing tags on the same line if they are like that in the file to make it easier to compare files that have different formatting but are otherwise the same. This will be an option that can be toggled on and off.
$("#fileimportLeft").on('change', function(event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var fileContent = reader.result;
    var fileLength = fileContent.length;
    // remove lines that are whole-line comments starting with //
    fileContent = fileContent.split('\n').filter(function(line){ return !line.trim().startsWith('//'); }).join('\n');
    var fileName = input.files[0].name;
    var fileExtension = fileName.split('.').pop().toLowerCase();
    var formattedContent = fileContent;
    
    fileimportLeft.files[0].name ? $('.fileNameLeft').text(fileimportLeft.files[0].name) : $('.fileNameLeft').text('No File Currently Selected');
    
    if (fileExtension === 'xml') {
      formattedContent = formatXml(fileContent);
    } else if (fileExtension === 'json') {
      formattedContent = formatJson(fileContent);
    } else if (fileExtension === 'js') {
      formattedContent = formatJavaScript(fileContent);
    }
    
    $('.leftTextDump').html(`<pre>${formattedContent}</pre>`);
  }
  reader.readAsText(input.files[0]);
});

$("#fileimportRight").on('change', function(event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var fileContent = reader.result;
    var fileLength = fileContent.length;
    // remove lines that are whole-line comments starting with //
    fileContent = fileContent.split('\n').filter(function(line){ return !line.trim().startsWith('//'); }).join('\n');
    var fileName = input.files[0].name;
    var fileExtension = fileName.split('.').pop().toLowerCase();
    var formattedContent = fileContent;
    
    fileimportRight.files[0].name ? $('.fileNameRight').text(fileimportRight.files[0].name) : $('.fileNameRight').text('No File Currently Selected');
    
    if (fileExtension === 'xml') {
      formattedContent = formatXml(fileContent);
    } else if (fileExtension === 'json') {
      formattedContent = formatJson(fileContent);
    } else if (fileExtension === 'js') {
      formattedContent = formatJavaScript(fileContent);
    }
    
    $('.rightTextDump').html(`<pre>${formattedContent}</pre>`);
  }
  reader.readAsText(input.files[0]);
});

$('.clearAllLeft').on('click', function(){
  $('.leftTextDump').empty();
  $('.fileSearchLeft').val('');
  $('.fileNameLeft').text('No File Currently Selected');
});

$('.clearAllRight').on('click', function(){
  $('.rightTextDump').empty();
  $('.fileSearchRight').val('');
  $('.fileNameRight').text('No File Currently Selected');
});

$('.compare').on('click', function(){
  var leftContentRaw = $('.leftTextDump').find('pre').text() || $('.leftTextDump').text();
  var rightContentRaw = $('.rightTextDump').find('pre').text() || $('.rightTextDump').text();
  
  var leftContent = leftContentRaw.split('\n');
  var rightContent = rightContentRaw.split('\n');
  
  var leftHighlighted = '';
  var rightHighlighted = '';
  
  var maxLines = Math.max(leftContent.length, rightContent.length);
  
  for (var i = 0; i < maxLines; i++) {
    var leftLine = leftContent[i] || '';
    var rightLine = rightContent[i] || '';
    
    if (leftLine !== rightLine) {
      leftHighlighted += `<div style="background-color: #ffcccc; color: #8b0000;">${leftLine}</div>`;
      rightHighlighted += `<div style="background-color: #ccffcc; color: #006400;">${rightLine}</div>`;
    } else {
      leftHighlighted += `<div>${leftLine}</div>`;
      rightHighlighted += `<div>${rightLine}</div>`;
    }
  }
  
  $('.leftTextDump').html(`<pre>${leftHighlighted}</pre>`);
  $('.rightTextDump').html(`<pre>${rightHighlighted}</pre>`);
});
