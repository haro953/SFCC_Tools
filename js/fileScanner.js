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
  
  return formatted.trim();
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
  
  return formatted.trim();
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
  
  return formatted.trim();
}


$("#fileimport").on('change', function(event) {
  $('.numberTimes').html('# Of');
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    var fileContent = reader.result;
    var fileLength = fileContent.length;
    var fileName = input.files[0].name;
    var fileExtension = fileName.split('.').pop().toLowerCase();
    var formattedContent = fileContent;
    
    fileimport.files[0].name ? $('.fileName').text(fileimport.files[0].name) : $('.fileName').text('No File Currently Selected');
    
    if (fileExtension === 'xml') {
      formattedContent = formatXml(fileContent);
    } else if (fileExtension === 'json') {
      formattedContent = formatJson(fileContent);
    } else if (fileExtension === 'js') {
      formattedContent = formatJavaScript(fileContent);
    }
    
    $('.textdump').html(`<pre>${formattedContent}</pre>`);
  }
  reader.readAsText(input.files[0]);
});

$('.searchbox').on('keyup', function(){
  var locate = $('.searchbox').val();
  var text = $('.textdump').text();
  var escapedLocate = locate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var wordToMatch = new RegExp(escapedLocate,'g');
  var count = (text.match(wordToMatch) || []).length;
  var highlighted = text.replace(wordToMatch,'<span class="marked">' + locate + '</span>');
  $('.textdump').html(`<pre>${highlighted}</pre>`);
  $('.numberTimes').html(count);
});

$('.clearAll').on('click', function(){
  $('.textdump').empty();
  $('.searchbox').val('');
  $('.fileSearch').val('');
  $('.numberTimes').html('# Of');
  $('.fileName').text('No File Currently Selected');
});
