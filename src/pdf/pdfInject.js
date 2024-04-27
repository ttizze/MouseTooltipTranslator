'use strict';




async function initPdf() {
  checkCurrentUrlIsLocalFileUrl();
  addCallbackForPdfTextLoad(addSpaceBetweenPdfText);  
  await waitUntilPdfLoad();
  changeUrlParam();
}
initPdf();

//if current url is local file and no file permission
//alert user need permmsion
function checkCurrentUrlIsLocalFileUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("file");

  if (/^file:\/\//.test(url)) {
    //check current url is file url
    chrome.extension.isAllowedFileSchemeAccess((isAllowedAccess) => {
      //check file url permmision
      if (isAllowedAccess == false) {
        alert(`
    ------------------------------------------------------------------
    Hover translator require permission for local pdf file.
    User need to turn on 'Allow access to file URLs' from setting.
    This page will be redirected to setting page after confirm.
    -------------------------------------------------------------------`);
        openSettingPage(window.location.host);
      }
    });
  }
}

function openSettingPage(id) {
  chrome.tabs.create({
    url: "chrome://extensions/?id=" + id,
  });
}


function addCallbackForPdfTextLoad(callback) { 
    document.addEventListener("webviewerloaded", function() {
      PDFViewerApplication.initializedPromise.then(function() {
        PDFViewerApplication.eventBus.on("documentloaded", function(event) { //when pdf loaded
          window.PDFViewerApplication.eventBus.on('textlayerrendered', function pagechange(evt) { //when textlayerloaded
            callback();
          })
        });
      });
    }); 
}

function waitUntilPdfLoad(){
  return new Promise((resolve, reject) => {
    addCallbackForPdfTextLoad(resolve);
  });
}

function changeUrlParam() {
  var baseUrl=window.location.origin+window.location.pathname
  var fileParam=window.location.search.slice(6)  //slice "?page="

  //url is decoded, redirect with encoded url to read correctly in pdf viewer
  if(decodeURIComponent(fileParam)==fileParam){
    redirect(baseUrl+"?file="+encodeURIComponent(fileParam))
  }

  //change to decoded url for ease of url copy
  changeUrlWithoutRedirect(decodeURIComponent(fileParam));
}

function redirect(url){
  window.location.replace(url);
}
function changeUrlWithoutRedirect(fileParam){
  history.replaceState("", "", "/pdfjs/web/viewer.html?file="+fileParam);
}




function addSpaceBetweenPdfText() {
  // remove all br
  document.querySelectorAll('br').forEach(function(item, index) {
    item.remove();
  });

  // add manual new line
  var lastY;
  var lastLeft;
  var lastFontSize;
  var lastItem;
  var lines = [];

  document.querySelectorAll(".page span[role='presentation']").forEach(function(item, index) {
    var currentY = parseFloat(item.getBoundingClientRect().top);
    var currentLeft = parseFloat(item.getBoundingClientRect().left);
    var currentFontSize = parseFloat(window.getComputedStyle(item).fontSize);

    if (index === 0) { //skip first index
      lines.push({ top: currentY, left: currentLeft, text: item.textContent.trimStart(), item: item, fontSize: currentFontSize });
    } else {
      var line = lines[lines.length - 1];
      //フォントサイズがほぼ同じで､同じ段落にある場合(今の行の上下に前の行のフォントサイズの2倍以上の空白がない場合)は､前の行のテキストに今の行のテキストを追加する
      if (Math.abs(line.fontSize - currentFontSize) < 0.1 && !(lastY < currentY - lastFontSize * 1.5 || currentY + lastFontSize * 1.5 < lastY)) {
        line.text += ' ' + item.textContent;
        line.item.textContent = line.text;
        item.remove(); // remove this item as its text is now included in the first item
      } else {
        lines.push({ top: currentY, left: currentLeft, text: item.textContent.trimStart(), item: item, fontSize: currentFontSize });
      }
    }
    lastY = currentY;
    lastLeft = currentLeft;
    lastFontSize = currentFontSize;
    lastItem = item;
  });
}